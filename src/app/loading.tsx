import LoadingScreen from "@/components/ui/other/LoadingScreen";

/**
 * Root route loading state.
 *
 * Every screen that does not ship its own `loading.tsx` falls back to this one,
 * so navigation never lands on an empty frame.
 */
export default function Loading() {
  return <LoadingScreen label="Loading SnapFlix" size="lg" minHeight="screen" />;
}
