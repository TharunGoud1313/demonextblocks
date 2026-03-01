import GanttChart from "@/components/Projects/Gantt/Gantt";

const page = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  return (
    <div className="max-w-[800px]  w-full p-4 mx-auto">
      <GanttChart id={id} />
    </div>
  );
};

export default page;
