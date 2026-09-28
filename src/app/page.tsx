import { NextPage } from "next";
import dynamic from "next/dynamic";
import Footer from "@/components/ui/layout/Footer";

const NetflixHeroBillboard = dynamic(
  () => import("@/components/sections/Home/NetflixHeroBillboard"),
);
const HomePageList = dynamic(() => import("@/components/sections/Home/List"));

interface HomePageProps {
  searchParams: Promise<{
    content?: "movie" | "tv";
  }>;
}

const HomePage: NextPage<HomePageProps> = async ({ searchParams }) => {
  const { content } = await searchParams;

  return (
    <div className="flex flex-col">
      {/* Full-bleed cinematic hero, themed by its own artwork */}
      <NetflixHeroBillboard contentType={content === "tv" ? "tv" : "movie"} />

      {/* Switcher, tiles, continue watching and content rails */}
      <div className="pt-4 md:pt-6">
        <HomePageList />
      </div>

      {/* Netflix Styled Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
