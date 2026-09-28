import { siteConfig } from "@/config/site";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Metadata, NextPage } from "next/types";
import Footer from "@/components/ui/layout/Footer";

const SearchIndex = dynamic(() => import("@/components/sections/Search/Index"));

export const metadata: Metadata = {
  title: `Search | ${siteConfig.name}`,
};

const SearchPage: NextPage = () => {
  return (
    <Suspense>
      <div className="flex flex-col">
        <SearchIndex />
        <Footer />
      </div>
    </Suspense>
  );
};

export default SearchPage;
