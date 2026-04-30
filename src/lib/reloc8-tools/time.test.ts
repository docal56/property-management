import {
  getLondonTime,
  isEmergencyLineAvailable,
  LONDON_TIME_ZONE,
} from "./time";

describe("Reloc8 London time tools", () => {
  it("formats the current time in London and follows clock changes", () => {
    expect(getLondonTime(new Date("2026-01-15T12:34:56Z"))).toEqual({
      date: "2026-01-15",
      time: "12:34:56",
      time_zone: LONDON_TIME_ZONE,
    });

    expect(getLondonTime(new Date("2026-07-15T12:34:56Z"))).toEqual({
      date: "2026-07-15",
      time: "13:34:56",
      time_zone: LONDON_TIME_ZONE,
    });
  });

  it("is available from 08:00 inclusive to 20:00 exclusive London time", () => {
    expect(isEmergencyLineAvailable(new Date("2026-07-15T06:59:00Z"))).toBe(
      false,
    );
    expect(isEmergencyLineAvailable(new Date("2026-07-15T07:00:00Z"))).toBe(
      true,
    );
    expect(isEmergencyLineAvailable(new Date("2026-07-15T18:59:00Z"))).toBe(
      true,
    );
    expect(isEmergencyLineAvailable(new Date("2026-07-15T19:00:00Z"))).toBe(
      false,
    );
  });
});
