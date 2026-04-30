export const LONDON_TIME_ZONE = "Europe/London";

export type LondonTime = {
  date: string;
  time: string;
  time_zone: typeof LONDON_TIME_ZONE;
};

type LondonClockTime = {
  hour: number;
  minute: number;
  second: number;
};

const EMERGENCY_LINE_OPEN_MINUTE = 8 * 60;
const EMERGENCY_LINE_CLOSE_MINUTE = 20 * 60;

const londonDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
  month: "2-digit",
  second: "2-digit",
  timeZone: LONDON_TIME_ZONE,
  year: "numeric",
});

function getRequiredPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  const value = parts.find((part) => part.type === type)?.value;
  if (!value) throw new Error(`Unable to format London ${type}`);
  return value;
}

function getLondonClockTime(date: Date): LondonClockTime {
  const parts = londonDateTimeFormatter.formatToParts(date);

  return {
    hour: Number(getRequiredPart(parts, "hour")),
    minute: Number(getRequiredPart(parts, "minute")),
    second: Number(getRequiredPart(parts, "second")),
  };
}

export function getLondonTime(date = new Date()): LondonTime {
  const parts = londonDateTimeFormatter.formatToParts(date);
  const year = getRequiredPart(parts, "year");
  const month = getRequiredPart(parts, "month");
  const day = getRequiredPart(parts, "day");
  const hour = getRequiredPart(parts, "hour");
  const minute = getRequiredPart(parts, "minute");
  const second = getRequiredPart(parts, "second");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}:${second}`,
    time_zone: LONDON_TIME_ZONE,
  };
}

export function isEmergencyLineAvailable(date = new Date()): boolean {
  const londonTime = getLondonClockTime(date);
  const currentMinute = londonTime.hour * 60 + londonTime.minute;

  return (
    currentMinute >= EMERGENCY_LINE_OPEN_MINUTE &&
    currentMinute < EMERGENCY_LINE_CLOSE_MINUTE
  );
}
