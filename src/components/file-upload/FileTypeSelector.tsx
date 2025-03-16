
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fileTypes } from "./fileTypes";

interface FileTypeSelectorProps {
  selectedFileType: string;
  onTypeChange: (value: string) => void;
}

const FileTypeSelector: React.FC<FileTypeSelectorProps> = ({
  selectedFileType,
  onTypeChange,
}) => {
  return (
    <Select
      value={selectedFileType}
      onValueChange={onTypeChange}
    >
      <SelectTrigger>
        <SelectValue placeholder="Dateityp auswählen" />
      </SelectTrigger>
      <SelectContent>
        {fileTypes.map(type => (
          <SelectItem key={type.id} value={type.id}>
            {type.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FileTypeSelector;
