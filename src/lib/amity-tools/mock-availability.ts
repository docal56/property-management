import "server-only";

export type AvailabilitySlot = {
  slot_id: string;
  start_time: string;
  end_time: string;
  status: "available" | "booked";
  booked_name?: string;
  booked_phone?: string;
  booked_at?: string;
  call_id?: string;
};

export type BookingResult =
  | {
      success: true;
      booking_id: string;
      message: string;
      slot: AvailabilitySlot;
    }
  | {
      success: false;
      message: string;
    };

export type CallLog = {
  call_id?: string;
  caller_phone?: string;
  outcome: string;
  summary?: string;
  created_at: string;
};

const slots: AvailabilitySlot[] = [
  {
    end_time: "2026-05-01T09:30:00-04:00",
    slot_id: "slot_20260501_0900",
    start_time: "2026-05-01T09:00:00-04:00",
    status: "available",
  },
  {
    end_time: "2026-05-01T11:30:00-04:00",
    slot_id: "slot_20260501_1100",
    start_time: "2026-05-01T11:00:00-04:00",
    status: "available",
  },
  {
    end_time: "2026-05-02T14:30:00-04:00",
    slot_id: "slot_20260502_1400",
    start_time: "2026-05-02T14:00:00-04:00",
    status: "available",
  },
];

const callLogs: CallLog[] = [];

export function findAvailableSlots(options: {
  preferredDate?: string;
  maxResults?: number;
}): AvailabilitySlot[] {
  const maxResults = Math.min(Math.max(options.maxResults ?? 3, 1), 10);

  return slots
    .filter((slot) => slot.status === "available")
    .filter(
      (slot) =>
        !options.preferredDate ||
        slot.start_time.startsWith(options.preferredDate),
    )
    .slice(0, maxResults);
}

export function bookSlot(input: {
  slotId: string;
  callerName: string;
  callerPhone: string;
  callId?: string;
}): BookingResult {
  const slot = slots.find((candidate) => candidate.slot_id === input.slotId);
  if (!slot) {
    return { message: "That slot could not be found.", success: false };
  }

  if (slot.status !== "available") {
    return {
      message: "That slot is no longer available. Please choose another time.",
      success: false,
    };
  }

  slot.status = "booked";
  slot.booked_name = input.callerName;
  slot.booked_phone = input.callerPhone;
  slot.booked_at = new Date().toISOString();
  slot.call_id = input.callId;

  return {
    booking_id: slot.slot_id,
    message: `Booked ${slot.start_time}.`,
    slot,
    success: true,
  };
}

export function appendCallLog(input: {
  callId?: string;
  callerPhone?: string;
  outcome: string;
  summary?: string;
}): CallLog {
  const log = {
    call_id: input.callId,
    caller_phone: input.callerPhone,
    created_at: new Date().toISOString(),
    outcome: input.outcome,
    summary: input.summary,
  };
  callLogs.push(log);
  return log;
}
