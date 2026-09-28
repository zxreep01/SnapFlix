"use client";

import { cn } from "@/utils/helpers";
import Link from "next/link";
import { IoChevronDown } from "react-icons/io5";

interface FooterProps {
  className?: string;
}

const LINK_GROUPS = [
  [
    { label: "Home", href: "/" },
    { label: "TV Shows", href: "/?content=tv" },
    { label: "Movies", href: "/?content=movie" },
  ],
  [
    { label: "New & Popular", href: "/discover" },
    { label: "Search", href: "/search" },
    { label: "My Library", href: "/library" },
  ],
  [
    { label: "Help Centre", href: "/about" },
    { label: "Terms of Use", href: "/about" },
    { label: "Privacy", href: "/about" },
  ],
];

const LEGAL =
  "SnapFlix does not host or store any media. Metadata is presented for discovery and every stream is served by a third-party embed provider.";

/**
 * Netflix-style footer: a quiet question line, three columns of links and the
 * legal note tucked behind a disclosure so the page ends calmly.
 */
const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer
      className={cn(
        "w-full border-t border-white/8 px-4 pt-10 pb-24 text-white/45 select-none md:px-12 md:pb-14",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6">
        <p className="text-[13px]">Questions? Visit the help centre.</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {LINK_GROUPS.map((group, index) => (
            <ul key={index} className="flex flex-col gap-2.5 text-[12px]">
              {group.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-white/80">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>

        {/* Legal copy stays collapsed until asked for */}
        <details className="group text-[12px]">
          <summary className="flex w-fit cursor-pointer items-center gap-1.5 transition-colors hover:text-white/70">
            Legal &amp; disclaimer
            <IoChevronDown className="size-3.5 transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <p className="mt-2 max-w-xl leading-relaxed">{LEGAL}</p>
        </details>

        <p className="text-[11px]">
          © 2026 SnapFlix Cinema · Built by{" "}
          <Link
            href="https://ansarixfarhan.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white/70"
          >
            Farhan Ansari
          </Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
