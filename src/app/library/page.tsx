import { siteConfig } from "@/config/site";
import { Metadata, NextPage } from "next/types";
import { cache, Suspense } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/utils/supabase/server";
const UnauthorizedNotice = dynamic(() => import("@/components/ui/notice/Unauthorized"));
const LibraryList = dynamic(() => import("@/components/sections/Library/List"));

export const metadata: Metadata = {
  title: `Library | ${siteConfig.name}`,
};

const getUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { user, error };
});

const LibraryPage: NextPage = async () => {
  const { user, error } = await getUser();

  return (
    <Suspense>
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-8 pb-28 md:px-12 md:pb-14">
        {error || !user ? (
          <UnauthorizedNotice
            title="Sign in to access your library"
            description="Create a free account to keep your watchlist in one place."
          />
        ) : (
          <LibraryList />
        )}
      </div>
    </Suspense>
  );
};

export default LibraryPage;
