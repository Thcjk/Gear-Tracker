"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/library");
  }, [router]);

  return (
    <p className="text-sm text-paper-700 dark:text-paper-400">
      Weiterleitung zur Library…
    </p>
  );
}
