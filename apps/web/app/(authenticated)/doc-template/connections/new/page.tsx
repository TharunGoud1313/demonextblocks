import NewConnections from "@/components/doc-template/connections/NewConnection";

const page = () => {
  return (
    <div className="max-w-[800px] mx-auto p-5">
      <NewConnections isEditing={false} />
    </div>
  );
};

export default page;
