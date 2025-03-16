
import React from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadButtonProps {
  onUpload: () => void;
  disabled: boolean;
}

const UploadButton: React.FC<UploadButtonProps> = ({ onUpload, disabled }) => {
  return (
    <Button 
      onClick={onUpload} 
      disabled={disabled}
      className="gap-2"
    >
      <Upload className="h-4 w-4" />
      Hochladen
    </Button>
  );
};

export default UploadButton;
