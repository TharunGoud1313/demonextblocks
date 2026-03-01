"use client";
import { Session } from "@/components/doc-template/DocTemplate";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CHAT_MESSAGE_API,
  GET_CONTACTS_API,
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
import Link from "next/link";
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
  share_on_channel: ContactMethod[];
  values: UserValues;
};

type OptionsProps = {
  selectedUsers: UserOption[];
  selectedGroups: any[];
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

const Contacts = ({
  setOptionsUsed,
  optionsUsed,
}: {
  setOptionsUsed: (options: any) => void;
  optionsUsed: any;
}) => {
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [latestMessages, setLatestMessages] = useState<any[]>([]);
  const [uniqueChats, setUniqueChats] = useState<any[]>([]);
  const [userContacts, setUserContacts] = useState<any[]>([]);
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

  // Fetch all chat messages
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

  // Fetch all contacts
  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(GET_CONTACTS_API);
        setContacts(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContacts();
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

  // Extract unique users that the current user has chatted with
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

  // Filter contacts to only show users the current user has chatted with
  useEffect(() => {
    const filteredContacts = contacts.filter((contact: any) =>
      uniqueChats.includes(contact.user_catalog_id)
    );
    setUserContacts(filteredContacts);
  }, [contacts, uniqueChats]);

  // Function to get the latest message for a contact
  const getLatestContactMessage = (contactId: string) => {
    if (!session?.user?.id) return undefined;

    // Find all messages between current user and this contact
    const contactMessages = latestMessages.filter(
      (msg: any) =>
        // Direct messages between current user and contact
        (msg.sender_id == session?.user?.id && msg.receiver_id == contactId) ||
        (msg.sender_id == contactId && msg.receiver_id == session?.user?.id)
    );

    // If no messages, return undefined
    if (contactMessages.length === 0) return undefined;

    // Sort by created_datetime (newest first)
    contactMessages.sort(
      (a, b) =>
        new Date(b.created_datetime).getTime() -
        new Date(a.created_datetime).getTime()
    );

    // Return the newest message
    return contactMessages[0];
  };

  // Function to format date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString();
  };

  // Sort contacts by latest message timestamp (newest first)
  const sortedContacts = [...userContacts].sort((a, b) => {
    const latestMsgA = getLatestContactMessage(a.user_catalog_id);
    const latestMsgB = getLatestContactMessage(b.user_catalog_id);

    const timeA = latestMsgA
      ? new Date(latestMsgA.created_datetime).getTime()
      : 0;
    const timeB = latestMsgB
      ? new Date(latestMsgB.created_datetime).getTime()
      : 0;

    return timeB - timeA; // Descending order (latest messages first)
  });

  // Filter contacts based on search
  const filteredContacts = sortedContacts.filter((contact: any) => {
    if (!search) return true;
    return (
      contact.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      contact.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      contact.email?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleContactMethodClick = (
    contact: any,
    method: ContactMethod,
    methodValue: string
  ) => {
    // Find if user already exists in the selected users
    const existingUserIndex = optionsUsed.selectedUsers.findIndex(
      (user: any) => user.user_catalog_id === contact.user_catalog_id
    );

    if (existingUserIndex >= 0) {
      // User exists, update their contact methods
      const updatedUsers = [...optionsUsed.selectedUsers];
      const user = updatedUsers[existingUserIndex];

      if (user.share_on_channel.includes(method)) {
        // Remove method if already selected
        user.share_on_channel = user.share_on_channel.filter(
          (m: any) => m !== method
        );

        // If no contact methods left, remove the user entirely
        if (user.share_on_channel.length === 0) {
          updatedUsers.splice(existingUserIndex, 1);
        }
      } else {
        // Add method if not already selected
        user.share_on_channel.push(method);
        user.values[method] = methodValue;
      }

      setOptionsUsed({
        ...optionsUsed,
        selectedUsers: updatedUsers,
        // Add selected users to toUsers as well
        toUsers: updatedUsers,
      });
    } else {
      // Add new user with the selected method
      // Check if this method is already selected for this user to prevent duplicates
      const newUser: UserOption = {
        id: contact.user_catalog_id,
        user_id: contact.user_catalog_id,
        user_name: `${contact.first_name} ${contact.last_name}`,
        first_name: contact.first_name || "",
        last_name: contact.last_name || "",
        business_number: contact.business_number || "",
        business_name: contact.business_name || "",
        email: contact.user_email || "",
        profile_pic_url: contact.profile_pic_url || "",
        share_on_channel: [method], // Only add the method once
        values: {
          [method]: methodValue,
        },
      };

      // Ensure we're not adding a duplicate user
      const updatedUsers = [...optionsUsed.selectedUsers, newUser];

      // Add from user details if not already present
      const updatedOptions = {
        ...optionsUsed,
        selectedUsers: updatedUsers,
        toUsers: updatedUsers,
      };

      // Add logged-in user details if not already present
      if (!updatedOptions.fromUser && session?.user) {
        updatedOptions.fromUser = {
          user_id: session.user.id,
          user_name: session.user.name || "",
          first_name: session.user.first_name || "",
          last_name: session.user.last_name || "",
          business_number: session.user.business_number || "",
          business_name: session.user.business_name || "",
          email: session.user.email || "",
        };
      }

      setOptionsUsed(updatedOptions);
    }
  };
  return (
    <div>
      <div className="border mb-5 flex items-center rounded-md pl-4 mt-5">
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

      <div className="mt-5 space-y-5">
        {filteredContacts.map((contact: any) => {
          const latestMsg = getLatestContactMessage(contact.user_catalog_id);

          return (
            <Card key={contact.user_catalog_id}>
              <CardContent className="flex flex-col gap-2">
                <div className="flex pt-2.5 items-center gap-2">
                  <Avatar>
                    <AvatarImage src={contact?.profile_pic_url} />
                    <AvatarFallback>
                      {contact?.first_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium">
                    {contact.first_name} {contact.last_name}
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
                  <div className="flex items-center gap-2">
                    <MessageCircle
                      className={`h-5 w-5 cursor-pointer ${
                        optionsUsed.selectedUsers.some(
                          (user: any) =>
                            user.user_id == contact.user_catalog_id &&
                            user.share_on_channel.includes("chat")
                        )
                          ? "text-primary h-6 w-6"
                          : "text-muted-foreground"
                      }`}
                      onClick={() =>
                        handleContactMethodClick(
                          contact,
                          "chat",
                          contact.user_catalog_id
                        )
                      }
                    />
                    <Mail
                      className={`h-5 w-5 cursor-pointer ${
                        optionsUsed.selectedUsers.some(
                          (user: any) =>
                            user.user_id == contact.user_catalog_id &&
                            user.share_on_channel.includes("email")
                        )
                          ? "text-primary h-6 w-6"
                          : "text-muted-foreground"
                      }`}
                      onClick={() =>
                        handleContactMethodClick(
                          contact,
                          "email",
                          contact.user_email
                        )
                      }
                    />
                    <MessageSquare
                      className={`h-5 w-5 cursor-pointer ${
                        optionsUsed.selectedUsers.some(
                          (user: any) =>
                            user.user_id == contact.user_catalog_id &&
                            user.share_on_channel.includes("mobile")
                        )
                          ? "text-primary h-6 w-6"
                          : "text-muted-foreground"
                      }`}
                      onClick={() =>
                        handleContactMethodClick(
                          contact,
                          "mobile",
                          contact.user_mobile
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!isLoading && filteredContacts.length === 0 && (
          <p className="text-center text-gray-500">No contacts found</p>
        )}
      </div>
    </div>
  );
};

export default Contacts;
