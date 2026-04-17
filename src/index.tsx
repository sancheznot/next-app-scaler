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
  /** EN: Current CSS scale factor (1 when inactive). ES: Factor scale (1 si inactivo). */
  scale: number;
  /** EN: True when Windows/Linux HiDPI sandbox is on (transform + fixed root). ES: Scaler activo. */
  isActive: boolean;
}

const ScalerContext = createContext<ScalerContextType>({
  scalerRef: { current: null },
  scale: 1,
  isActive: false,
});

export const useScaler = () => useContext(ScalerContext);

/** EN: Root wrapper props. ES: Props del contenedor raíz. */
export type AppScalerProps = {
  children: React.ReactNode;
  /**
   * EN: Extra classes on the scaler root (merged after defaults). Use for Safari/iOS tweaks, e.g. `min-h-svh` or safe-area utilities.
   * ES: Clases extra en el root (se añaden a las por defecto). Útil en Safari/iOS: `min-h-svh`, safe-area, etc.
   */
  className?: string;
};

const APP_SCALER_ROOT_CLASSES =
  "app-scaler-root min-h-svh h-dvh w-full bg-background flex flex-col [&>*:first-child]:min-h-full [&>*:first-child]:grow";

export function AppScaler({ children, className }: AppScalerProps) {
  const scalerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // EN: Same math as always — only how often we re-run it changes (resize + visualViewport).
    // ES: Misma lógica; visualViewport ayuda cuando el zoom no dispara solo window.resize.
    const handleResize = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const isMac = /Macintosh/i.test(navigator.userAgent);
      const ratio = window.devicePixelRatio;
      const needsScaling = !isMobile && !isMac && ratio > 1;
      const nextScale = needsScaling ? 1 / ratio : 1;

      setScale((prev) => (Math.abs(prev - nextScale) < 1e-9 ? prev : nextScale));
      setIsActive((prev) => (prev === needsScaling ? prev : needsScaling));

      if (needsScaling) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (vv) {
      vv.addEventListener("resize", handleResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (vv) {
        vv.removeEventListener("resize", handleResize);
      }
      document.body.style.overflow = "";
    };
  }, []);

  const width = isActive ? `${100 * (1 / scale)}%` : "100%";
  const height = isActive ? `${100 * (1 / scale)}%` : "100%";

  return (
    <ScalerContext.Provider value={{ scalerRef, scale, isActive }}>
      <div
        ref={scalerRef}
        data-app-scaler-active={isActive ? "true" : "false"}
        data-app-scaler-scale={scale}
        style={{
          width: isActive ? width : undefined,
          height: isActive ? height : undefined,
          transform: isActive ? `scale(${scale})` : undefined,
          // EN: Hint compositor — no layout change. ES: Solo capa GPU; no cambia tamaños.
          willChange: isActive ? "transform" : undefined,
          transformOrigin: "top left",
          position: isActive ? "fixed" : "relative",
          top: 0,
          left: 0,
          overflowY: isActive ? "auto" : "unset",
          overflowX: "hidden",
        }}
        className={
          className ? `${APP_SCALER_ROOT_CLASSES} ${className}` : APP_SCALER_ROOT_CLASSES
        }
      >
        {children}
      </div>
    </ScalerContext.Provider>
  );
}

