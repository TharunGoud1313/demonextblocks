"use client";
import React, { useEffect, useState } from "react";
import { MESSAGES_API, PLAN_API, TASKS_API } from "@/constants/envConfig";
import { toast } from "@/components/ui/use-toast";
import NewTask from "@/components/Tasks/NewTask";
import NewProject from "@/components/Projects/NewProject";
import NewMsg from "@/components/Msg/NewMsg";

const ViewMsg = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [msgData, setMsgData] = useState([]);

  useEffect(() => {
    const fetchPlanData = async () => {
      const response = await fetch(`${MESSAGES_API}?msg_id=eq.${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      });
      if (!response.ok) {
        toast({
          description: "Failed to fetch contact data",
          variant: "destructive",
        });
      }
      const data = await response.json();
      setMsgData(data[0]);
    };
    fetchPlanData();
  }, [id]);

  return (
    <div className="max-w-[800px]  w-full md:p-4 p-2 mx-auto">
      <NewMsg isEdit={false} data={msgData} isView={true} />
    </div>
  );
};

export default ViewMsg;
