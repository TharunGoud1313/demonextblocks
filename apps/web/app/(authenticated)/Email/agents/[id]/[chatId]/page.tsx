"use client";
import AgentEditor from "@/components/Agents/AgentEditor";
import CardRender from "@/components/Agents/Chat/Card";
import ChatEditor from "@/components/Agents/Chat/ChatEditor";
import AgentPreview from "@/components/Email/TabPages/Agent/AgentPreview";
import { SAVE_FORM_FIELDS } from "@/constants/envConfig";
import axiosInstance from "@/utils/axiosInstance";
import React, { useEffect, useState } from "react";

const Page = ({ params }: { params: { id: string; chatId: string } }) => {
  const { id, chatId } = params;
  const [chatData, setChatData] = useState<any>(null);

  useEffect(() => {
    const fetchChatData = async () => {
      const response = await axiosInstance.get(
        `${SAVE_FORM_FIELDS}?form_id=eq.${id}`
      );
      setChatData(response.data[0]);
    };
    fetchChatData();
  }, [id]);
  return (
    <div className="min-h-[calc(90vh-200px)] overflow-hidden h-full max-w-[800px] mx-auto p-4 w-full">
      <AgentPreview field={chatData} chatId={chatId} />
    </div>
  );
};

export default Page;
