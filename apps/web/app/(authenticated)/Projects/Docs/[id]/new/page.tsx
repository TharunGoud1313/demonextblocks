import React from "react";
import dynamic from "next/dynamic";
import NewProjectDocs from "@/components/Projects/Docs/NewDocs";
// import NewDocs from "@/components/Docs/NewDocs";

const Page = ({ params }: { params: { id: string } }) => {
  return <NewProjectDocs isEdit={false} isView={false} id={params.id} />;
};

export default Page;
