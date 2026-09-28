"use client";

import { cn } from "@/utils/helpers";
import { usePathname } from "next/navigation";

/**
 * Application shell.
 *
 * Netflix keeps its content on a flat near-black canvas, so the shell only
 * switches the chrome on and off: the player and auth routes own the whole
 * viewport, every other route sits under the top bar.
 */
const Sidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathName = usePathname();
  const immersive = pathName.includes("/player") || pathName.startsWith("/watch");
  const auth = pathName.includes("/auth");

  if (auth || immersive) return <>{children}</>;

  return (
    <div className={cn("relative min-h-dvh w-full", "pt-14 md:pt-16")}>
      <main className="relative w-full">{children}</main>
    </div>
  );
};

export default Sidebar;
