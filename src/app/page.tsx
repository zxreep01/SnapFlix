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
      {/* Full-bleed billboard that runs under the translucent top bar */}
      <div className="-mt-14 md:-mt-16">
        <NetflixHeroBillboard contentType={content === "tv" ? "tv" : "movie"} />
      </div>

      {/* Continue watching, the Top 10 row and the catalogue rails */}
      <div className="pt-6 md:pt-10">
        <HomePageList />
      </div>

      {/* Netflix Styled Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
