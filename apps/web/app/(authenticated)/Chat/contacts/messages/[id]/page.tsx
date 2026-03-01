import ChatMessages from "@/components/Chat/TabPages/ChatMessages";
import React from "react";

const page = ({ params }: { params: { id: string } }) => {
  return (
    <div className="min-h-[calc(90vh-200px)] overflow-hidden h-full max-w-[800px] mx-auto p-4 w-full">
      <ChatMessages chatId={params.id} isGroup={false} />
    </div>
  );
};

export default page;
