import React from "react";
import dynamic from "next/dynamic";
import ViewFile from "@/components/Projects/Docs/ViewFile/ViewFile";

const page = ({
  params,
}: {
  params: { id: string; mydoc_list_id: string };
}) => {
  return (
    <div className="max-w-[800px]  w-full p-4 mx-auto">
      <ViewFile id={params.id} mydoc_list_id={params.mydoc_list_id} />
    </div>
  );
};

export default page;
