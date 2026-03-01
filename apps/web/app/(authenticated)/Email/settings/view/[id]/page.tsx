import NewSettings from "@/components/Email/NewSettings";

const Page = ({ params }: { params: { id: string } }) => {
  return (
    <div className="max-w-[800px] mx-auto w-full p-4">
      <NewSettings id={params.id} isView={true} />
    </div>
  );
};

export default Page;
