"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Bot,
  Calendar,
  ClipboardCheck,
  Edit,
  Eye,
  File,
  Loader,
  Plus,
  Search,
} from "lucide-react";
import { PLAN_API, TASKS_API } from "@/constants/envConfig";
import { toast } from "../ui/use-toast";
import { Card, CardContent } from "../ui/card";
import { usePathname, useRouter } from "next/navigation";
import {
  LuCopyCheck,
  LuChartPie,
  LuChartNoAxesGantt,
  LuMessageCircleMore,
  LuChartGantt,
} from "react-icons/lu";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Session } from "../doc-template/DocTemplate";
import { Progress } from "../ui/progress";

const Projects = () => {
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
    const fetchPlan = async () => {
      setIsLoading(true);
      const response = await fetch(PLAN_API, {
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
    fetchPlan();
  }, [session]);

  return (
    <div>
      <h1 className="text-muted-foreground text-md flex mb-2 items-center gap-2">
        <LuChartNoAxesGantt className="h-5 w-5 text-muted-foreground" />
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
          <Link href="/Projects/new">
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
                return item.plan_name.toLowerCase().includes(searchTerm);
              })
              .map((item: any) => (
                <Card key={item.plan_id} className="py-2 px-2">
                  <CardContent className="space-y-[10px] px-2 py-2">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-md">
                        {item.plan_name}
                      </h2>
                      <div className="flex items-center gap-5">
                        <Link href={`/Projects/Assistant/${item.plan_id}`}>
                          <Bot className="h-5 w-5 text-muted-foreground" />
                        </Link>
                        <Link href={`/Projects/Gantt/${item.plan_id}`}>
                          <LuChartGantt className="h-5 w-5 text-muted-foreground" />
                        </Link>
                      </div>
                    </div>
                    <p className="text-md text-muted-foreground">
                      {item.plan_group}
                    </p>
                    <p className="text-md text-muted-foreground">
                      {item.plan_description}
                    </p>

                    <p className="flex items-center gap-2 text-md">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span>Start Date: {item.plan_start_date}</span>
                    </p>
                    <p className="flex items-center gap-2 text-md">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span>End Date: {item.plan_end_date}</span>
                    </p>
                    <p className="flex items-center gap-2 text-md">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span>Actual Start Date: {item.actual_start_date}</span>
                    </p>
                    <p className="flex items-center gap-2 text-md">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span>Actual End Date: {item.actual_end_date}</span>
                    </p>
                    <p className="flex items-center gap-2 text-md">
                      <LuCopyCheck className="h-5 w-5 text-muted-foreground" />

                      <span>{item.status}</span>
                    </p>

                    <div className="flex justify-between items-center">
                      <p className="text-md flex w-full items-center gap-2">
                        <LuChartPie className="h-5 w-5 text-muted-foreground stroke-[1.5]" />
                        {/* <span>{item.progress_percentage}</span> */}
                        <Progress
                          className="w-1/2 h-2.5"
                          value={item.progress_percent}
                        />
                      </p>
                      <div className="flex gap-1.5 md:gap-2 space-x-2">
                        <Link href={`/Projects/Docs/${item.plan_id}`}>
                          <File className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                        </Link>
                        <ClipboardCheck className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                        <Link href={`/Projects/edit/${item.plan_id}`}>
                          <Edit className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                        </Link>
                        <Link href={`/Projects/view/${item.plan_id}`}>
                          <Eye className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                        </Link>
                        <Link href={`/Projects/planPhase/${item.plan_id}`}>
                          <LuChartNoAxesGantt className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                        </Link>
                        <Link href={`/Projects/Chat/${item.plan_id}`}>
                          <LuMessageCircleMore className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                        </Link>
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

export default Projects;
