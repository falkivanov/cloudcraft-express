
import React from "react";
import { ProcessedFile } from "@/services/fileProcessingService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, FileType } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FileHistoryProps {
  files: ProcessedFile[];
}

const FileHistory: React.FC<FileHistoryProps> = ({ files }) => {
  if (files.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <h3 className="text-lg font-medium mb-2">Keine verarbeiteten Dateien</h3>
        <p className="text-muted-foreground">
          Verarbeitete Dateien werden hier angezeigt
        </p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileType className="h-5 w-5 text-red-500" />;
      case "excel":
        return <FileType className="h-5 w-5 text-green-500" />;
      case "csv":
        return <FileType className="h-5 w-5 text-blue-500" />;
      case "html":
        return <FileType className="h-5 w-5 text-orange-500" />;
      default:
        return <FileType className="h-5 w-5" />;
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Typ</TableHead>
            <TableHead>Dateiname</TableHead>
            <TableHead>Größe</TableHead>
            <TableHead>Verarbeitet am</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file, index) => (
            <TableRow key={index}>
              <TableCell>{getFileIcon(file.fileType)}</TableCell>
              <TableCell className="font-medium">{file.fileName}</TableCell>
              <TableCell>{formatFileSize(file.fileSize)}</TableCell>
              <TableCell>{formatDate(file.processedAt)}</TableCell>
              <TableCell className="text-right">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Inhalt
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                      <DialogTitle>{file.fileName}</DialogTitle>
                      <DialogDescription>
                        {file.fileType.toUpperCase()} verarbeitet am {formatDate(file.processedAt)}
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                      <pre className="text-sm whitespace-pre-wrap">
                        {file.content}
                      </pre>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FileHistory;
