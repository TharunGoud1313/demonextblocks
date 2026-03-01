"use client";
import React, { useEffect, useState } from "react";
import { MESSAGES_API, TASKS_API } from "@/constants/envConfig";
import { toast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import NewTask from "@/components/Tasks/Task/NewTask";

const EditTask = ({ params }: { params: { id: string; task_id: string } }) => {
  const { id, task_id } = params;
  const [taskData, setTaskData] = useState([]);

  useEffect(() => {
    const fetchTaskData = async () => {
      const response = await fetch(`${TASKS_API}?task_id=eq.${task_id}`, {
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
      setTaskData(data[0]);
    };
    fetchTaskData();
  }, [id, task_id]);

  return (
    <div className="max-w-[800px]  w-full md:p-4 p-2 mx-auto">
      <NewTask data={taskData} isEdit={true} isView={false} id={id} />
    </div>
  );
};

export default EditTask;
