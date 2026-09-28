import { ColorType } from "@/types/component";
import { cn } from "@/utils/helpers";
import { tv } from "tailwind-variants";

export interface SectionTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: ColorType;
  size?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  classNames?: {
    container?: string;
    indicator?: string;
    title?: string;
  };
}

const title = tv({
  base: "nf-row-title font-bold",
  variants: {
    size: {
      h1: "text-xl md:text-2xl",
      h2: "text-lg md:text-xl",
      h3: "text-base md:text-lg",
      h4: "text-xl md:text-2xl",
      h5: "text-lg md:text-xl",
      h6: "text-base md:text-lg",
    },
  },
  defaultVariants: {
    size: "h5",
  },
});

const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  color = "primary",
  size,
  className,
  classNames,
  ...props
}) => {
  return (
    <div className={cn("flex items-center gap-2", classNames?.container, className)} {...props}>
      <h1 className={cn(title({ size }), classNames?.title)}>{children}</h1>
    </div>
  );
};

export default SectionTitle;
