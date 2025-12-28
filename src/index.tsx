"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface ScalerContextType {
  scalerRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
}

const ScalerContext = createContext<ScalerContextType>({
  scalerRef: { current: null },
  scale: 1,
});

export const useScaler = () => useContext(ScalerContext);

export function AppScaler({ children }: { children: React.ReactNode }) {
  const scalerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check for scaling needs
    const handleResize = () => {
      // Basic mobile detection
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      // Also check for Mac (Retina displays usually have high DPR but shouldn't be scaled down)
      const isMac = /Macintosh/i.test(navigator.userAgent);
      
      // Scaling only needed on desktop high-DPI (mostly Windows/Linux)
      // Mobile devices & Mac handle DPI scaling natively for readability.
      const ratio = window.devicePixelRatio;
      const needsScaling = !isMobile && !isMac && ratio > 1;

      if (needsScaling) {
        setScale(1 / ratio);
        setIsActive(true);
        // Lock body scroll when active, as scrolling is handled by the Scaler
        document.body.style.overflow = "hidden";
      } else {
        setScale(1);
        setIsActive(false);
        document.body.style.overflow = "";
      }
    };

    // Initial check
    handleResize();

    // Listen for resize/zoom changes
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "";
    };
  }, []);

  const width = isActive ? `${100 * (1 / scale)}%` : "100%";
  const height = isActive ? `${100 * (1 / scale)}%` : "100%";

  return (
    <ScalerContext.Provider value={{ scalerRef, scale }}>
      <div
        ref={scalerRef}
        style={{
          width: isActive ? width : undefined,
          height: isActive ? height : undefined,
          transform: isActive ? `scale(${scale})` : undefined,
          transformOrigin: "top left",
          position: isActive ? "fixed" : "relative",
          top: 0,
          left: 0,
          overflowY: isActive ? "auto" : "unset",
          overflowX: "hidden",
        }}
        className="app-scaler-root h-dvh w-full bg-background flex flex-col [&>*:first-child]:min-h-full [&>*:first-child]:grow"
      >
        {children}
      </div>
    </ScalerContext.Provider>
  );
}

