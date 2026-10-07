import { siteConfig } from "@/config/site";
import { Metadata, NextPage } from "next/types";
import { cache, Suspense } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/utils/supabase/server";
import LoadingScreen from "@/components/ui/other/LoadingScreen";
const UnauthorizedNotice = dynamic(() => import("@/components/ui/notice/Unauthorized"), {
  loading: () => <LoadingScreen size="md" minHeight="section" label="Checking your session" />,
});
const LibraryList = dynamic(() => import("@/components/sections/Library/List"), {
  loading: () => <LoadingScreen size="lg" minHeight="section" label="Opening your library" />,
});

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
    <Suspense
      fallback={
        <LoadingScreen
          size="lg"
          minHeight="screen"
          label="Opening your library"
          className="pt-[calc(env(safe-area-inset-top)+5.5rem)]"
        />
      }
    >
      <div className="mx-auto min-h-[calc(100dvh-80px)] w-full max-w-7xl px-4 pt-[calc(env(safe-area-inset-top)+5.5rem)] pb-8 sm:px-6 md:px-12 md:pb-16 2xl:max-w-[1800px]">
        {error || !user ? (
          <UnauthorizedNotice
            title="Sign in to access your library"
            description="Create a free account to save your favorite movies and TV shows!"
          />
        ) : (
          <LibraryList />
        )}
      </div>
    </Suspense>
  );
};

export default LibraryPage;
