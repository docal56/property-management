export type IssueStatus = "new" | "in-progress" | "scheduled" | "completed";

export type TimelineItem =
  | {
      id: string;
      variant: "avatar-led";
      authorName: string;
      authorAlt: string;
      authorImageSrc?: string;
      timestamp: string;
      body: string;
    }
  | {
      id: string;
      variant: "icon-led";
      title: string;
      timestamp: string;
      iconName: "phone" | "calendar" | "check" | "status-new" | "completed";
      tone: "purple" | "orange" | "teal" | "pink" | "light-blue";
    };

export type ChatMessage = {
  id: string;
  variant: "incoming" | "outgoing";
  body: string;
};

export type Contact = {
  name: string;
  phone: string;
  email: string;
  fullAddress: string;
};

export type Issue = {
  id: string;
  publicId: string;
  address: string;
  description: string;
  status: IssueStatus;
  urgent?: boolean;
  reportedAt: string;
  contact: Contact;
  timeline: TimelineItem[];
  transcript: ChatMessage[];
  callSummary: string;
  callDuration: string;
};

export type Call = {
  id: string;
  date: string;
  agent: string;
  duration: string;
  address: string;
  status: "pass" | "fail";
  issueId?: string;
  summary: string;
  transcript: ChatMessage[];
};

const sharedTranscript: ChatMessage[] = [
  {
    id: "m1",
    variant: "incoming",
    body: "Hi, Relocate Property management how can I help you?",
  },
  {
    id: "m2",
    variant: "outgoing",
    body: "Oh, hi. Yeah, I'd like to report, um, a rat in my kitchen.",
  },
  {
    id: "m3",
    variant: "incoming",
    body: "Right, okay. That sounds unpleasant. Can I get your name please?",
  },
  {
    id: "m4",
    variant: "outgoing",
    body: "Dave O'Callaghan. I live at 59 Wakefield Road, Hipperholme.",
  },
];

const sharedSummary =
  "Tenant reported a broken hot tap. The issue started on weds 16th April, but hot water is available elsewhere in the property.";

export const issues: Issue[] = [
  {
    id: "issue-1",
    publicId: "k7q2m4p8n6x1b4h9",
    address: "59 Wakefield Road, HX3 8AQ",
    description: sharedSummary,
    status: "new",
    urgent: true,
    reportedAt: "Today, 10:30am",
    contact: {
      name: "Dave O'Callaghan",
      phone: "07792420529",
      email: "docal56@gmail.com",
      fullAddress: "59 Wakefield Road, Hipperholme, HX3 8AQ",
    },
    callSummary: sharedSummary,
    callDuration: "1:32",
    timeline: [
      {
        id: "t1",
        variant: "icon-led",
        title: "Tenant reported issue",
        timestamp: "2 days ago",
        iconName: "phone",
        tone: "purple",
      },
      {
        id: "t2",
        variant: "avatar-led",
        authorName: "Teresa",
        authorAlt: "Teresa",
        timestamp: "2 days ago",
        body: "Reached out to Steve from Union Plumbing",
      },
    ],
    transcript: sharedTranscript,
  },
  {
    id: "issue-2",
    publicId: "p8n6x1b4h9t2z2r8",
    address: "59 Wakefield Road, HX3 8AQ",
    description: sharedSummary,
    status: "new",
    reportedAt: "Today, 10:30am",
    contact: {
      name: "Dave O'Callaghan",
      phone: "07792420529",
      email: "docal56@gmail.com",
      fullAddress: "59 Wakefield Road, Hipperholme, HX3 8AQ",
    },
    callSummary: sharedSummary,
    callDuration: "0:54",
    timeline: [
      {
        id: "t1",
        variant: "icon-led",
        title: "Tenant reported issue",
        timestamp: "3 days ago",
        iconName: "phone",
        tone: "purple",
      },
    ],
    transcript: sharedTranscript,
  },
  {
    id: "issue-3",
    publicId: "b4h9t2z2r8c5m7q3",
    address: "12 Oakdene Rise, HD1 3QP",
    description: "Heating intermittent — boiler service booked.",
    status: "in-progress",
    reportedAt: "Yesterday, 4:12pm",
    contact: {
      name: "Priya Shah",
      phone: "07812040199",
      email: "priya.shah@example.com",
      fullAddress: "12 Oakdene Rise, Fartown, HD1 3QP",
    },
    callSummary:
      "Heating is cycling on/off every few minutes. Boiler sounds rough. Booked engineer for tomorrow morning.",
    callDuration: "2:07",
    timeline: [
      {
        id: "t1",
        variant: "icon-led",
        title: "Tenant reported issue",
        timestamp: "Yesterday",
        iconName: "phone",
        tone: "purple",
      },
      {
        id: "t2",
        variant: "avatar-led",
        authorName: "Teresa",
        authorAlt: "Teresa",
        timestamp: "22 hours ago",
        body: "Called engineer, booked in for 10am.",
      },
      {
        id: "t3",
        variant: "icon-led",
        title: "Issue scheduled",
        timestamp: "22 hours ago",
        iconName: "calendar",
        tone: "orange",
      },
    ],
    transcript: sharedTranscript,
  },
  {
    id: "issue-4",
    publicId: "z2r8c5m7q3w6d9f1",
    address: "3 Elm Court, HX2 9JF",
    description: "Leaking kitchen tap — plumber scheduled.",
    status: "scheduled",
    reportedAt: "2 days ago",
    contact: {
      name: "Marcus Webb",
      phone: "07700009911",
      email: "mwebb@example.com",
      fullAddress: "3 Elm Court, Sowerby Bridge, HX2 9JF",
    },
    callSummary:
      "Constant drip from the cold side of the kitchen tap. Plumber booked for Friday.",
    callDuration: "1:15",
    timeline: [
      {
        id: "t1",
        variant: "icon-led",
        title: "Tenant reported issue",
        timestamp: "2 days ago",
        iconName: "phone",
        tone: "purple",
      },
      {
        id: "t2",
        variant: "icon-led",
        title: "Issue scheduled",
        timestamp: "1 day ago",
        iconName: "calendar",
        tone: "orange",
      },
    ],
    transcript: sharedTranscript,
  },
];

export const calls: Call[] = Array.from({ length: 11 }).map((_, i) => ({
  id: `call-${i + 1}`,
  date: "22nd April 2026",
  agent: "Property Management",
  duration: "1:28",
  address: "59 Wakefield Rd",
  status: i === 0 ? "fail" : "pass",
  issueId: "k7q2m4p8n6x1b4h9",
  summary: sharedSummary,
  transcript: sharedTranscript,
}));

export function getIssueByPublicId(publicId: string): Issue | undefined {
  return issues.find((issue) => issue.publicId === publicId);
}

export function getCallById(id: string): Call | undefined {
  return calls.find((call) => call.id === id);
}

export function getAdjacentIssueIds(id: string): {
  prev?: string;
  next?: string;
} {
  const idx = issues.findIndex((issue) => issue.publicId === id);
  if (idx < 0) return {};
  return {
    prev: idx > 0 ? issues[idx - 1]?.publicId : undefined,
    next: idx < issues.length - 1 ? issues[idx + 1]?.publicId : undefined,
  };
}

export const issueStatusColumns: Array<{
  id: IssueStatus;
  title: string;
  defaultCollapsed?: boolean;
}> = [
  { id: "new", title: "New Issues" },
  { id: "in-progress", title: "In Progress" },
  { id: "scheduled", title: "Scheduled" },
  { id: "completed", title: "Completed", defaultCollapsed: true },
];
