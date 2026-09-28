import { Card, CardHeader, CardBody, CardFooter, Skeleton } from "@heroui/react";

interface PosterCardSkeletonProps {
  variant?: "full" | "bordered";
}

const PosterCardSkeleton: React.FC<PosterCardSkeletonProps> = ({ variant = "full" }) => {
  if (variant === "full") {
    return (
      <Skeleton className="aspect-2/3 w-[136px] shrink-0 rounded-2xl sm:w-[148px] md:w-[156px] lg:w-[168px]" />
    );
  }

  return (
    <Card fullWidth shadow="md">
      <CardHeader className="flex content-center justify-center">
        <Skeleton className="aspect-2/3 w-full rounded-2xl" />
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
