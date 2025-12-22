import { useEffect, useState, useCallback } from "react";
import supabase from "../utils/supabase";

export const useClinicalRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch rules from Supabase
  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("clinical_rules")
        .select("*")
        .order("created_date", { ascending: true }); // Make sure this column exists

      if (error) {
        console.error("Error fetching rules:", error.message || error);
        setRules([]);
      } else {
        setRules(data || []);
      }
    } catch (err) {
      console.error("Unexpected error fetching rules:", err);
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  return { rules, loading, refreshRules: fetchRules };
};
