"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import Contacts from "./Contacts";
import GroupChat from "./GroupChat";
import Social from "./Social";
import { Button } from "@/components/ui/button";
import { useCustomSession } from "@/utils/session";
import axiosInstance from "@/utils/axiosInstance";
import { MY_DOC_LIST } from "@/constants/envConfig";
import { toast } from "@/components/ui/use-toast";

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
  share_on_channel: ContactMethod[];
  values: UserValues;
};

type GroupOption = {
  id: string;
  name: string;
  members: UserOption[];
  contactMethods: ContactMethod[];
  originalGroupId: string;
};

type OptionsProps = {
  selectedUsers: UserOption[];
  selectedGroups: GroupOption[];
  fromUser?: {
    user_id: string;
    user_name: string;
    first_name: string;
    last_name: string;
    business_number: string;
    business_name: string;
    email: string;
    profile_pic_url?: string;
  };
  toUsers?: UserOption[];
};

const ShareToUsers = ({ id }: { id: string }) => {
  const [optionsUsed, setOptionsUsed] = useState<OptionsProps>({
    selectedUsers: [],
    selectedGroups: [],
    fromUser: undefined,
    toUsers: [],
  });

  const session = useCustomSession();
  useEffect(() => {
    if (session?.user) {
      setOptionsUsed((prev: any) => ({
        ...prev,
        fromUser: {
          user_id: session.user.id,
          user_name: session.user.name || "",
          first_name: session.user.first_name || "",
          last_name: session.user.last_name || "",
          business_number: session.user.business_number || "",
          business_name: session.user.business_name || "",
          email: session.user.email || "",
        },
      }));
    }
  }, [session]);

  // Update toUsers whenever selectedUsers changes
  useEffect(() => {
    setOptionsUsed((prev) => ({
      ...prev,
      toUsers: prev.selectedUsers,
    }));
  }, [optionsUsed.selectedUsers]);

  const handleShare = async () => {
    const shareData = {
      docId: id,
      fromUser: optionsUsed.fromUser,
      toUsers: optionsUsed.toUsers || optionsUsed.selectedUsers,
      toGroups: optionsUsed.selectedGroups.map((group) => ({
        id: group.originalGroupId || group.id,
        name: group.name,
        members: group.members,
        contactMethods: group.contactMethods,
      })),
    };

    console.log("Share data:", shareData);

    const response = await axiosInstance.patch(MY_DOC_LIST, {
      share_to_user_json: shareData,
    });
    if (response.status === 204) {
      setOptionsUsed({
        ...optionsUsed,
        selectedUsers: [],
        selectedGroups: [],
      });
      toast({
        description: "Document shared successfully",
        variant: "default",
      });
    } else {
      toast({
        description: "Failed to share document",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="w-full pb-16">
      <Tabs defaultValue="direct-chat" className="mt-5 w-full">
        <TabsList
          defaultValue="direct-chat"
          className="inline-flex h-10 items-center justify-center rounded-full bg-muted p-1 text-muted-foreground"
        >
          <TabsTrigger
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            value="direct-chat"
          >
            Contacts
          </TabsTrigger>
          <TabsTrigger
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            value="group-chat"
          >
            Group Chat
          </TabsTrigger>
          <TabsTrigger
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            value="social"
          >
            Social
          </TabsTrigger>
        </TabsList>
        <TabsContent value="direct-chat">
          <Contacts optionsUsed={optionsUsed} setOptionsUsed={setOptionsUsed} />
        </TabsContent>
        <TabsContent value="group-chat">
          <GroupChat
            optionsUsed={optionsUsed}
            setOptionsUsed={setOptionsUsed}
          />
        </TabsContent>
        <TabsContent value="social">
          <Social />
        </TabsContent>
      </Tabs>
      <div className="w-full fixed bottom-0 left-0 right-0 mt-4 flex py-4 justify-center items-center bg-background">
        <Button
          className="w-full max-w-[800px]"
          disabled={
            optionsUsed.selectedUsers.length === 0 &&
            optionsUsed.selectedGroups.length === 0
          }
          onClick={handleShare}
        >
          Share
        </Button>
      </div>
    </div>
  );
};

export default ShareToUsers;
