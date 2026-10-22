import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Task = Tables<"tasks">;
export const CATEGORIES = ["Work", "Personal", "Health", "Learning", "Errands"] as const;
export const PRIORITIES = ["high", "medium", "low"] as const;

export const tasksQuery = queryOptions({
  queryKey: ["tasks"],
  queryFn: async () => {
    const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});
