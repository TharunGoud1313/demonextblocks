import ChatMessages from "@/components/Chat/TabPages/ChatMessages";
import React from "react";

const page = ({ params }: { params: { chat_group_id: string } }) => {
  return (
    <div className="min-h-[calc(90vh-200px)] overflow-hidden h-full max-w-[800px] mx-auto p-4 w-full">
      <ChatMessages chatId={params.chat_group_id} isGroup={true} />
    </div>
  );
};

export default page;
