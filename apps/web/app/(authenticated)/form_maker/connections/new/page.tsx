import NewConnections from "@/components/form-builder-2/connections/NewConnections";

const page = () => {
  return (
    <div className="max-w-[800px] mx-auto p-5">
      <NewConnections isEditing={false} />
    </div>
  );
};

export default page;
