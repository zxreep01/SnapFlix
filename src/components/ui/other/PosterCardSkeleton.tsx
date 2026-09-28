import { Card, CardHeader, CardBody, CardFooter, Skeleton } from "@heroui/react";

interface PosterCardSkeletonProps {
  variant?: "full" | "bordered";
}

const PosterCardSkeleton: React.FC<PosterCardSkeletonProps> = ({ variant = "full" }) => {
  if (variant === "full") {
    return (
      <Skeleton className="aspect-square w-[112px] shrink-0 rounded-sf sm:w-[124px] md:w-[132px] lg:w-[144px]" />
    );
  }

  return (
    <Card fullWidth shadow="md">
      <CardHeader className="flex content-center justify-center">
        <Skeleton className="aspect-square w-full rounded-sf" />
      </CardHeader>
      <CardBody className="gap-3 overflow-visible pb-0 pt-1">
        <Skeleton className="h-3 w-full rounded-full" />
      </CardBody>
      <CardFooter className="justify-between">
        <Skeleton className="h-3 w-12 rounded-full" />
        <Skeleton className="h-3 w-12 rounded-full" />
      </CardFooter>
    </Card>
  );
};

export default PosterCardSkeleton;
