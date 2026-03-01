"use client";
import { Session } from "@/components/doc-template/DocTemplate";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CHAT_GROUP_API,
  CHAT_MESSAGE_API,
  GET_CONTACTS_API,
  LATEST_MESSAGE_API,
} from "@/constants/envConfig";
import axiosInstance from "@/utils/axiosInstance";
import { Loader, Loader2, MessageCircle, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const Chats = () => {
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState([]);
  const [uniqueChats, setUniqueChats] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [uniqueGroups, setUniqueGroups] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [latestMessages, setLatestMessages] = useState<any[]>([]);
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

  // to get chat messages and to know who are the sender and receiver
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      const response = await axiosInstance.get(CHAT_MESSAGE_API);
      setMessages(response.data);
      setIsLoading(false);
    };
    fetchMessages();
  }, []);

  // display user name based on receiver id
  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      const response = await axiosInstance.get(GET_CONTACTS_API);
      setContacts(response.data);
      setIsLoading(false);
    };
    fetchContacts();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      const response = await axiosInstance.get(CHAT_GROUP_API);
      setGroups(response.data);
    };
    fetchGroups();
  }, []);

  // to get the latest message for a user
  useEffect(() => {
    const fetchLatestMessages = async () => {
      setIsLoading(true);
      const response = await axiosInstance.get(LATEST_MESSAGE_API);
      setLatestMessages(response.data);
      setIsLoading(false);
    };
    fetchLatestMessages();
  }, []);

  // Add a separate effect to refresh messages when user interacts with the page
  useEffect(() => {
    const refreshMessages = async () => {
      if (document.visibilityState === "visible") {
        const response = await axiosInstance.get(LATEST_MESSAGE_API);
        setLatestMessages(response.data);
      }
    };

    // Refresh when tab becomes visible
    document.addEventListener("visibilitychange", refreshMessages);
    // Refresh on user interaction
    window.addEventListener("focus", refreshMessages);

    return () => {
      document.removeEventListener("visibilitychange", refreshMessages);
      window.addEventListener("focus", refreshMessages);
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;

    const userSet = new Set();

    messages.forEach((msg: any) => {
      // Only add users that the current user has interacted with
      if (msg?.sender_id == session?.user?.id) {
        // If current user is sender, add the receiver
        userSet.add(msg?.receiver_user_id);
      } else if (msg?.receiver_user_id == session?.user?.id) {
        // If current user is receiver, add the sender
        userSet.add(msg?.sender_id);
      }
    });

    setUniqueChats(Array.from(userSet));
  }, [messages, session]);

  const usersChat = contacts.filter((contact: any) =>
    uniqueChats.includes(contact.user_catalog_id)
  );

  const groupsChat = groups.filter((group: any) =>
    uniqueGroups.includes(group.chat_group_id)
  );

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

    // Also add groups from messages (as before)
    messages.forEach((msg: any) => {
      if (msg?.receiver_group_name) {
        groupsSet.add(msg?.receiver_group_name);
      }
    });

    setUniqueGroups(Array.from(groupsSet));
  }, [messages, groups, session]);

  console.log("uniqueGroups-----", uniqueGroups);

  // Function to get the latest message for a user
  const getLatestMessage = (userId: string) => {
    return latestMessages.find(
      (msg: any) =>
        (msg.sender_id == session?.user?.id && msg.receiver_id == userId) ||
        (msg.receiver_id == session?.user?.id && msg.sender_id == userId)
    );
  };

  const getLatestGroupMessage = (groupId: string) => {
    // Find all messages for this group
    const groupMessages = latestMessages.filter(
      (msg: any) => msg.receiver_group_name == groupId
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

  // Sort chats by latest message timestamp (newest first)
  const sortedChats = [...usersChat].sort((a, b) => {
    const latestMsgA = getLatestMessage(a.user_catalog_id);
    const latestMsgB = getLatestMessage(b.user_catalog_id);

    const timeA = latestMsgA
      ? new Date(latestMsgA.created_datetime).getTime()
      : 0;
    const timeB = latestMsgB
      ? new Date(latestMsgB.created_datetime).getTime()
      : 0;

    return timeB - timeA; // Descending order (latest messages first)
  });

  const sortedGroupsChat = [...groupsChat].sort((a, b) => {
    const latestMsgA = getLatestGroupMessage(a.chat_group_id);
    const latestMsgB = getLatestGroupMessage(b.chat_group_id);

    const timeA = latestMsgA
      ? new Date(latestMsgA.created_datetime).getTime()
      : 0;
    const timeB = latestMsgB
      ? new Date(latestMsgB.created_datetime).getTime()
      : 0;

    return timeB - timeA; // Descending order (latest messages first)
  });

  return (
    <div>
      <div className="border flex items-center rounded-md pl-4 mt-5">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="border-0"
        />
      </div>
      {isLoading && (
        <div className="flex justify-center items-center h-full">
          <Loader className="h-5 w-5 animate-spin" />
        </div>
      )}
      <Tabs defaultValue="direct-chat" className="mt-5 w-full">
        <TabsList
          defaultValue="direct-chat"
          className="inline-flex h-10 items-center justify-center rounded-full bg-muted p-1 text-muted-foreground"
        >
          <TabsTrigger
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            value="direct-chat"
          >
            Direct Chat
          </TabsTrigger>
          <TabsTrigger
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            value="group-chat"
          >
            Group Chat
          </TabsTrigger>
        </TabsList>
        <TabsContent value="direct-chat">
          <div className="mt-5 space-y-5">
            {sortedChats.map((user: any) => {
              const latestMsg = getLatestMessage(user.user_catalog_id);

              return (
                <Card key={user.user_catalog_id}>
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex pt-2.5 items-center gap-2">
                      <Avatar>
                        <AvatarImage src={user.profile_pic_url} />
                        <AvatarFallback>
                          {user.first_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">
                        {user.first_name} {user.last_name}
                      </p>
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
                      <Link
                        href={`/Chat/contacts/messages/${user.user_catalog_id}`}
                      >
                        <MessageCircle className="h-5 w-5 text-muted-foreground" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="group-chat">
          <div className="mt-5 space-y-5">
            {sortedGroupsChat.map((group: any) => {
              const latestMsg = getLatestGroupMessage(group.chat_group_id);

              return (
                <Card key={group.chat_group_id}>
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex pt-2.5 items-center gap-2">
                      <Avatar>
                        {/* <AvatarImage src={group.chat_group_name} /> */}
                        <AvatarFallback>
                          {group.chat_group_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">
                        {group.chat_group_name}
                      </p>
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
                      <Link
                        href={`/Chat/groups/messages/${group.chat_group_id}`}
                      >
                        <MessageCircle className="h-5 w-5 text-muted-foreground" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Chats;
