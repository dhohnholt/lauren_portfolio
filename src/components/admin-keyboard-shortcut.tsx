"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function AdminKeyboardShortcut() {
  const router = useRouter();
  const pressedKeys = useRef(new Set<string>());

  useEffect(() => {
    async function openAdminOrHome() {
      const { supabase } = await import("@/lib/supabase/client");
      const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
      router.push(data.session?.user ? "/admin" : "/");
    }

    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      pressedKeys.current.add(key);

      if (event.metaKey && key === "l") event.preventDefault();
      if (event.metaKey && pressedKeys.current.has("l") && pressedKeys.current.has("h")) {
        event.preventDefault();
        void openAdminOrHome();
      } else if (event.metaKey && key === "h") {
        event.preventDefault();
        router.push("/");
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      pressedKeys.current.delete(event.key.toLowerCase());
    }

    function clearPressedKeys() {
      pressedKeys.current.clear();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearPressedKeys);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearPressedKeys);
      clearPressedKeys();
    };
  }, [router]);

  return null;
}
