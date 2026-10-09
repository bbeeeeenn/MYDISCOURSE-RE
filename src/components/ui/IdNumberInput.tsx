"use client";

import clsx from "clsx";
import {
   Dispatch,
   InputEvent,
   Ref,
   RefObject,
   SetStateAction,
   useRef,
   useState,
} from "react";

const ZWSP = "\u200B";

function IdNumberIndex({
   index,
   inputs,
   setInputs,
   ref,
   refs,
   handleAdd,
}: {
   index: number;
   inputs: (string | undefined)[];
   setInputs: Dispatch<SetStateAction<(string | undefined)[]>>;
   ref: Ref<HTMLInputElement>;
   refs: RefObject<(HTMLInputElement | null)[]>;
   handleAdd: () => void;
}) {
   const onInput = (e: InputEvent<HTMLInputElement>) => {
      const data = e.nativeEvent.data?.replace(/\D/g, "");

      if (data === undefined) {
         refs.current[
            Math.max(
               0,
               index - (index === 7 && inputs[index] !== undefined ? 0 : 1),
            )
         ]?.focus();
         setInputs((prev) => {
            const toReturn = [...prev];
            toReturn.splice(
               Math.max(0, index - (prev[index] === undefined ? 1 : 0)),
               1,
            );
            return toReturn;
         });
      } else {
         const diff = 8 - index - data.length;
         const overflow = diff < 0 ? -diff : 0;
         const realIndex = Math.max(0, index - overflow);
         for (let i = 0; i < Math.min(8, data.length); i++) {
            setInputs((prev) => {
               const toReturn = [...prev];
               toReturn[realIndex + i] = data[i];
               return toReturn;
            });
         }
         refs.current[Math.min(8, realIndex + data.length)]?.focus();
      }
   };

   return (
      <input
         readOnly={inputs.length < index}
         tabIndex={inputs.length < index ? -1 : 0}
         ref={ref}
         type="text"
         className={clsx(
            "max-w-7 border border-gray-300 bg-white py-1.5 text-center",
            inputs.length >= index && "focus-visible:border-gray-500",
         )}
         value={ZWSP + (inputs[index] ?? "")}
         onInput={onInput}
         onClick={() => {
            if (inputs.length < index) {
               refs.current[inputs.length]?.focus();
            }
         }}
         onKeyDown={(e) => {
            if (e.code === "Enter") {
               e.preventDefault();
               handleAdd();
            }
         }}
      />
   );
}

export function IdNumberInput({
   callback,
}: {
   callback: (input: string) => void;
}) {
   const [inputs, setInputs] = useState<(string | undefined)[]>([]);
   const refs = useRef<(HTMLInputElement | null)[]>([]);

   const handleAdd = () => {
      if (inputs.length < 8 || inputs.includes(undefined)) return;
      callback(`${inputs.slice(0, 3).join("")}-${inputs.slice(3).join("")}`);
      setInputs([]);
      refs.current[0]?.focus();
   };
   return (
      <div className="flex gap-2">
         <div className="flex items-center text-base">
            {Array.from({ length: 3 }).map((_, i) => (
               <IdNumberIndex
                  ref={(el) => {
                     refs.current[i] = el;
                  }}
                  refs={refs}
                  key={i}
                  index={i}
                  inputs={inputs}
                  setInputs={setInputs}
                  handleAdd={handleAdd}
               />
            ))}
            <p className="mx-1">-</p>
            {Array.from({ length: 5 }).map((_, i) => (
               <IdNumberIndex
                  ref={(el) => {
                     refs.current[i + 3] = el;
                  }}
                  refs={refs}
                  key={i + 3}
                  index={i + 3}
                  inputs={inputs}
                  setInputs={setInputs}
                  handleAdd={handleAdd}
               />
            ))}
         </div>
         <button
            type="button"
            className="bg-base-300 self-stretch rounded-sm border border-gray-300 px-2 text-white disabled:cursor-not-allowed! disabled:opacity-50"
            onClick={handleAdd}
            disabled={inputs.includes(undefined) || inputs.length < 8}
         >
            Add
         </button>
      </div>
   );
}
