"use client";
import { Session } from "@/components/doc-template/DocTemplate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SAVE_FORM_DATA } from "@/constants/envConfig";
import axiosInstance from "@/utils/axiosInstance";
import {
  Loader,
  LucideCopyCheck,
  MessageCircle,
  Plus,
  Search,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const AgentPage = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(SAVE_FORM_DATA);
        const filteredData = response.data.filter((item: any) =>
          item?.users_json?.includes(session?.user?.email)
        );
        setAgents(filteredData);
        setLoading(false);
      } catch (error) {
        console.log("error----", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, [session]);

  console.log("agents-----", agents);
  return (
    <div>
      <div className="flex items-center mt-5 gap-2 justify-between">
        <div className="flex items-center border rounded-md w-full pl-4 gap-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search Groups"
            className="border-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center justify-center flex-col h-full">
        {loading && <Loader className="animate-spin" />}
      </div>
      <div className="mt-5 space-y-4">
        {agents
          .filter((item: any) =>
            item.form_name.toLowerCase().includes(search.toLowerCase())
          )
          .map((group: any) => (
            <Card key={group.form_id}>
              <CardContent className="pt-2">
                <h1>{group.form_name}</h1>
                <h1>{group.form_description}</h1>
                <h1>Members: {group?.users_json?.length}</h1>
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2">
                    <LucideCopyCheck className="h-5 w-5 text-muted-foreground" />
                    {group.status}
                  </p>
                  <div className="flex items-center gap-2">
                    <Link href={`/Chat/agents/${group.form_id}`}>
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default AgentPage;
