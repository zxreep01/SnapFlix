"use client";

import { getUserHistories } from "@/actions/histories";
import type { HistoryDetail } from "@/types/movie";
import { useQuery } from "@tanstack/react-query";

/**
 * Loads the viewer's watch history.
 *
 * Signed-in rows come from Supabase while guests (and offline sessions) keep
 * their progress in `localStorage`; both sources are merged, deduplicated per
 * title and sorted by the most recent activity.
 *
 * @returns TanStack Query result whose `data` is a list of {@link HistoryDetail}.
 */
const useWatchHistory = () =>
  useQuery({
    queryFn: async (): Promise<HistoryDetail[]> => {
      // 1. Fetch Supabase histories (for logged in users)
      let serverItems: HistoryDetail[] = [];
      try {
        const res = await getUserHistories();
        if (res?.success && Array.isArray(res.data)) {
          serverItems = res.data;
        }
      } catch {
        // Guests have no server history — the local list below is enough.
      }

      // 2. Fetch localStorage histories (for guests & offline)
      let guestItems: HistoryDetail[] = [];
      try {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("snapflix_guest_history");
          if (stored) {
            guestItems = JSON.parse(stored);
          }
        }
      } catch {
        // Corrupted local history should never break the page.
      }

      // 3. Merge: prefer server items, append non-duplicate guest items
      const map = new Map<string, HistoryDetail>();
      for (const item of serverItems) {
        const key = `${item.type}_${item.media_id}_${item.season}_${item.episode}`;
        map.set(key, item);
      }
      for (const item of guestItems) {
        const key = `${item.type}_${item.media_id}_${item.season}_${item.episode}`;
        if (!map.has(key)) {
          map.set(key, item);
        }
      }

      // 4. Sort by latest updated_at
      const combined = Array.from(map.values()).sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );

      // 5. Deduplicate by show so each series displays its most recently watched episode
      const showMap = new Map<string, HistoryDetail>();
      for (const item of combined) {
        const key = `${item.type}_${item.media_id}`;
        if (!showMap.has(key)) {
          showMap.set(key, item);
        }
      }

      return Array.from(showMap.values());
    },
    queryKey: ["continue-watching"],
    staleTime: 0,
    refetchOnMount: "always",
  });

export default useWatchHistory;
