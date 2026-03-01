"use client";
import React, { useEffect, useState } from "react";
import { PLAN_API, PLAN_PHASE_API } from "@/constants/envConfig";
import { toast } from "@/components/ui/use-toast";
import NewPlanPhase from "@/components/Projects/planPhase/NewPlanPhase";

const EditPlanPhase = ({
  params,
}: {
  params: { id: string; plan_phase_id: string };
}) => {
  const { id, plan_phase_id } = params;
  const [planData, setPlanData] = useState([]);

  useEffect(() => {
    const fetchPlanData = async () => {
      const response = await fetch(
        `${PLAN_PHASE_API}?plan_phase_id=eq.${plan_phase_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
        }
      );
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
  }, [plan_phase_id]);

  return (
    <div className="max-w-[800px]  w-full md:p-4 p-2 mx-auto">
      <NewPlanPhase data={planData} isEdit={true} isView={false} id={id} />
    </div>
  );
};

export default EditPlanPhase;
