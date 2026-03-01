"use client";
import NewGroup from "@/components/Chat/TabPages/Groups/NewGroup";
import { CHAT_GROUP_API } from "@/constants/envConfig";
import axiosInstance from "@/utils/axiosInstance";
import React, { useEffect, useState } from "react";

const Page = ({ params }: { params: { chat_group_id: string } }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `${CHAT_GROUP_API}?chat_group_id=eq.${params.chat_group_id}`
        );
        setData(response.data[0]);
      } catch (error) {
        console.log("error----", error);
      }
    };
    fetchData();
  }, [params.chat_group_id]);
  return (
    <div className="max-w-[800px] w-full mx-auto p-4">
      <NewGroup isEdit={true} data={data} />
    </div>
  );
};

export default Page;
