
import React from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadButtonProps {
  onUpload: () => void;
  disabled: boolean;
  loading?: boolean;
}

const UploadButton: React.FC<UploadButtonProps> = ({ onUpload, disabled, loading = false }) => {
  return (
    <Button 
      onClick={onUpload} 
      disabled={disabled}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Upload className="h-4 w-4" />
      )}
      {loading ? 'Verarbeite...' : 'Hochladen'}
    </Button>
  );
};

export default UploadButton;
