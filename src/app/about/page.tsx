import { siteConfig } from "@/config/site";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { NextPage } from "next";
import Footer from "@/components/ui/layout/Footer";

const FAQ = dynamic(() => import("@/components/sections/About/FAQ"));

export const metadata: Metadata = {
  title: `Help Center & FAQ | ${siteConfig.name}`,
};

const AboutPage: NextPage = () => {
  return (
    <div className="flex min-h-full flex-col justify-between pt-5">
      <div className="flex w-full justify-center px-4 py-8 md:px-12">
        <div className="flex w-full max-w-3xl flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-2 pb-4 text-center">
            <h1 className="text-xl font-bold text-white md:text-2xl">Help Centre</h1>
          </div>

          <Suspense>
            <FAQ />
          </Suspense>

          <div className="mt-6 flex flex-col items-center gap-3 rounded-sf border border-white/10 bg-[#181818] px-6 py-5 text-center">
            <h3 className="text-sm font-medium text-white">Still need help?</h3>
            <a
              href="mailto:support@snapflix.internal"
              className="rounded-full bg-[var(--sf-accent)] px-4 py-1.5 text-[11px] font-medium text-[var(--sf-on-accent)] transition-[filter] hover:brightness-110"
            >
              Contact support
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
