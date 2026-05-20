import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { InteractiveOrb } from "./_components/interactive-orb";

export const metadata: Metadata = {
  title: "Buzz | We handle phone calls for your business",
  description:
    "Buzz answers calls 24/7, captures enquiries, answers common questions and books appointments — so your team is free to focus on what matters.",
};

export default function MarketingPage() {
  return (
    <>
      <style>{`
        html,
        body {
          background: #0d0d0d;
        }
      `}</style>
      <main className="bg-[#0D0D0D] pb-[140px]">
        <Hero />
        <Features />
        <Footer />
      </main>
    </>
  );
}

function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#0c0c0c]">
      {/* Blurred gradient ellipse from Figma — positioned to match exactly.
          Mask fades the SVG's bottom half so its edge dissolves into the dark bg. */}
      {/* biome-ignore lint/performance/noImgElement: SVG background asset */}
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-[-356px] left-[-334px] h-[956px] w-[2292px] max-w-none"
        src="/marketing/hero-glow.svg"
        style={{
          maskImage:
            "linear-gradient(to bottom, black 0%, black 35%, transparent 75%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 35%, transparent 75%)",
        }}
      />

      {/* Bottom-half fade — guarantees the lower portion of the hero is exactly
          #0D0D0D where the features section begins, so there's no seam. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-[600px]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(13,13,13,0) 0%, rgba(13,13,13,0.6) 50%, #0D0D0D 100%)",
        }}
      />

      <div className="relative flex min-h-[680px] w-full flex-col lg:h-[988px] lg:min-h-0">
        <Link
          aria-label="Buzz home"
          className="z-10 self-start px-lg pt-lg lg:absolute lg:top-[44px] lg:left-[134px] lg:px-0 lg:pt-0"
          href="/"
        >
          <Logo className="text-white" />
        </Link>

        <Link
          className="z-10 mt-lg mr-lg self-end rounded-full bg-white px-[16px] py-[11px] font-medium text-[14px] text-foreground leading-[18px] transition-colors hover:bg-white/90 lg:absolute lg:top-[44px] lg:right-[134px] lg:mt-0 lg:mr-0"
          href="/sign-in"
        >
          Sign in
        </Link>

        <div className="relative my-auto flex w-full max-w-[678px] flex-col gap-[40px] px-lg py-3xl lg:absolute lg:top-1/2 lg:left-[134px] lg:my-0 lg:-translate-y-1/2 lg:px-0 lg:py-0">
          <div className="flex flex-col gap-[24px]">
            <h1 className="font-light font-serif text-[40px] text-white leading-[1.15] md:text-[56px] lg:text-[72px]">
              We handle phone calls for your business, to free up your team.
            </h1>
            <p className="font-normal font-season text-[18px] text-white/70 leading-[1.6] md:text-[22px] lg:text-[24px]">
              Buzz answers calls 24/7, captures enquiries, answers common
              questions and books appointments.
            </p>
          </div>
          <Link
            className="inline-flex w-fit items-center justify-center rounded-full bg-primary px-[32px] py-[20px] font-medium text-[18px] text-white leading-[18px] transition-colors hover:bg-primary-hover"
            href="/sign-up"
          >
            Book a Demo
          </Link>
        </div>

        <div className="absolute top-0 right-0 hidden h-full w-[920px] lg:block">
          <InteractiveOrb />
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="flex w-full flex-col items-center bg-[#0D0D0D] px-lg pt-[40px] lg:px-0">
      <div className="relative w-full max-w-[1400px] overflow-hidden border border-[#202024]">
        {/* Soft inner glow positioned per Figma */}
        {/* biome-ignore lint/performance/noImgElement: SVG background asset */}
        <img
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute top-[324px] left-[405px] h-[856px] w-[2052px] max-w-none"
          src="/marketing/features-glow.svg"
        />

        {/* Three feature cards in a row */}
        <div className="relative grid grid-cols-1 lg:grid-cols-3">
          <FeatureCard
            body="You can manage incoming enquiries in our dashboard and assign them to the right team member."
            details={[
              "Capture every call",
              "Assign action items to the relevant member of the team",
              "Let the agent handle general enquiries and lead capture",
            ]}
            isLast={false}
            title="Full visibility of your calls"
          />
          <FeatureCard
            body="You can set how our AI escalates calls and who they go to, so your team are always aware of the calls that matter, and AI handles the rest."
            details={[
              "Get notified on WhatsApp or Email",
              "Route urgent calls to a member of the team",
              "Assign team members to specific enquiries",
            ]}
            isLast={false}
            title="Get notified for what matters"
          />
          <FeatureCard
            body="We integrate into your booking systems & CRM so you don't have to change any of your workflows."
            details={[
              "We integrate into your tools",
              "No need to change the way you work",
              "Our agent will keep your CRM up to date",
            ]}
            isLast
            title="Integrations"
          />
        </div>

        {/* Final CTA inside the bordered card */}
        <div className="relative flex w-full items-center justify-center border-[rgba(255,255,255,0.06)] border-t py-[100px] lg:py-[140px]">
          <div className="flex flex-col items-center justify-center gap-[40px]">
            <h2 className="text-center font-light font-serif text-[36px] text-white leading-[1.15] md:text-[48px] lg:whitespace-nowrap lg:text-[59px]">
              Ready to free your team up?
            </h2>
            <Link
              className="inline-flex items-center justify-center rounded-full bg-primary px-[32px] py-[20px] font-medium text-[18px] text-white leading-[18px] transition-colors hover:bg-primary-hover"
              href="/sign-up"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

type FeatureCardProps = {
  title: string;
  body: string;
  details: string[];
  isLast: boolean;
};

function FeatureCard({ title, body, details, isLast }: FeatureCardProps) {
  return (
    <div
      className={`relative flex flex-col items-start justify-between gap-[48px] px-[32px] pt-[48px] pb-[32px] lg:h-[480px] lg:gap-0 ${
        isLast
          ? ""
          : "border-[rgba(255,255,255,0.06)] border-b lg:border-r lg:border-b-0"
      }`}
    >
      <div className="flex w-full flex-col gap-[12px]">
        <h3 className="font-medium font-season text-[26px] text-white leading-[1.2]">
          {title}
        </h3>
        <p className="font-normal text-[#bbb] text-[16px] leading-[1.5]">
          {body}
        </p>
      </div>
      <ul className="flex w-full flex-col gap-[24px]">
        {details.map((detail) => (
          <li
            className="border-[#212121] border-b pb-[16px] font-medium text-[#bbb] text-[14px] leading-[1.5] last:border-b-0 last:pb-0"
            key={detail}
          >
            {detail}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0D0D0D]">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-lg py-lg text-13 text-white/50">
        <span>&copy; 2026 Buzz</span>
        <nav className="flex items-center gap-lg">
          <Link className="transition-colors hover:text-white" href="/privacy">
            Privacy
          </Link>
          <Link className="transition-colors hover:text-white" href="/terms">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
