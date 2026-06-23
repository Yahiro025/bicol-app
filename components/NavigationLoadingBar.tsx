"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function NavigationLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => { setIsAnimating(false); }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (anchor?.href && !anchor.href.includes("#") && anchor.target !== "_blank" && anchor.href !== window.location.href) {
        setIsAnimating(true);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          initial={{ width: "0%", opacity: 0 }}
          animate={{ width: "70%", opacity: 1, transition: { duration: 2, ease: "easeOut" } }}
          exit={{ width: "100%", opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }}
          className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-purple-500 z-[100] shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        />
      )}
    </AnimatePresence>
  );
}
