import { NextPage } from "next";
import dynamic from "next/dynamic";
import Footer from "@/components/ui/layout/Footer";
import LoadingScreen from "@/components/ui/other/LoadingScreen";

/** Shared fallback while a lazily loaded home section chunk arrives. */
const sectionFallback = (label: string) => () => (
  <LoadingScreen size="md" minHeight="inline" label={label} />
);

const NetflixHeroBillboard = dynamic(
  () => import("@/components/sections/Home/NetflixHeroBillboard"),
  { loading: sectionFallback("Loading today's trending") },
);
const ContinueWatching = dynamic(() => import("@/components/sections/Home/ContinueWatching"), {
  loading: sectionFallback("Loading your history"),
});
const HomePageList = dynamic(() => import("@/components/sections/Home/List"), {
  loading: sectionFallback("Loading SnapFlix"),
});

interface HomePageProps {
  searchParams: Promise<{
    content?: "movie" | "tv";
  }>;
}

const HomePage: NextPage<HomePageProps> = async ({ searchParams }) => {
  const { content } = await searchParams;

  return (
    <div className="flex flex-col">
      <NetflixHeroBillboard contentType={content === "tv" ? "tv" : "movie"} />

      <div className="relative z-10 flex flex-col gap-8 md:gap-11">
        <ContinueWatching />
        <HomePageList />
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
