"use server";

import { studentRecordsPage } from "@/constants";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";

const maxFileSize = 5 * 1024 * 1024;
const maxRecords = 20000;

type StudentRecordColumn =
   | "id_number"
   | "firstname"
   | "middlename"
   | "lastname"
   | "yearlevel"
   | "college"
   | "program";

const headerAliases: Partial<Record<string, StudentRecordColumn>> = {
   idnumber: "id_number",
   studentid: "id_number",
   firstname: "firstname",
   middlename: "middlename",
   lastname: "lastname",
   yearlevel: "yearlevel",
   college: "college",
   program: "program",
};

const requiredColumns: StudentRecordColumn[] = [
   "id_number",
   "firstname",
   "lastname",
   "yearlevel",
   "college",
   "program",
];

function validationError(message: string) {
   return { ok: false as const, error: "VALIDATION" as const, message };
}

export default async function importStudentRecords(
   formData: FormData,
): ActionResult<{ message: string; created: number; skipped: number }> {
   const session = await auth();
   if (session?.user.role !== "ADMIN") {
      return { ok: false, error: "FORBIDDEN", message: "Unauthorized" };
   }

   const file = formData.get("file");
   if (!(file instanceof File) || file.size === 0) {
      return validationError("Choose an XLSX file to import.");
   }
   if (!file.name.toLowerCase().endsWith(".xlsx")) {
      return validationError("The selected file must be an .xlsx workbook.");
   }
   if (file.size > maxFileSize) {
      return validationError("The workbook must be 5 MB or smaller.");
   }

   let rows: unknown[][];
   try {
      const workbook = XLSX.read(Buffer.from(await file.arrayBuffer()), {
         type: "buffer",
      });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = firstSheetName
         ? workbook.Sheets[firstSheetName]
         : undefined;
      if (!worksheet) {
         return validationError("The workbook does not contain a worksheet.");
      }

      rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
         header: 1,
         raw: false,
         defval: "",
         blankrows: true,
      });
   } catch {
      return validationError("Unable to read this workbook. Check the file and try again.");
   }

   if (rows.length < 2) {
      return validationError("The worksheet must include a header row and at least one student.");
   }

   const headerRow = rows[0];
   const columns: Partial<Record<StudentRecordColumn, number>> = {};
   const duplicateHeaders: string[] = [];

   headerRow.forEach((value, index) => {
      const normalizedHeader = String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
      const column = headerAliases[normalizedHeader];
      if (!column) return;
      if (columns[column] !== undefined) {
         duplicateHeaders.push(String(value));
      } else {
         columns[column] = index;
      }
   });

   if (duplicateHeaders.length > 0) {
      return validationError(
         `The worksheet contains duplicate columns: ${duplicateHeaders.join(", ")}.`,
      );
   }

   const missingColumns = requiredColumns.filter(
      (column) => columns[column] === undefined,
   );
   if (missingColumns.length > 0) {
      return validationError(
         `Missing required columns: ${missingColumns.join(", ")}.`,
      );
   }

   const studentRows = rows
      .slice(1)
      .map((row, index) => ({ row, rowNumber: index + 2 }))
      .filter(({ row }) =>
         row.some((value) => String(value).trim() !== ""),
      );
   if (studentRows.length > maxRecords) {
      return validationError(
         `A workbook can contain at most ${maxRecords} student records.`,
      );
   }
   if (studentRows.length === 0) {
      return validationError("The worksheet does not contain any student records.");
   }

   const errors: string[] = [];
   const seenIds = new Set<string>();
   const records: {
      id_number: string;
      firstname: string;
      middlename: string | null;
      lastname: string;
      yearlevel: number;
      college: string;
      program: string;
   }[] = [];
   const valueFor = (row: unknown[], column: StudentRecordColumn) => {
      const index = columns[column];
      return index === undefined ? "" : String(row[index] ?? "").trim();
   };

   studentRows.forEach(({ row, rowNumber }) => {
      const id_number = valueFor(row, "id_number");
      const firstname = valueFor(row, "firstname");
      const middlename = valueFor(row, "middlename") || null;
      const lastname = valueFor(row, "lastname");
      const yearText = valueFor(row, "yearlevel");
      const yearlevel = Number(yearText);
      const college = valueFor(row, "college");
      const program = valueFor(row, "program");
      const rowErrors: string[] = [];

      if (!id_number) rowErrors.push("ID number is required");
      if (!firstname) rowErrors.push("first name is required");
      if (!lastname) rowErrors.push("last name is required");
      if (!yearText || !Number.isSafeInteger(yearlevel) || yearlevel < 1) {
         rowErrors.push("year level must be a positive whole number");
      }
      if (!college) rowErrors.push("college is required");
      if (!program) rowErrors.push("program is required");
      if (id_number && seenIds.has(id_number)) {
         rowErrors.push(`duplicate ID number "${id_number}" in workbook`);
      }

      if (rowErrors.length > 0) {
         errors.push(`Row ${rowNumber}: ${rowErrors.join(", ")}.`);
         return;
      }

      seenIds.add(id_number);
      records.push({
         id_number,
         firstname,
         middlename,
         lastname,
         yearlevel,
         college,
         program,
      });
   });

   if (errors.length > 0) {
      const shownErrors = errors.slice(0, 10);
      const remaining = errors.length - shownErrors.length;
      return validationError(
         `No records were imported. ${shownErrors.join(" ")}${
            remaining > 0 ? ` And ${remaining} more row(s) need correction.` : ""
         }`,
      );
   }

   try {
      const result = await prisma.studentRecord.createMany({
         data: records,
         skipDuplicates: true,
      });
      const skipped = records.length - result.count;
      revalidatePath(studentRecordsPage);

      return {
         ok: true,
         data: {
            created: result.count,
            skipped,
            message: `Imported ${result.count} ${
               result.count === 1 ? "student record" : "student records"
            }${skipped > 0 ? `; skipped ${skipped} existing ID(s)` : ""}.`,
         },
      };
   } catch (error) {
      console.error(error);
      return {
         ok: false,
         error: "DATABASE",
         message: "Unable to import student records. Please try again.",
      };
   }
}
