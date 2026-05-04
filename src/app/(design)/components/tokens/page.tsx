import {
  bgTokens,
  borderTokens,
  buttonTokens,
  statusSoftTokens,
  statusSolidTokens,
  textTokens,
} from "@/app/(design)/components/_shared/data";
import {
  PageHeader,
  TokenTable,
} from "@/app/(design)/components/_shared/helpers";

export default function TokensPage() {
  return (
    <>
      <PageHeader
        description="Every token below is available as a Tailwind utility. Prefix with bg-, text-, border-, or ring- (e.g. bg-primary, text-foreground, border-border)."
        title="Semantic Tokens"
      />
      <TokenTable
        label="Text Colours"
        rows={textTokens}
        utilityHint="text-{name}"
      />
      <TokenTable label="BG Colours" rows={bgTokens} utilityHint="bg-{name}" />
      <TokenTable
        label="Button Colours"
        rows={buttonTokens}
        utilityHint="bg-{name}"
      />
      <TokenTable
        label="Border Colours"
        rows={borderTokens}
        utilityHint="border-{name}  /  ring-ring"
      />
      <TokenTable
        label="Status Colours (Solid)"
        rows={statusSolidTokens}
        utilityHint="bg-{name}"
      />
      <TokenTable
        label="Status Colours (Soft)"
        rows={statusSoftTokens}
        utilityHint="bg-{name}"
      />
    </>
  );
}
