import NewTask from "@/components/Tasks/NewTask";

const Page = () => {
  return (
    <div>
      <NewTask isEdit={false} isView={false} />
    </div>
  );
};

export default Page;
