import { supabase } from "./supabase";

export async function getPeople() {
  const { data, error } = await supabase.from("people").select("*");

  console.log("SUPABASE DATA:", data);
  console.log("SUPABASE ERROR:", error);

  if (error) {
    return [];
  }

  return data ?? [];
}