"use client";

import { useCustomCarousel } from "@/hooks/useCustomCarousel";
import { ScrollShadow } from "@heroui/react";
import IconButton from "../button/IconButton";
import { EmblaOptionsType, EmblaPluginType } from "embla-carousel";
import { cn } from "@/utils/helpers";
import styles from "@/styles/embla-carousel.module.css";
import { ChevronLeft, ChevronRight } from "@/utils/icons";

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  withScrollShadow?: boolean;
  isButtonDisabled?: boolean;
  autoHideButton?: boolean;
  options?: EmblaOptionsType;
  plugins?: EmblaPluginType[];
  classNames?: {
    container?: string;
    viewport?: string;
    wrapper?: string;
  };
}

/**
 * Horizontal scroller used by every rail.
 *
 * Arrows are floating glass circles tinted by the current cover-art accent so
 * navigation stays visible on top of artwork without breaking the theme.
 */
const Carousel = ({
  children,
  withScrollShadow = false,
  isButtonDisabled = false,
  autoHideButton = true,
  options = { dragFree: true, slidesToScroll: "auto" },
  plugins,
  classNames,
  ...props
}: CarouselProps) => {
  const c = useCustomCarousel(options, plugins);

  const getVisibility = () => {
    if (c.canScrollPrev && c.canScrollNext) return "both";
    if (c.canScrollPrev) return "left";
    if (c.canScrollNext) return "right";
    return "none";
  };

  const arrowClasses =
    "absolute top-1/2 z-20 size-10 -translate-y-1/2 rounded-full border border-white/12 bg-black/45 text-white backdrop-blur-xl transition-all duration-300 hover:bg-[var(--sf-accent)] hover:text-[var(--sf-on-accent)] hover:shadow-[0_0_20px_var(--sf-glow)]";

  return (
    <ScrollShadow
      isEnabled={withScrollShadow}
      orientation="horizontal"
      visibility={getVisibility()}
      size={40}
      hideScrollBar
    >
      <div
        {...props}
        className={cn(styles.wrapper, "group/carousel", classNames?.wrapper, {
          "relative w-full": !isButtonDisabled,
        })}
      >
        {!isButtonDisabled && (
          <>
            <div
              className={cn("absolute left-1 z-30", {
                "md:block": autoHideButton,
                hidden: !c.canScrollPrev,
              })}
            >
              <IconButton
                onPress={c.scrollPrev}
                aria-label="Scroll left"
                disableRipple
                icon={<ChevronLeft className="size-4" />}
                className={arrowClasses}
              />
            </div>
            <div
              className={cn("absolute right-1 z-30", {
                "md:block": autoHideButton,
                hidden: !c.canScrollNext,
              })}
            >
              <IconButton
                onPress={c.scrollNext}
                aria-label="Scroll right"
                disableRipple
                icon={<ChevronRight className="size-4" />}
                className={arrowClasses}
              />
            </div>
          </>
        )}

        <div className={cn(styles.viewport, classNames?.viewport)} ref={c.emblaRef}>
          <div className={cn(styles.container, classNames?.container)}>{children}</div>
        </div>
      </div>
    </ScrollShadow>
  );
};

export default Carousel;
