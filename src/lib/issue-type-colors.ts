// Single source of truth for issue-type colour palettes used by:
//  - the admin org-detail page (issue-type editor + chip preview)
//  - the issues list and detail pages (filter chips + badges)
//
// Add new colours here only.

export const issueTypeColors = [
  {
    key: "green",
    label: "Green",
    dotClassName: "bg-green-300",
    chipClassName: "bg-green-100 text-green-400",
    ringClassName: "ring-green-300",
  },
  {
    key: "blue",
    label: "Blue",
    dotClassName: "bg-blue-300",
    chipClassName: "bg-blue-100 text-blue-400",
    ringClassName: "ring-blue-300",
  },
  {
    key: "orange",
    label: "Orange",
    dotClassName: "bg-[#F47E2A]",
    chipClassName: "bg-[#FFF9F5] text-[#AD5A1F]",
    ringClassName: "ring-[#F47E2A]",
  },
  {
    key: "purple",
    label: "Purple",
    dotClassName: "bg-[#6D2AF4]",
    chipClassName: "bg-[#F8F5FF] text-[#4E1FAD]",
    ringClassName: "ring-[#6D2AF4]",
  },
  {
    key: "red",
    label: "Red",
    dotClassName: "bg-[#F42A31]",
    chipClassName: "bg-[#FFF5F5] text-[#AD1F23]",
    ringClassName: "ring-[#F42A31]",
  },
] as const;

export type IssueTypeColorKey = (typeof issueTypeColors)[number]["key"];

export type IssueTypeColorClasses = {
  dotClassName: string;
  chipClassName: string;
};

export const colorClasses: Record<string, IssueTypeColorClasses> =
  Object.fromEntries(
    issueTypeColors.map((c) => [
      c.key,
      { dotClassName: c.dotClassName, chipClassName: c.chipClassName },
    ]),
  );

export function colorFor(key: string | undefined) {
  return issueTypeColors.find((color) => color.key === key);
}

export function slugifyKey(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
