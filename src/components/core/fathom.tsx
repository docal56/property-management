"use client";

import { load, trackPageview } from "fathom-client";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const FATHOM_SITE_ID = "LSTDEROF";

function TrackPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load the Fathom script on mount
  useEffect(() => {
    const env = process.env.NODE_ENV;
    if (env !== "production") return;
    if (!FATHOM_SITE_ID) return;

    load(FATHOM_SITE_ID, {
      auto: false,
      includedDomains: ["usebuzz.ai"],
    });
  }, []);

  // Record a pageview when route changes
  useEffect(() => {
    if (!pathname) return;
    if (!FATHOM_SITE_ID) return;

    trackPageview({
      url: pathname + searchParams.toString(),
      referrer: document.referrer,
    });
  }, [pathname, searchParams]);

  return null;
}

export default function Fathom() {
  return (
    <Suspense fallback={null}>
      <TrackPageView />
    </Suspense>
  );
}
