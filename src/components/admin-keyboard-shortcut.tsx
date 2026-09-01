"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export function AdminKeyboardShortcut() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pressedKeys = useRef(new Set<string>());

  useEffect(() => {
    if (!supabase) return;

    let isActive = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (isActive) setIsAuthenticated(Boolean(data.user));
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
    });

    return () => {
      isActive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      pressedKeys.current.add(key);

      if (isAuthenticated && event.metaKey && key === "l") event.preventDefault();
      if (isAuthenticated && event.metaKey && pressedKeys.current.has("l") && pressedKeys.current.has("h")) {
        event.preventDefault();
        router.push("/admin");
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
  }, [isAuthenticated, router]);

  return null;
}
