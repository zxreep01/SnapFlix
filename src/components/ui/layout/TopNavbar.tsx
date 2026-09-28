"use client";

import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import { useWindowScroll } from "@mantine/hooks";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import UserProfileButton from "../button/UserProfileButton";
import BrandLogo from "../other/BrandLogo";
import { IoSearchOutline } from "react-icons/io5";

/**
 * Netflix top bar.
 *
 * Transparent over the billboard and fading to solid black once the viewer
 * scrolls, with the destination links in the middle and search plus the
 * profile menu on the right. One bar serves every breakpoint.
 */
const TopNavbar = () => {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const [{ y }] = useWindowScroll();
  const isScrolled = y > 12;

  const content = searchParams.get("content");
  const isHome = pathName === "/";

  const player = pathName.includes("/player") || pathName.startsWith("/watch");
  const auth = pathName.includes("/auth");

  if (auth || player) return null;

  /** A destination is current when its link matches the live query state. */
  const isActive = (href: string) => {
    const [base, query] = href.split("?");
    if (base !== pathName) return false;
    if (!query) return base === "/" ? !content : true;
    return query.split("=")[1] === content;
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-4 px-4 transition-colors duration-300 md:h-16 md:gap-8 md:px-12",
        isScrolled || !isHome
          ? "bg-[#141414]"
          : "bg-[linear-gradient(180deg,rgba(0,0,0,0.7)_10%,transparent)]",
      )}
    >
      <BrandLogo size="sm" align="left" />

      <nav aria-label="Primary" className="hidden min-w-0 items-center gap-5 md:flex">
        {siteConfig.navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-[13px] transition-colors",
              isActive(item.href) ? "font-medium text-white" : "text-white/70 hover:text-white",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex min-w-0 items-center gap-1 md:gap-3">
        <Link
          href="/search"
          aria-label="Search titles, actors and genres"
          className="flex size-9 items-center justify-center text-white transition-colors hover:text-white/70"
        >
          <IoSearchOutline className="size-5" />
        </Link>
        <UserProfileButton size="lg" />
      </div>
    </header>
  );
};

export default TopNavbar;
