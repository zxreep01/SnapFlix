"use client";

import { siteConfig } from "@/config/site";
import { MOCK_MOVIES } from "@/utils/mockData";
import { cn } from "@/utils/helpers";
import {
  Compass,
  CompassFilled,
  Help,
  Home,
  HomeFilled,
  Library,
  LibraryFilled,
  Shuffle,
} from "@/utils/icons";
import { BiSearchAlt2 } from "react-icons/bi";
import { Tooltip } from "@heroui/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import UserProfileButton from "../button/UserProfileButton";
import ThemeSwitchDropdown from "../input/ThemeSwitchDropdown";

interface RailItemProps {
  label: string;
  icon: React.ReactNode;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

/**
 * One icon in the floating rail.
 *
 * Active items fill with the cover-art accent so the rail always mirrors the
 * colour of whatever is playing on screen.
 */
const RailItem: React.FC<RailItemProps> = ({ label, icon, href, active, onClick }) => {
  const className = cn(
    "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[16px] transition-all duration-500 ease-sf select-none",
    active
      ? "bg-[var(--sf-accent)] text-[var(--sf-on-accent)] shadow-[0_0_22px_var(--sf-glow)]"
      : "text-white/65 hover:bg-white/10 hover:text-white active:scale-95",
  );

  return (
    <Tooltip content={label} placement="right" showArrow delay={250} closeDelay={0}>
      {href ? (
        <Link href={href} aria-label={label} className={className}>
          {icon}
        </Link>
      ) : (
        <button type="button" aria-label={label} onClick={onClick} className={className}>
          {icon}
        </button>
      )}
    </Tooltip>
  );
};

/**
 * Desktop navigation: a frosted, floating icon rail pinned to the left edge.
 *
 * Replaces the classic top navbar on `md+` screens, matching the reference
 * layout where every control lives in a compact vertical dock.
 */
const AppRail: React.FC<{ className?: string }> = ({ className }) => {
  const pathName = usePathname();
  const router = useRouter();
  const [isShuffling, setIsShuffling] = useState(false);

  const isHome = pathName === "/";

  // The rail's search icon used to expand inline; the shortcut now opens the
  // dedicated search page.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        router.push("/search");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  /** Sends the viewer to a random title from the trending catalog. */
  const handleShuffle = useCallback(async () => {
    if (isShuffling) return;
    setIsShuffling(true);

    try {
      const { results } = await siteConfig.queryLists.movies[0].query();
      const pool = results?.length ? results : MOCK_MOVIES;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      router.push(`/movie/${pick.id}`);
    } catch {
      const pick = MOCK_MOVIES[Math.floor(Math.random() * MOCK_MOVIES.length)];
      router.push(`/movie/${pick.id}`);
    } finally {
      setIsShuffling(false);
    }
  }, [isShuffling, router]);

  return (
    <aside
      aria-label="Primary"
      className={cn(
        "fixed top-1/2 left-3 z-50 hidden -translate-y-1/2 md:flex",
        "flex-col items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] p-2",
        "shadow-[0_24px_70px_rgba(0,0,0,0.6)] backdrop-blur-2xl backdrop-saturate-150",
        "max-h-[calc(100dvh-1.5rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <div className="mb-0.5">
        <UserProfileButton placement="right-end" size="lg" />
      </div>

      <div className="h-px w-6 shrink-0 bg-white/10" />

      <RailItem
        label="Home"
        href="/"
        active={isHome}
        icon={isHome ? <HomeFilled className="text-[16px]" /> : <Home className="text-[16px]" />}
      />
      <RailItem
        label="Search"
        href="/search"
        active={pathName.startsWith("/search")}
        icon={<BiSearchAlt2 className="text-[16px]" />}
      />
      <RailItem
        label="Discover"
        href="/discover"
        active={pathName.startsWith("/discover")}
        icon={
          pathName.startsWith("/discover") ? (
            <CompassFilled className="text-[16px]" />
          ) : (
            <Compass className="text-[16px]" />
          )
        }
      />
      <RailItem
        label="My Library"
        href="/library"
        active={pathName.startsWith("/library")}
        icon={
          pathName.startsWith("/library") ? (
            <LibraryFilled className="text-[16px]" />
          ) : (
            <Library className="text-[16px]" />
          )
        }
      />
      <RailItem
        label="Surprise me"
        onClick={handleShuffle}
        icon={<Shuffle className={cn("text-[16px]", isShuffling && "animate-pulse")} />}
      />

      <div className="my-0.5 h-px w-6 shrink-0 bg-white/10" />

      <div className="flex size-10 shrink-0 items-center justify-center rounded-full text-white/65 transition-colors hover:bg-white/10 hover:text-white">
        <ThemeSwitchDropdown />
      </div>
      <RailItem
        label="Help & FAQ"
        href="/about"
        active={pathName.startsWith("/about")}
        icon={<Help className="text-[16px]" />}
      />
    </aside>
  );
};

export default AppRail;
