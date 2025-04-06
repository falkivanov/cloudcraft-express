
import { useState } from "react";

export const useConcessionsExpand = () => {
  const [expandedTransportId, setExpandedTransportId] = useState<string | null>(null);
  
  const toggleExpandTransportId = (transportId: string) => {
    setExpandedTransportId(current => 
      current === transportId ? null : transportId
    );
  };
  
  return {
    expandedTransportId,
    toggleExpandTransportId
  };
};
