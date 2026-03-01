import PlanPhase from "@/components/Projects/planPhase/PlanPhase";
import React from "react";

const page = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  return (
    <div className="max-w-[800px]  w-full p-4 mx-auto">
      <PlanPhase id={params.id} />
    </div>
  );
};

export default page;
