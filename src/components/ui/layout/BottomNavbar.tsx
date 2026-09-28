"use client";

import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Tabs shown in the mobile dock, matching the Netflix app's bottom bar. */
const TAB_LABELS = ["Home", "New & Popular", "My Library"];

/**
 * Netflix mobile dock.
 *
 * A flat black bar pinned to the bottom of the viewport with the three primary
 * destinations; the active tab is white, the rest stay muted.
 */
const BottomNavbar = () => {
  const pathName = usePathname();
  const tabs = siteConfig.navItems.filter((item) => TAB_LABELS.includes(item.label));
  const show = tabs.some((item) => item.href.split("?")[0] === pathName);

  if (!show) return null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/90 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto grid h-14 max-w-lg grid-cols-3 items-center px-2">
        {tabs.map((item) => {
          const isActive = pathName === item.href.split("?")[0];
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-0.5 py-2 transition-colors",
                isActive ? "text-white" : "text-white/55 hover:text-white",
              )}
            >
              <span className="block size-[18px]">{isActive ? item.activeIcon : item.icon}</span>
              <span className="mt-0.5 max-w-full truncate text-[10px] leading-none">
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
