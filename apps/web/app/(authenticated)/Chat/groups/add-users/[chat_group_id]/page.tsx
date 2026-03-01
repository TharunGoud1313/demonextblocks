"use client";

import AddUsers from "@/components/Chat/TabPages/Groups/AddUsers";
import React from "react";

const Page = ({ params }: { params: { chat_group_id: string } }) => {
  return (
    <div className="max-w-[800px] w-full mx-auto p-4">
      <AddUsers chat_group_id={params.chat_group_id} />
    </div>
  );
};

export default Page;
