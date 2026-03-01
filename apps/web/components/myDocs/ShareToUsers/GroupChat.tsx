"use client";
import { Session } from "@/components/doc-template/DocTemplate";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CHAT_GROUP_API,
  CHAT_MESSAGE_API,
  LATEST_MESSAGE_API,
} from "@/constants/envConfig";
import axiosInstance from "@/utils/axiosInstance";
import {
  Loader,
  Mail,
  MessageCircle,
  MessageSquare,
  Search,
} from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

type ContactMethod = "email" | "mobile" | "chat";

type UserValues = {
  email?: string;
  mobile?: string;
  chat?: string;
};

type UserOption = {
  id: string;
  user_id: string;
  user_name: string;
  first_name: string;
  last_name: string;
  business_number: string;
  business_name: string;
  email: string;
  profile_pic_url?: string;
  contactMethods: ContactMethod[];
  values: UserValues;
};

type GroupOption = {
  id: string;
  originalGroupId: string;
  name: string;
  members: UserOption[];
  share_on_channel: ContactMethod[];
};

const GroupChat = ({
  optionsUsed,
  setOptionsUsed,
}: {
  optionsUsed: any;
  setOptionsUsed: any;
}) => {
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [uniqueGroups, setUniqueGroups] = useState<any[]>([]);
  const [latestMessages, setLatestMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

  // Fetch all group messages
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(CHAT_MESSAGE_API);
        setMessages(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, []);

  // Fetch all groups
  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(CHAT_GROUP_API);
        setGroups(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroups();
  }, []);

  // Fetch latest messages
  useEffect(() => {
    const fetchLatestMessages = async () => {
      try {
        const response = await axiosInstance.get(LATEST_MESSAGE_API);
        setLatestMessages(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLatestMessages();
  }, []);

  // Identify groups the user is part of
  useEffect(() => {
    if (!session?.user?.id || !groups.length) return;

    const groupsSet = new Set();

    // Add groups where the user is the creator
    groups.forEach((group: any) => {
      if (group.created_user_id == session?.user?.id) {
        groupsSet.add(group.chat_group_id);
      }
    });

    // Add groups where the user is a member
    groups.forEach((group: any) => {
      if (
        group.chat_group_users_json?.some(
          (user: any) =>
            user.user_id == session?.user?.id ||
            user.user_catalog_id == session?.user?.id
        )
      ) {
        groupsSet.add(group.chat_group_id);
      }
    });

    // Also add groups from messages
    messages.forEach((msg: any) => {
      if (msg?.receiver_group_name) {
        groupsSet.add(msg?.receiver_group_name);
      }
    });

    setUniqueGroups(Array.from(groupsSet));
  }, [groups, messages, session]);

  // Function to get the latest message for a group
  const getLatestGroupMessage = (groupId: string) => {
    if (!latestMessages.length) return undefined;

    // Find all messages for this group
    const groupMessages = latestMessages.filter(
      (msg: any) => msg.receiver_group_id === groupId
    );

    // If no messages, return undefined
    if (groupMessages.length === 0) return undefined;

    // Sort by created_datetime (newest first)
    groupMessages.sort(
      (a, b) =>
        new Date(b.created_datetime).getTime() -
        new Date(a.created_datetime).getTime()
    );

    // Return the newest message
    return groupMessages[0];
  };

  // Function to format date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString();
  };

  // Filter groups based on search
  const filteredGroups = groups.filter((group: any) => {
    if (!search) return true;
    return group.chat_group_name?.toLowerCase().includes(search.toLowerCase());
  });

  const handleGroupMethodClick = (group: any, method: ContactMethod) => {
    console.log("groip0-----", group);
    // Extract all members from the group
    const groupMembers =
      group.chat_group_users_json?.map((user: any) => ({
        id: user.user_catalog_id || user.user_id,
        user_id: user.user_catalog_id || user.user_id,
        user_name: `${user.first_name || ""} ${user.last_name || ""}`,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        business_number: user.business_number || "",
        business_name: user.business_name || "",
        email: user.user_email || user.email || "",
        profile_pic_url: user.profile_pic_url || "",
        values: {
          [method]:
            method === "email"
              ? user.user_email || user.email || ""
              : method === "mobile"
              ? user.user_mobile || user.mobile || ""
              : user.user_catalog_id || user.user_id || "",
        },
      })) || [];

    // Create a unique ID for this group+method combination
    const uniqueGroupMethodId = `${group.chat_group_id}_${method}`;

    // Find if this specific group+method combination already exists
    const existingGroupIndex = optionsUsed.selectedGroups.findIndex(
      (g: any) => g.id === uniqueGroupMethodId
    );

    if (existingGroupIndex >= 0) {
      // This group+method combination exists, remove it
      const updatedGroups = [...optionsUsed.selectedGroups];
      updatedGroups.splice(existingGroupIndex, 1);

      setOptionsUsed({
        ...optionsUsed,
        selectedGroups: updatedGroups,
      });
    } else {
      // Add new group with this specific method
      const newGroup: any = {
        id: uniqueGroupMethodId,
        originalGroupId: group.chat_group_id,
        name: group.chat_group_name,
        members: groupMembers.map((member: any) => ({
          ...member,
          values: {
            [method]:
              method === "email"
                ? member.email || ""
                : method === "mobile"
                ? member.mobile || ""
                : member.user_id || "",
          },
          share_on_channel: [method],
        })),
      };

      // Add the new group to selected groups
      const updatedGroups = [...optionsUsed.selectedGroups, newGroup];

      setOptionsUsed({
        ...optionsUsed,
        selectedGroups: updatedGroups,
      });
    }
  };

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

      {isLoading && (
        <div className="flex justify-center mt-5 items-center h-full">
          <Loader className="h-5 w-5 animate-spin" />
        </div>
      )}

      <div className="mt-5 space-y-5">
        {filteredGroups.map((group: any) => {
          const latestMsg = getLatestGroupMessage(group.chat_group_id);
          const memberCount = group.chat_group_users_json?.length || 0;

          return (
            <Card key={group.chat_group_id}>
              <CardContent className="flex flex-col gap-2">
                <div className="flex pt-2.5 items-center gap-2">
                  <Avatar>
                    <AvatarFallback>
                      {group.chat_group_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {group.chat_group_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {memberCount} members
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  {latestMsg
                    ? formatDate(latestMsg.created_datetime)
                    : "No messages yet"}
                </p>

                <div className="flex items-center gap-2 justify-between">
                  <p className="text-sm text-gray-600 truncate w-[80%]">
                    {latestMsg ? latestMsg.chat_message : "No messages yet"}
                  </p>
                  <div className="flex items-center gap-2">
                    <MessageCircle
                      className={`h-5 w-5 cursor-pointer transition-all ${
                        optionsUsed.selectedGroups.some(
                          (g: any) => g.id === `${group.chat_group_id}_chat`
                        )
                          ? "text-primary fill-secondary h-6 w-6"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => handleGroupMethodClick(group, "chat")}
                    />
                    <Mail
                      className={`h-5 w-5 cursor-pointer transition-all ${
                        optionsUsed.selectedGroups.some(
                          (g: any) => g.id === `${group.chat_group_id}_email`
                        )
                          ? "text-primary fill-secondary h-6 w-6"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => handleGroupMethodClick(group, "email")}
                    />
                    <MessageSquare
                      className={`h-5 w-5 cursor-pointer transition-all ${
                        optionsUsed.selectedGroups.some(
                          (g: any) => g.id === `${group.chat_group_id}_mobile`
                        )
                          ? "text-primary fill-secondary h-6 w-6"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => handleGroupMethodClick(group, "mobile")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!isLoading && filteredGroups.length === 0 && (
          <p className="text-center text-gray-500">No groups found</p>
        )}
      </div>
    </div>
  );
};

export default GroupChat;
