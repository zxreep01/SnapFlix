"use client";

import AmbientBackdrop from "@/components/ui/background/AmbientBackdrop";
import { cn } from "@/utils/helpers";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import AppRail from "./AppRail";

/**
 * Application shell.
 *
 * Builds the reference layout: a blurred room, a floating icon rail on the
 * left and one rounded glass panel that holds every page. Player and auth
 * routes opt out because they own the whole viewport.
 */
const Sidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathName = usePathname();
  const immersive = pathName.includes("/player") || pathName.startsWith("/watch");
  const auth = pathName.includes("/auth");

  if (auth) return <>{children}</>;

  return (
    <div className="relative min-h-dvh w-full">
      {!immersive && <AmbientBackdrop />}
      {!immersive && (
        <Suspense fallback={null}>
          <AppRail />
        </Suspense>
      )}

      <div
        className={cn("relative flex min-h-dvh w-full flex-col", {
          // Desktop keeps a gutter for the rail and breathing room around the panel.
          "md:py-4 md:pr-4 md:pl-[104px]": !immersive,
          // Mobile starts below the slim top bar and hugs the viewport edges.
          "pt-[64px] pb-20 md:pt-0 md:pb-0": !immersive,
        })}
      >
        <main
          className={cn(
            "relative w-full flex-1",
            !immersive && [
              "overflow-hidden border border-white/8",
              "bg-[linear-gradient(160deg,var(--sf-panel-from),var(--sf-panel-to))]",
              "backdrop-blur-2xl",
              "rounded-t-[22px] rounded-b-none border-b-0",
              "md:rounded-[26px] md:border-b",
            ],
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Sidebar;
