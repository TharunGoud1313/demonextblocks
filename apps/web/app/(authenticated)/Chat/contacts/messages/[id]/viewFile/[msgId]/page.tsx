"use client";
import ChatFilePreview from "@/components/Chat/components/ChatFilePreview";
import { CHAT_MESSAGE_API } from "@/constants/envConfig";
import axiosInstance from "@/utils/axiosInstance";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const Page = ({ params }: { params: { id: string; msgId: string } }) => {
  const { id, msgId } = params;
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchMessageData = async () => {
      try {
        const response = await axiosInstance.get(
          `${CHAT_MESSAGE_API}?id=eq.${msgId}`
        );
        setData(response.data);
      } catch (error) {
        toast.error("Error fetching message data");
      }
    };
    fetchMessageData();
  }, [msgId, id]);

  return (
    <div className="max-w-[800px] mx-auto p-4">
      <ChatFilePreview data={data} id={id} msgId={msgId} />
    </div>
  );
};

export default Page;
