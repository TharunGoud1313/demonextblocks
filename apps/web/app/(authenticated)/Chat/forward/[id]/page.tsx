import ForwardMessagePage from "@/components/Chat/components/ForwardMessagePage";
import React from "react";

const page = ({ params }: { params: { id: string } }) => {
  return (
    <div className="max-w-[800px] w-full mx-auto p-4">
      <ForwardMessagePage id={params.id} />
    </div>
  );
};

export default page;
