"use client";

import { cn } from "@/utils/helpers";
import { useWindowScroll } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import UserProfileButton from "../button/UserProfileButton";
import BrandLogo from "../other/BrandLogo";
import NavSearch from "./NavSearch";

/**
 * Slim top bar for phones and tablets.
 *
 * The desktop layout is driven by the floating {@link AppRail}, so this bar
 * only exists below `md` where a rail would crowd the screen.
 */
const TopNavbar = () => {
  const pathName = usePathname();
  const [{ y }] = useWindowScroll();
  const isScrolled = y > 12;

  const player = pathName.includes("/player") || pathName.startsWith("/watch");
  const auth = pathName.includes("/auth");

  if (auth || player) return null;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between gap-2 px-3 transition-colors duration-300 md:hidden",
        isScrolled
          ? "border-b border-white/8 bg-black/45 backdrop-blur-2xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <BrandLogo size="sm" align="left" />

      <div className="flex min-w-0 items-center gap-1">
        {/* The bar instance only reacts below md, the rail instance above it */}
        <NavSearch variant="bar" />
        <UserProfileButton />
      </div>
    </header>
  );
};

export default TopNavbar;
