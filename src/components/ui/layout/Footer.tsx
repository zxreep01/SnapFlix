"use client";

import { cn } from "@/utils/helpers";
import { Accordion, AccordionItem } from "@heroui/react";
import Link from "next/link";
import BrandLogo from "../other/BrandLogo";

interface FooterProps {
  className?: string;
}

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Search", href: "/search" },
  { label: "Discover", href: "/discover" },
  { label: "Library", href: "/library" },
  { label: "Help", href: "/about" },
];

const LEGAL =
  "SnapFlix does not host or store any media. Metadata is presented for discovery and every stream is served by a third-party embed provider.";

/**
 * Minimal centred footer: the wordmark, a short row of destinations and the
 * legal note tucked into a dropdown so the page ends quietly.
 */
const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={cn("w-full border-t border-white/8 px-4 py-8 sm:px-6", className)}>
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 text-center">
        <BrandLogo size="md" align="center" />

        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[11px] font-medium text-zinc-400 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Legal copy stays collapsed until asked for */}
        <Accordion variant="light" isCompact className="w-full max-w-md px-0">
          <AccordionItem
            key="legal"
            aria-label="Legal and disclaimer"
            title={
              <span className="block w-full text-center text-[11px] text-zinc-500">
                Legal &amp; disclaimer
              </span>
            }
          >
            <p className="text-[11px] leading-relaxed text-zinc-500">{LEGAL}</p>
          </AccordionItem>
        </Accordion>

        <p className="text-[11px] text-zinc-500">
          © 2026 SnapFlix Cinema · Built by{" "}
          <Link
            href="https://ansarixfarhan.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 transition-colors hover:text-white"
          >
            Farhan Ansari
          </Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
