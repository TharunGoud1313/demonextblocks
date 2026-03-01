"use client";
import React, { useEffect, useState } from "react";
import { TASKS_API } from "@/constants/envConfig";
import { toast } from "@/components/ui/use-toast";
import NewTask from "@/components/Tasks/NewTask";

const EditTasks = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [taskData, setTaskData] = useState([]);

  useEffect(() => {
    const fetchTaskData = async () => {
      const response = await fetch(`${TASKS_API}?task_id=eq.${id}`, {
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
  }, [id]);

  return (
    <div className="max-w-[800px]  w-full md:p-4 p-2 mx-auto">
      <NewTask data={taskData} isEdit={true} isView={false} />
    </div>
  );
};

export default EditTasks;
