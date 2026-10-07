import LoadingScreen from "@/components/ui/other/LoadingScreen";

export default function Loading() {
  return (
    <LoadingScreen
      label="Opening search"
      size="lg"
      minHeight="screen"
      className="pt-[calc(env(safe-area-inset-top)+5.5rem)]"
    />
  );
}
