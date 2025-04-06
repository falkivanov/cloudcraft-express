
import { useState, useEffect } from "react";

export const useConcessionsData = () => {
  const [concessionsData, setConcessionsData] = useState<any>(null);

  useEffect(() => {
    try {
      const data = localStorage.getItem("concessionsData");
      if (data) {
        setConcessionsData(JSON.parse(data));
      }
    } catch (error) {
      console.error("Error parsing concessions data:", error);
    }
  }, []);

  return { concessionsData };
};
