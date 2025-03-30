
import React, { useState } from "react";
import FileUpload from "@/components/file-upload/FileUpload";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Container } from "@/components/ui/container";
import UploadHistoryTab from "@/components/file-upload/UploadHistoryTab";
import UploadInstructions from "@/components/file-upload/UploadInstructions";
import { processFile } from "@/components/file-upload/FileProcessor";

const FileUploadPage: React.FC = () => {
  const handleFileUpload = (file: File, type: string, category: string) => {
    processFile(file, type, category);
  };

  return (
    <Container>
      <h1 className="text-3xl font-bold mb-6">Datei-Uploads</h1>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upload">Neue Datei hochladen</TabsTrigger>
          <TabsTrigger value="history">Verlauf</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="mt-6">
          <UploadInstructions />
          <FileUpload onFileUpload={handleFileUpload} />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <UploadHistoryTab />
        </TabsContent>
      </Tabs>
    </Container>
  );
};

export default FileUploadPage;
