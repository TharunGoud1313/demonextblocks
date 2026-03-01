"use client";
import { SAVE_FORM_FIELDS } from "@/constants/envConfig";
import axiosInstance from "@/utils/axiosInstance";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import SendMediaCardJSON from "../AgentMaker/chat-with-data-json/SendMediaCard";

const AgentChatEditor = ({ chatId }: { chatId?: string }) => {
  const [chatData, setChatData] = useState<any>(null);

  useEffect(() => {
    const fetchChatData = async () => {
      const response = await axiosInstance.get(
        `${SAVE_FORM_FIELDS}?form_id=eq.${chatId}`
      );
      console.log(response.data);
      setChatData(response.data);
    };
    fetchChatData();
  }, [chatId]);

  console.log("chatData----", chatData);
  return (
    <div>
      AgentChatEditor {chatId}
      <Card className="w-full overflow-hidden">
        <CardContent className="space-y-4 p-4">
          {(chatData?.media_card_data?.media_url ||
            chatData?.media_card_data?.custom_html) && (
            <div className="mb-4">
              <SendMediaCardJSON
                field={chatData}
                formData={chatData}
                onRadioChange={() => {}}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentChatEditor;
