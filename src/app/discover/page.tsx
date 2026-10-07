import { Metadata, NextPage } from "next/types";
import { siteConfig } from "@/config/site";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Footer from "@/components/ui/layout/Footer";
import LoadingScreen from "@/components/ui/other/LoadingScreen";

const DiscoverListGroup = dynamic(() => import("@/components/sections/Discover/ListGroup"), {
  loading: () => <LoadingScreen size="lg" minHeight="screen" label="Loading new & popular" />,
});

export const metadata: Metadata = {
  title: `New & Popular | ${siteConfig.name}`,
};

const DiscoverPage: NextPage = () => {
  return (
    <Suspense
      fallback={<LoadingScreen size="lg" minHeight="screen" label="Loading new & popular" />}
    >
      <div className="flex flex-col">
        <DiscoverListGroup />
        <Footer />
      </div>
    </Suspense>
  );
};

export default DiscoverPage;
