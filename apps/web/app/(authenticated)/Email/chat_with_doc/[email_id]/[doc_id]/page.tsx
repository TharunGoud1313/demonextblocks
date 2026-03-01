import ChatwithDoc from "@/components/Email/pages/ChatwithDoc/ChatwithDoc";
import React from "react";

const page = ({ params }: { params: { email_id: string; doc_id: string } }) => {
  const { email_id, doc_id } = params;
  return (
    <div className="max-w-[800px] mx-auto p-4 w-full">
      <div className="h-full w-full">
        <ChatwithDoc emailId={email_id} docId={doc_id} />
      </div>
    </div>
  );
};

export default page;
