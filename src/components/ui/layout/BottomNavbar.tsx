"use client";

import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Floating mobile navigation.
 *
 * Mirrors the rail on small screens: a frosted pill dock where the active
 * destination is filled with the current cover-art accent.
 */
const BottomNavbar = () => {
  const pathName = usePathname();
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const show = hrefs.includes(pathName);

  if (!show) return null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-3 bottom-3 z-50 rounded-[22px] border border-white/10 bg-black/55 backdrop-blur-2xl shadow-[0_18px_50px_rgba(0,0,0,0.6)] md:hidden"
      style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
    >
      <div
        className="mx-auto grid h-14 max-w-lg items-center gap-1 px-2"
        style={{ gridTemplateColumns: `repeat(${siteConfig.navItems.length}, minmax(0, 1fr))` }}
      >
        {siteConfig.navItems.map((item) => {
          const isActive = pathName === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="flex min-w-0 flex-col items-center justify-center gap-1 py-1.5 text-white/70 transition-colors hover:text-white"
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full transition-all duration-500 ease-sf",
                  isActive
                    ? "bg-[var(--sf-accent)] text-[var(--sf-on-accent)] shadow-[0_0_18px_var(--sf-glow)]"
                    : "bg-white/6 text-white/75",
                )}
              >
                <span className="block size-4">
                  {isActive ? item.activeIcon : item.icon}
                </span>
              </span>
              <span
                className={cn(
                  "max-w-full truncate text-[9px] leading-none",
                  isActive ? "font-bold text-white" : "font-medium",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavbar;
