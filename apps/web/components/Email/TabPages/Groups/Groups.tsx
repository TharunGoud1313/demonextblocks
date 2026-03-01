"use client";
import { Session } from "@/components/doc-template/DocTemplate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CHAT_GROUP_API } from "@/constants/envConfig";
import axiosInstance from "@/utils/axiosInstance";
import {
  ClipboardCheck,
  Edit,
  Eye,
  Mail,
  MessageCircle,
  Plus,
  Search,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { LuCopyCheck } from "react-icons/lu";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axiosInstance.get(CHAT_GROUP_API);
        console.log("response----", response.data);
        const filteredData = response.data.filter(
          (group: any) =>
            group.created_user_id == session?.user?.id ||
            group.chat_group_users_json?.some(
              (user: any) => user.user_catalog_id == session?.user?.id
            )
        );
        setGroups(filteredData);
      } catch (error) {
        console.log("error----", error);
        toast.error("Error fetching groups");
      }
    };
    fetchGroups();
  }, [session]);

  console.log("groups-----", groups);
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
        <Link href={"/Email/groups/new"}>
          <Button size={"icon"}>
            <Plus />
          </Button>
        </Link>
      </div>
      <div className="mt-5 space-y-4">
        {groups
          .filter((item: any) =>
            item.chat_group_name.toLowerCase().includes(search.toLowerCase())
          )
          .map((group: any) => (
            <Card key={group.id}>
              <CardContent className="pt-2">
                <h1>{group.chat_group_name}</h1>
                <h1>Members: {group?.chat_group_users_json?.length}</h1>
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2">
                    <LuCopyCheck className="h-5 w-5 text-muted-foreground" />
                    {group.status}
                  </p>
                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/Email/groups/add-users/${group.chat_group_id}`}
                    >
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <Plus className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </Link>
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <Link href={`/Email/groups/edit/${group.chat_group_id}`}>
                      <Edit className="h-5 w-5 text-muted-foreground" />
                    </Link>
                    {/* <Link
                      href={`/Email/groups/messages/${group.chat_group_id}`}
                    >
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    </Link> */}
                    <Link href={`/Email/new/${group.chat_group_id}/group`}>
                      <Mail className="h-5 w-5 text-muted-foreground" />
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

export default Groups;
