"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Calendar,
  CircleCheck,
  ClipboardCheck,
  Edit,
  Eye,
  File,
  Loader,
  Plus,
  Search,
  User,
} from "lucide-react";
import { MESSAGES_API, PLAN_API, TASKS_API } from "@/constants/envConfig";
import { toast } from "../ui/use-toast";
import { Card, CardContent } from "../ui/card";
import { usePathname, useRouter } from "next/navigation";
import {
  LuCopyCheck,
  LuChartPie,
  LuChartNoAxesGantt,
  LuMessageCircleMore,
} from "react-icons/lu";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Session } from "../doc-template/DocTemplate";

const Msg = () => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      const response = await fetch(MESSAGES_API, {
        method: "GET",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      });
      const data = await response.json();
      const filteredData = data.filter(
        (item: any) => item.business_number === session?.user?.business_number
      );

      setData(filteredData);

      if (!response.ok) {
        toast({
          description: "Error fetching contacts",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    };
    fetchMessages();
  }, [session]);

  return (
    <div>
      <h1 className="text-muted-foreground text-md  mb-2 flex items-center gap-2">
        <LuMessageCircleMore className="h-5 w-5 text-muted-foreground" />
        {pathname.split("/").at(1)}
      </h1>
      <div className="flex flex-col gap-4 w-full items-center">
        <div className="flex w-full  gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="pl-10 text-md"
            />
          </div>
          <Link href="/Msg/new">
            <Button size={"icon"}>
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div>
            <Loader className="animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 w-full">
            {data
              .filter((item: any) => {
                const searchTerm = search.toLowerCase();
                return item.msg_subject?.toLowerCase().includes(searchTerm);
              })
              .map((item: any) => (
                <Card key={item.msg_id} className="py-2 px-2">
                  <CardContent className="space-y-[10px] px-2 py-2">
                    <p className="flex items-center gap-2 text-md">
                      <LuChartNoAxesGantt className="h-5 w-5 text-muted-foreground" />
                      {item.plan_name}
                    </p>
                    <p className="flex items-center gap-2 text-md">
                      <LuChartNoAxesGantt className="h-5 w-5 text-muted-foreground" />
                      <span>{item.plan_phase_name}</span>
                    </p>
                    <p className="flex items-center gap-2 text-md">
                      <CircleCheck className="h-5 w-5 text-muted-foreground" />
                      <span>{item.task_title}</span>
                    </p>
                    <p className="flex items-center gap-2 text-md">
                      <File className="h-5 w-5 text-muted-foreground" />
                      <span>{item.mydoc_name}</span>
                    </p>

                    <p className="flex items-center gap-2 text-md">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span>
                        Date: {new Date(item.created_date).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="flex items-center gap-2 text-md">
                      <User className="h-5 w-5 text-muted-foreground" />

                      <span>From: {item.created_user_name}</span>
                    </p>
                    <p className="flex font-semibold items-center gap-2 text-md">
                      <span>Subject: {item.msg_subject}</span>
                    </p>
                    <p className="flex items-center text-muted-foreground gap-2 text-md">
                      <span>Msg Group: {item.msg_group}</span>
                    </p>
                    <p className="flex items-center text-muted-foreground gap-2 text-md">
                      <span>Desc: {item.msg_description}</span>
                    </p>

                    <div className="flex justify-between items-center">
                      <p className="flex items-center gap-2 text-md">
                        <LuCopyCheck className="h-5 w-5 text-muted-foreground" />

                        <span>{item.status}</span>
                      </p>
                      <div className="flex  gap-1.5 md:gap-2 space-x-2">
                        <File className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                        <ClipboardCheck className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                        <Link href={`/Msg/edit/${item.msg_id}`}>
                          <Edit className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                        </Link>
                        <Link href={`/Msg/view/${item.msg_id}`}>
                          <Eye className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                        </Link>
                        <LuMessageCircleMore className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Msg;
