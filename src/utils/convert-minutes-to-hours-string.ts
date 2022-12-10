export function convertMinutesToHoursString(minutesAmmpunt: number) {
  const hours = Math.floor(minutesAmmpunt / 60);

  const minutes = minutesAmmpunt % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}
