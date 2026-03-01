import NewConnections from "@/components/doc-template/connections/NewConnection";

const EditConnectionPage = ({ params }: { params: { id: string } }) => {
  return (
    <div className="max-w-[800px] mx-auto p-5">
      <NewConnections isEditing={true} connectionId={params.id} />
    </div>
  );
};

export default EditConnectionPage;
