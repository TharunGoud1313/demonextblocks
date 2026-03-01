"use client";
import NewEmail from "@/components/Email/NewEmail";

const Page = ({ params }: { params: { id: string } }) => {
  const { id } = params;

  return (
    <div className="max-w-[800px] mx-auto p-4 w-full">
      <NewEmail id={id} isView={true} />
    </div>
  );
};

export default Page;
