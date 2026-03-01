import GanttChart from "@/components/Projects/Gantt/Gantt";
import Gantt from "@/components/Projects/planPhase/Gantt/Gantt";

const page = ({ params }: { params: { plan_phase_id: string } }) => {
  const { plan_phase_id } = params;
  return (
    <div className="max-w-[800px]  w-full p-4 mx-auto">
      <Gantt id={plan_phase_id} />
    </div>
  );
};

export default page;
