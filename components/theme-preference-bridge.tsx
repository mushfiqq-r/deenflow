import { useEffect } from "react";
import { useDeenFlow } from "@/lib/deenflow/store";
import { useThemeContext } from "@/lib/theme-provider";

export function ThemePreferenceBridge({ children }: { children: React.ReactNode }) {
  const { data, isReady } = useDeenFlow();
  const { setColorScheme } = useThemeContext();

  useEffect(() => {
    if (isReady) setColorScheme(data.preferences.display);
  }, [data.preferences.display, isReady, setColorScheme]);

  return <>{children}</>;
}
