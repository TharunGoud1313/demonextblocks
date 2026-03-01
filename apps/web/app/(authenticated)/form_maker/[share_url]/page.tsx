"use client";
import { Session } from "@/components/form-builder-2/FormBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import React from "react";

const Page = (props: any) => {
  const pathName = props.params.share_url;
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

  const handleClick = () => {
    navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_API_URL}/submit/${pathName}/business_number=${session?.user?.business_number}/user_name=${session?.user?.name}`
    );
    toast({ description: "URL copied Successfully", variant: "default" });
  };
  return (
    <div className="flex flex-col shadow-lg border border-secondary items-center justify-center h-screen">
      <h1 className="md:text-3xl text-xl border-b-2 border-gray-300 font-bold">
        🎊🎊 Form Published
      </h1>

      <div className="pt-4 pb-4 mb-4 flex flex-col justify-center items-center md:justify-start ">
        <h1 className="md:text-xl">Share this form</h1>
        <span className="md:text-lg text-center text-gray-400">
          Anyone with the link can view and submit the form
        </span>
        <hr />
      </div>
      <div className="md:w-[500px] space-y-3">
        <Input
          readOnly
          value={`${process.env.NEXT_PUBLIC_API_URL}/submit/${pathName}/business_number=${session?.user?.business_number}/user_name=${session?.user?.name}`}
        />
        <div className="flex gap-3">
          <Button className=" w-full" onClick={handleClick}>
            Copy Link
          </Button>
          <a
            className="w-full"
            href={`${process.env.NEXT_PUBLIC_API_URL}/submit/${pathName}/business_number=${session?.user?.business_number}/user_name=${session?.user?.name}`}
            target="_blank"
          >
            <Button className=" w-full">View Form</Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Page;
