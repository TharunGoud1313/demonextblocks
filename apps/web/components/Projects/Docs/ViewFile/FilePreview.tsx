"use client";
import { DocumentViewer } from "react-documents";

interface FilePreviewProps {
  data: {
    doc_file_url: string;
    file_type?: string;
  }[];
}

const FilePreview = ({ data }: FilePreviewProps) => {
  if (!data || !data.length || !data[0]?.doc_file_url) {
    return (
      <div className="flex items-center justify-center p-6 border rounded-lg bg-gray-50">
        <p className="text-gray-500">No file available for preview</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] border rounded-lg overflow-hidden">
      <DocumentViewer queryParams="hl=Nl" url={data[0]?.doc_file_url} />
    </div>
  );
};

export default FilePreview;
