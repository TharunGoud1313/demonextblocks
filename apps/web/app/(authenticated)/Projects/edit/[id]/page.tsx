"use client";
import React, { useEffect, useState } from "react";
import { PLAN_API } from "@/constants/envConfig";
import { toast } from "@/components/ui/use-toast";
import NewProject from "@/components/Projects/NewProject";

const EditPlans = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [planData, setPlanData] = useState([]);

  useEffect(() => {
    const fetchPlanData = async () => {
      const response = await fetch(`${PLAN_API}?plan_id=eq.${id}`, {
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
      setPlanData(data[0]);
    };
    fetchPlanData();
  }, [id]);

  return (
    <div className="max-w-[800px]  w-full md:p-4 p-2 mx-auto">
      <NewProject data={planData} isEdit={true} isView={false} />
    </div>
  );
};

export default EditPlans;
