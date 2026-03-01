"use client";

import React from "react";
import dynamic from "next/dynamic";

const Doc = dynamic(() => import("@/components/myDocs/Doc"), {
  ssr: false,
});

const Page = () => {
  return <Doc />;
};

export default Page;
