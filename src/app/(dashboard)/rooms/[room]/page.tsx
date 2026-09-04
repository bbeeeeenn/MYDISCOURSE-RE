export const instant = false;
export default async function RoomPage({
   params,
}: {
   params: Promise<{ room: string }>;
}) {
   const { room: roomName } = await params;
   return <>{decodeURIComponent(roomName)}</>;
}
