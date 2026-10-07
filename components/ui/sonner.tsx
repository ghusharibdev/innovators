"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Dark-only toaster wrapper. The app is dark-first, so no theme hook is needed
 * (and next-themes is deliberately not part of the locked stack).
 */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      richColors
      closeButton
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "glass group toast group-[.toaster]:border-border group-[.toaster]:bg-surface/90 group-[.toaster]:text-foreground group-[.toaster]:backdrop-blur-xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-accent-gradient group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
