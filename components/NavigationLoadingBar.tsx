"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function NavigationLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // When path or search changes, it means navigation completed
    setIsAnimating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor && anchor.href && !anchor.href.includes("#") && anchor.target !== "_blank") {
        const currentUrl = window.location.href;
        const newUrl = anchor.href;

        if (currentUrl !== newUrl) {
          setIsAnimating(true);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          initial={{ width: "0%", opacity: 0 }}
          animate={{
            width: "70%",
            opacity: 1,
            transition: { duration: 2, ease: "easeOut" }
          }}
          exit={{
            width: "100%",
            opacity: 0,
            transition: { duration: 0.3, ease: "easeIn" }
          }}
          className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-purple-500 z-[100] shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        />
      )}
    </AnimatePresence>
  );
}
