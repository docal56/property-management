import { extendTailwindMerge } from "tailwind-merge";

// Custom spacing tokens defined in src/app/globals.css (--spacing-*).
// Listed here so tailwind-merge recognises e.g. `p-md` as a padding utility
// and dedupes it against `p-0`, `p-4`, etc. Without this, conflicting
// spacing utilities silently coexist and source order in the stylesheet
// — not class order — picks the winner.
const SPACING_TOKENS = [
  "xxs",
  "xs",
  "sm",
  "md",
  "base",
  "lg",
  "xl",
  "2xl",
  "3xl",
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["12", "13", "14", "16", "20"] }],
      leading: [{ leading: ["120", "160"] }],
      p: [{ p: SPACING_TOKENS }],
      px: [{ px: SPACING_TOKENS }],
      py: [{ py: SPACING_TOKENS }],
      pt: [{ pt: SPACING_TOKENS }],
      pr: [{ pr: SPACING_TOKENS }],
      pb: [{ pb: SPACING_TOKENS }],
      pl: [{ pl: SPACING_TOKENS }],
      m: [{ m: SPACING_TOKENS }],
      mx: [{ mx: SPACING_TOKENS }],
      my: [{ my: SPACING_TOKENS }],
      mt: [{ mt: SPACING_TOKENS }],
      mr: [{ mr: SPACING_TOKENS }],
      mb: [{ mb: SPACING_TOKENS }],
      ml: [{ ml: SPACING_TOKENS }],
      gap: [{ gap: SPACING_TOKENS }],
      "gap-x": [{ "gap-x": SPACING_TOKENS }],
      "gap-y": [{ "gap-y": SPACING_TOKENS }],
    },
  },
});

export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return twMerge(classes.filter(Boolean).join(" "));
}
