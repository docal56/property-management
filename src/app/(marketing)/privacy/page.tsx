import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Privacy Policy | Buzz",
  description: "Privacy policy for Buzz.",
};

export default function PrivacyPage() {
  return (
    <>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-lg py-lg">
        <Link aria-label="Buzz home" href="/">
          <Logo />
        </Link>
        <Link
          className="inline-flex items-center justify-center rounded-full bg-foreground px-lg py-base font-medium text-14 text-white transition-colors hover:bg-foreground/90"
          href="/sign-in"
        >
          Sign in
        </Link>
      </header>
      <main className="mx-auto min-h-full w-full max-w-6xl px-lg py-2xl">
        <h1 className="font-semibold text-20 text-foreground">
          Privacy Policy
        </h1>
      </main>
    </>
  );
}
