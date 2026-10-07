import { Metadata, NextPage } from "next/types";
import dynamic from "next/dynamic";
import { Suspense } from "react";

import Footer from "@/components/ui/layout/Footer";
import LoadingScreen from "@/components/ui/other/LoadingScreen";
import { siteConfig } from "@/config/site";

const SearchList = dynamic(() => import("@/components/sections/Search/List"), {
  loading: () => (
    <LoadingScreen
      size="lg"
      minHeight="screen"
      label="Opening search"
      className="pt-[calc(env(safe-area-inset-top)+5.5rem)]"
    />
  ),
});

export const metadata: Metadata = {
  title: `Search | ${siteConfig.name}`,
};

const SearchPage: NextPage = () => {
  return (
    <Suspense
      fallback={
        <LoadingScreen
          size="lg"
          minHeight="screen"
          label="Opening search"
          className="pt-[calc(env(safe-area-inset-top)+5.5rem)]"
        />
      }
    >
      <div className="mx-auto flex min-h-screen w-full max-w-7xl min-w-0 flex-col px-4 pt-[calc(env(safe-area-inset-top)+5.5rem)] pb-8 sm:px-8 md:px-12">
        <SearchList />
      </div>
      <Footer />
    </Suspense>
  );
};

export default SearchPage;
