import NewPlanPhase from "@/components/Projects/planPhase/NewPlanPhase";

const Page = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  return (
    <div>
      <NewPlanPhase isEdit={false} isView={false} id={id} />
    </div>
  );
};

export default Page;
