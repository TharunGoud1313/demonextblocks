"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  ArrowRight,
  Calendar,
  CircleCheck,
  ClipboardCheck,
  Edit,
  Eye,
  EyeIcon,
  File,
  Loader,
  Plus,
  Search,
  User,
} from "lucide-react";
import {
  MESSAGES_API,
  MY_DOC_LIST,
  PLAN_API,
  TASKS_API,
} from "@/constants/envConfig";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { usePathname, useRouter } from "next/navigation";

import {
  LuCopyCheck,
  LuChartPie,
  LuChartNoAxesGantt,
  LuMessageCircleMore,
} from "react-icons/lu";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Session } from "@/components/doc-template/DocTemplate";
import FilePreview from "./FilePreview";

const ViewFile = ({
  id,
  mydoc_list_id,
}: {
  id: string;
  mydoc_list_id: string;
}) => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [docsData, setDocsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: sessionData } = useSession();
  const pathname = usePathname();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

  console.log("docsData-----", docsData);

  useEffect(() => {
    const fetchDocs = async () => {
      setIsLoading(true);
      const response = await fetch(
        `${MY_DOC_LIST}?mydoc_list_id=eq.${mydoc_list_id}`,
        {
          method: "GET",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
        }
      );
      const data = await response.json();
      const filteredData = data.filter(
        (item: any) => item.business_number === session?.user?.business_number
      );
      setDocsData(filteredData);

      if (!response.ok) {
        toast({
          description: "Error fetching contacts",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    };
    fetchDocs();
  }, [session, mydoc_list_id]);

  return (
    <div>
      <div className="flex items-center gap-2 justify-between">
        <h1 className="text-muted-foreground text-md flex items-center gap-2">
          <CircleCheck className="h-5 w-5 text-muted-foreground" />
          {pathname.split("/").at(1)}
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <File className="h-5 w-5 text-muted-foreground" />
          {pathname.split("/").at(2)}
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <EyeIcon className="h-5 w-5 text-muted-foreground" />
          {pathname.split("/").at(4)}
        </h1>
        <Link href={`/Projects/Docs/${id}`}>
          <Button className="border-0" variant={"outline"}>
            Back to Docs
          </Button>
        </Link>
      </div>
      <div className="flex flex-col gap-4 w-full items-center">
        {isLoading ? (
          <div>
            <Loader className="animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 w-full">
            {docsData
              .filter((item: any) =>
                item.doc_name.toLowerCase().includes(search.toLowerCase())
              )
              .map((item: any) => (
                <Card key={item.mydoc_list_id} className="py-2 px-2">
                  <CardContent className="space-y-[10px] px-2 py-2">
                    <h2 className="font-semibold">{item.doc_name}</h2>
                    <p className="text-md text-muted-foreground">
                      {item.doc_group}
                    </p>
                    <p className="flex items-center gap-2 text-md">
                      <span>Doc No: {item.doc_no}</span>
                    </p>
                    <p className="flex items-center gap-2 text-md">
                      <span>Version No: {item.version_no}</span>
                    </p>
                    <p className="flex items-center gap-2 text-md">
                      <span className="flex items-center gap-2">
                        File Name: {item?.doc_file_two}{" "}
                        {/* <Link href={`/Docs/ViewFile/${item.mydoc_list_id}`}>
                          <EyeIcon className="h-5 w-5 text-muted-foreground" />
                        </Link> */}
                      </span>
                    </p>
                    <p className="flex items-center gap-2 text-md">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span>
                        Date: {new Date(item.created_date).toLocaleDateString()}
                      </span>
                    </p>

                    <div className="flex justify-between items-center">
                      <p className="flex items-center gap-2 text-md">
                        <LuCopyCheck className="h-5 w-5 text-muted-foreground" />

                        <span>{item.status}</span>
                      </p>
                      {/* <p className="text-sm flex items-center gap-2">
                      <LuChartPie className="h-3.5 w-3.5 text-muted-foreground stroke-[1.5]" />
                      <span>{item.plan_progress_track}</span>
                    </p> */}
                      <div className="flex space-x-2 gap-1.5 md:gap-2">
                        <File className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                        <ClipboardCheck className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                        <Link
                          href={`/Projects/Docs/${id}/edit/${item.mydoc_list_id}`}
                        >
                          <Edit className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                        </Link>
                        <Link
                          href={`/Projects/Docs/${id}/view/${item.mydoc_list_id}`}
                        >
                          <Eye className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                        </Link>

                        <LuMessageCircleMore className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />

                        {/* <LuChartNoAxesGantt className="h-3.5 w-3.5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" /> */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
      {/* <div className="flex w-full mt-4 mb-4 gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="pl-10 text-md"
          />
        </div>
        <Link href={`/DoBox/Docs/${id}/new`}>
          <Button size={"icon"}>
            <Plus className="h-5 w-5" />
          </Button>
        </Link>
      </div> */}
      <div className="flex flex-col mt-4 gap-4 w-full items-center">
        <FilePreview data={docsData} />
      </div>
    </div>
  );
};

export default ViewFile;
