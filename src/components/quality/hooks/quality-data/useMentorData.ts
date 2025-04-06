
import { useState, useEffect } from "react";

export const useMentorData = () => {
  const [mentorData, setMentorData] = useState<any>(null);

  useEffect(() => {
    try {
      const data = localStorage.getItem("mentorData");
      if (data) {
        setMentorData(JSON.parse(data));
      }
    } catch (error) {
      console.error("Error parsing mentor data:", error);
    }
  }, []);

  return { mentorData };
};
