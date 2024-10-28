"use client";
import { createClient } from "@/utils/supabase/client";

export default function CheckUser() {
  const supabase = createClient();

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data) {
      window.location.href = "/login";
    }
  };

  checkUser();

  return null;
}
