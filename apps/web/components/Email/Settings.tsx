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
  EyeIcon,
  File,
  Loader,
  Plus,
  Search,
} from "lucide-react";
import {
  CREATE_IMAP_DETAILS_URL,
  MY_DOC_LIST,
  PLAN_API,
  TASKS_API,
} from "@/constants/envConfig";
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
import axiosInstance from "@/utils/axiosInstance";

const Settings = () => {
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
    const fetchSettings = async () => {
      setIsLoading(true);
      const response = await axiosInstance.get(CREATE_IMAP_DETAILS_URL);

      const data = response.data;
      const filteredData = data.filter(
        (item: any) => item.business_number == session?.user?.business_number
      );

      setData(filteredData);

      if (response.status !== 200) {
        toast({
          description: "Error fetching contacts",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, [session]);

  return (
    <div>
      <h1 className="text-muted-foreground mb-2 flex items-center gap-2">
        <File className="h-5 w-5 text-muted-foreground" />
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
          <Link href="/Email/settings/new">
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
                return item?.data_response?.user
                  .toLowerCase()
                  .includes(searchTerm);
              })
              .map((item: any) => (
                <Card key={item.user_catalog_data_id} className="py-2 px-2">
                  <CardContent className="space-y-[10px] px-2 py-2">
                    <h2 className="font-semibold text-md">
                      {item.data_response.user}
                    </h2>
                    <p className="text-md text-muted-foreground">
                      {item.data_response.password}
                    </p>

                    <p className="flex items-center gap-2 text-md">
                      <span>Host: {item.data_response.host}</span>
                    </p>
                    <p className="flex items-center gap-2 text-md">
                      <span>Port: {item.data_response.port}</span>
                    </p>

                    <div className="flex justify-between items-center">
                      <p className="flex items-center gap-2 text-md">
                        <span>
                          TLS: {item.data_response.tls ? "True" : "False"}
                        </span>
                      </p>
                      {/* <p className="text-md flex items-center gap-2">
                        <LuChartPie className="h-5 w-5 text-muted-foreground stroke-[1.5]" />
                        <span>{item.plan_progress_track}</span>
                      </p> */}
                      <div className="flex gap-1.5 md:gap-2 space-x-2">
                        <File className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                        <ClipboardCheck className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                        <Link
                          href={`/Email/settings/edit/${item.user_catalog_data_id}`}
                        >
                          <Edit className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                        </Link>
                        <Link
                          href={`/Email/settings/view/${item.user_catalog_data_id}`}
                        >
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

export default Settings;
