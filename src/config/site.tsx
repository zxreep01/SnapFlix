import { tmdb } from "@/api/tmdb";
import { SiteConfigType } from "@/types";
import { BiSearchAlt2, BiSolidSearchAlt2 } from "react-icons/bi";
import { GoHomeFill, GoHome } from "react-icons/go";
import { FaTv } from "react-icons/fa6";
import { IoTrendingUp } from "react-icons/io5";
import { MdMovie } from "react-icons/md";
import { TbFolder, TbFolderFilled } from "react-icons/tb";

export const siteConfig: SiteConfigType = {
  name: "SnapFlix",
  description: "Watch Movies & TV Shows Online on SnapFlix - Your Private Streaming Platform.",
  favicon: "/snapflix.png",
  navItems: [
    {
      label: "Home",
      href: "/",
      icon: <GoHome className="size-full" />,
      activeIcon: <GoHomeFill className="size-full" />,
    },
    {
      label: "TV Shows",
      href: "/?content=tv",
      icon: <FaTv className="size-full" />,
      activeIcon: <FaTv className="size-full" />,
    },
    {
      label: "Movies",
      href: "/?content=movie",
      icon: <MdMovie className="size-full" />,
      activeIcon: <MdMovie className="size-full" />,
    },
    {
      label: "New & Popular",
      href: "/discover",
      icon: <IoTrendingUp className="size-full" />,
      activeIcon: <IoTrendingUp className="size-full" />,
    },
    {
      label: "My Library",
      href: "/library",
      icon: <TbFolder className="size-full" />,
      activeIcon: <TbFolderFilled className="size-full" />,
    },
  ],
  queryLists: {
    movies: [
      {
        name: "Today's Trending Movies",
        query: () => tmdb.trending.trending("movie", "day"),
        param: "todayTrending",
      },
      {
        name: "This Week's Trending Movies",
        query: () => tmdb.trending.trending("movie", "week"),
        param: "thisWeekTrending",
      },
      {
        name: "Popular Movies",
        query: () => tmdb.movies.popular(),
        param: "popular",
      },
      {
        name: "Now Playing Movies",
        query: () => tmdb.movies.nowPlaying(),
        param: "nowPlaying",
      },
      {
        name: "Upcoming Movies",
        query: () => tmdb.movies.upcoming(),
        param: "upcoming",
      },
      {
        name: "Top Rated Movies",
        query: () => tmdb.movies.topRated(),
        param: "topRated",
      },
    ],
    tvShows: [
      {
        name: "Today's Trending TV Shows",
        query: () => tmdb.trending.trending("tv", "day"),
        param: "todayTrending",
      },
      {
        name: "This Week's Trending TV Shows",
        query: () => tmdb.trending.trending("tv", "week"),
        param: "thisWeekTrending",
      },
      {
        name: "Popular TV Shows",
        // @ts-expect-error: Property 'adult' is missing in type 'PopularTvShowResult' but required in type 'TV'.
        query: () => tmdb.tvShows.popular(),
        param: "popular",
      },
      {
        name: "On The Air TV Shows",
        // @ts-expect-error: Property 'adult' is missing in type 'OnTheAirResult' but required in type 'TV'.
        query: () => tmdb.tvShows.onTheAir(),
        param: "onTheAir",
      },
      {
        name: "Top Rated TV Shows",
        // @ts-expect-error: Property 'adult' is missing in type 'TopRatedTvShowResult' but required in type 'TV'.
        query: () => tmdb.tvShows.topRated(),
        param: "topRated",
      },
    ],
  },
  socials: {
    help: "/about",
  },
};

export type SiteConfig = typeof siteConfig;
