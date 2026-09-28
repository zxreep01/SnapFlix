"use client";

import useBreakpoints from "@/hooks/useBreakpoints";
import { Accordion, AccordionItem, Link } from "@heroui/react";

const FAQS = [
  {
    title: "What is SnapFlix?",
    description:
      "SnapFlix is a private streaming catalog platform designed to help you discover and watch movies and TV shows effortlessly, with an immersive Netflix-inspired viewing experience.",
  },
  {
    title: "So what do we actually do?",
    description:
      "We do not host or store any copyright-protected files. Everything you stream is embedded from third-party providers, so please support the official release where you can.",
  },
  {
    title: "I cannot watch video because of ads",
    description: (
      <p>
        We are very sorry that we can't help you with that. We have no control in the ads being
        served. Don't download anything in the popups. If you don't want to be annoyed. We highly
        recommend subscribing to a legal streaming service that you can afford (or use an adblocker
        like{" "}
        <Link href="https://ublockorigin.com/" target="_blank" className="font-bold">
          uBlock Origin
        </Link>{" "}
        or{" "}
        <Link href="https://adblockplus.org/" target="_blank" className="font-bold">
          Adblock Plus
        </Link>
        ).
      </p>
    ),
  },
  {
    title: "Streaming speed is slow or all videos do not play",
    description:
      "Open the episode and press Play. If the stream stalls, switch to another server from the list in the top right of the player.",
  },
  {
    title: "I want to download video",
    description:
      "Since we don't store any files, so we don't have any download feature here. All files found on this site have been collected from various sources across the web and are believed to be in the public domain.",
  },
  {
    title: "Is it safe to stream in this website?",
    description:
      "This website is undoubtedly safer to stream, however downloading, uploading is illegal. You will not get into any trouble while using our website. It's highly not recommended to download the files and share them to the public, It might get you in trouble.",
  },
];

const FAQ = () => {
  const { mobile } = useBreakpoints();

  return (
    <Accordion variant="splitted" isCompact={mobile} className="w-full">
      {FAQS.map(({ title, description }) => (
        <AccordionItem
          key={title}
          aria-label={title}
          title={<span className="text-sm font-medium text-white/90">{title}</span>}
        >
          {description}
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FAQ;
