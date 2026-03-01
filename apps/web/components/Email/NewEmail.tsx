"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  CHAT_GROUP_API,
  CREATE_IMAP_DETAILS_URL,
  EMAIL_LIST_API,
  GET_CONTACTS_API,
} from "@/constants/envConfig";
import { toast } from "sonner";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "../ui/multi-select";
import { Textarea } from "../ui/textarea";
import {
  AlertTriangle,
  Archive,
  Bell,
  Bold,
  Bookmark,
  Bot,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Flag,
  Forward,
  Image,
  Italic,
  List,
  ListOrdered,
  Loader2,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Printer,
  Reply,
  ReplyAll,
  Save,
  Send,
  Share2,
  Star,
  Trash,
  Trash2,
  Underline,
  Workflow,
  X,
} from "lucide-react";
import { LuImage, LuLink, LuPaperclip } from "react-icons/lu";
import axiosInstance from "@/utils/axiosInstance";
import { useCustomSession } from "@/utils/session";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { renderSafeHtml } from "@/utils/renderSafeHtml";
import { FaReadme } from "react-icons/fa6";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useEmailAgentContext } from "@/context/EmailAgentContext";
import { v4 as uuidv4 } from "uuid";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Checkbox } from "../ui/checkbox";

interface NewEmailProps {
  id?: string;
  isView?: boolean;
  isReply?: boolean;
  replyId?: string;
  isReplyAll?: boolean;
  replyAllId?: string;
  isForward?: boolean;
  forwardId?: string;
  selectedContactId?: string;
  selectedGroupId?: string;
}

const NewEmail = ({
  id,
  isView,
  isReply,
  replyId,
  isReplyAll,
  replyAllId,
  isForward,
  forwardId,
  selectedContactId,
  selectedGroupId,
}: NewEmailProps) => {
  const [users, setUsers] = useState([]);
  const [settingsData, setSettingsData] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [templateList, setTemplateList] = useState([]);
  const [subject, setSubject] = useState("");
  const [from, setFrom] = useState<string[]>([]);
  const [to, setTo] = useState<string[]>([]);
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const session = useCustomSession();
  const [repliedEmails, setRepliedEmails] = useState<any[]>([]);
  const [currentReplyIndex, setCurrentReplyIndex] = useState(-1);
  const [fileData, setFileData] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [fileUrl, setFileUrl] = useState("");
  const [viewingReply, setViewingReply] = useState(false);
  const router = useRouter();
  const randomId = Math.random().toString().slice(-4);
  const [fileUpload, setFileUpload] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { emailContent, setEmailContent } = useEmailAgentContext();

  useEffect(() => {
    if (emailContent) {
      setMessage(emailContent);
    }
  }, [emailContent]);

  useEffect(() => {
    if (selectedGroupId) {
      const fetchGroupData = async () => {
        try {
          const response = await axiosInstance.get(
            `${CHAT_GROUP_API}?chat_group_id=eq.${selectedGroupId}`
          );
          const fetchUsers = response.data[0]?.chat_group_users_json;

          const userData = fetchUsers.map((item: any) => item.user_email);
          setTo(userData);
        } catch (error) {
          console.log("error------", error);
          toast.error("Failed to fetch group data");
        }
      };
      fetchGroupData();
    }
  }, [selectedGroupId]);

  useEffect(() => {
    if (selectedContactId) {
      const fetchContactData = async () => {
        try {
          const response = await axiosInstance.get(
            `${GET_CONTACTS_API}?user_catalog_id=eq.${selectedContactId}`
          );
          if (response.data) {
            setTo([response.data[0]?.user_email]);
          }
        } catch (error) {
          console.log("error------", error);
          toast.error("Failed to fetch contact data");
        }
      };
      fetchContactData();
    }
  }, [selectedContactId]);

  useEffect(() => {
    const fetchRepliedData = async () => {
      try {
        if (isReply || isReplyAll || isForward) {
          const response = await axiosInstance.get(
            `${EMAIL_LIST_API}?email_list_id=eq.${
              isReplyAll ? replyAllId : isForward ? forwardId : replyId
            }`
          );
          setTo([response.data[0]?.sender_email]);
          if (replyAllId) {
            if (response.data[0]?.cc_emails?.length > 0) {
              setShowCc(true);
            }
            if (response.data[0]?.bcc_emails?.length > 0) {
              setShowBcc(true);
            }
            setCc(response.data[0]?.cc_emails);
            setBcc(response.data[0]?.bcc_emails);
          }
          if (forwardId) {
            setSubject(response.data[0]?.subject);
            setMessage(response.data[0]?.body);
            setFileData(response.data[0]?.email_file_json);
          }
        }
      } catch (error) {
        console.log("error------", error);
      }
    };
    fetchRepliedData();
  }, [replyId, replyAllId, forwardId, isReply, isReplyAll, isForward]);

  useEffect(() => {
    if (id) {
      fetchEmailData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const response = await axiosInstance.get(CREATE_IMAP_DETAILS_URL);

        const filteredData = response.data.filter(
          (item: any) => item.user_email === session?.user?.email
        );
        setSettingsData(filteredData);
      } catch (error) {
        console.log("error------", error);
        toast.error("Failed to fetch settings data");
      }
    };
    fetchSettingsData();
  }, [session]);

  const fetchEmailData = async () => {
    try {
      const response = await axiosInstance.get(
        `${EMAIL_LIST_API}?email_list_id=eq.${id}`
      );
      setData(response.data[0]);

      // Check if this is a reply or has replies
      if (response.data[0]?.replied_to_email_id) {
        // This is a reply, fetch the original email
        const originalResponse = await axiosInstance.get(
          `${EMAIL_LIST_API}?email_list_id=eq.${response.data[0].replied_to_email_id}`
        );
        if (originalResponse.data && originalResponse.data.length > 0) {
          // Set the original email as the first in the thread
          setRepliedEmails([originalResponse.data[0]]);
          setCurrentReplyIndex(0);
        }
      } else {
        // This is an original email, fetch all replies to it
        const repliesResponse = await axiosInstance.get(
          `${EMAIL_LIST_API}?replied_to_email_id=eq.${id}`
        );
        if (repliesResponse.data && repliesResponse.data.length > 0) {
          setRepliedEmails(repliesResponse.data);
        }
      }
    } catch (error) {
      console.log("error------", error);
    }
  };

  useEffect(() => {
    const fetchTemplateList = async () => {
      const response = await axiosInstance.get(EMAIL_LIST_API);
      const templateList = response.data?.filter((item: any) => item.template);

      const filteredTemplatesList = templateList.filter(
        (template: any) =>
          template?.to_user_email.includes(session?.user?.email) ||
          template?.cc_emails.includes(session?.user?.email) ||
          template?.bcc_emails.includes(session?.user?.email)
      );
      setTemplateList(filteredTemplatesList);
    };
    fetchTemplateList();
  }, [session]);

  useEffect(() => {
    if (selectedTemplate) {
      setSubject(selectedTemplate?.subject);
      setTo(selectedTemplate?.to_user_email);
      setCc(selectedTemplate?.cc_emails);
      setBcc(selectedTemplate?.bcc_emails);
      setMessage(selectedTemplate?.body);
      if (selectedTemplate?.cc_emails?.length > 0) {
        setShowCc(true);
      }
      if (selectedTemplate?.bcc_emails?.length > 0) {
        setShowBcc(true);
      }
      if (selectedTemplate?.email_file_json?.length > 0) {
        setFileData(selectedTemplate?.email_file_json);
      }
    }
  }, [selectedTemplate]);

  useEffect(() => {
    if (data) {
      setSubject(data?.subject);
      setTo(data?.to_user_email);
      setCc(data?.cc_emails);
      setBcc(data?.bcc_emails);
      setMessage(data?.body);
      if (data?.cc_emails?.length > 0) {
        setShowCc(true);
      }
      if (data?.bcc_emails?.length > 0) {
        setShowBcc(true);
      }
      if (data?.email_file_json?.length > 0) {
        setFileData(data?.email_file_json);
      }
    }
  }, [data, isView]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch(GET_CONTACTS_API, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      });
      if (!response.ok) {
        toast.error("Failed to fetch plan group");
        return;
      }
      const data = await response.json();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchRepliedEmails = async () => {
      if (!id || !isView) return;

      try {
        // First, check if this email is a reply to another email
        const currentEmailResponse = await axiosInstance.get(
          `${EMAIL_LIST_API}?email_list_id=eq.${id}`
        );

        if (currentEmailResponse.data && currentEmailResponse.data.length > 0) {
          const currentEmail = currentEmailResponse.data[0];

          if (currentEmail.replied_to_email_id) {
            // This is a reply, fetch the original email and any other replies to it
            const originalResponse = await axiosInstance.get(
              `${EMAIL_LIST_API}?email_list_id=eq.${currentEmail.replied_to_email_id}`
            );

            if (originalResponse.data && originalResponse.data.length > 0) {
              const originalEmail = originalResponse.data[0];

              // Fetch all replies to the original email
              const allRepliesResponse = await axiosInstance.get(
                `${EMAIL_LIST_API}?replied_to_email_id=eq.${originalEmail.email_list_id}`
              );

              // Combine original email with all replies in chronological order
              const emailThread = [originalEmail];
              if (
                allRepliesResponse.data &&
                allRepliesResponse.data.length > 0
              ) {
                emailThread.push(...allRepliesResponse.data);
              }

              // Sort by created_date
              emailThread.sort(
                (a, b) =>
                  new Date(a.created_date).getTime() -
                  new Date(b.created_date).getTime()
              );

              setRepliedEmails(emailThread);

              // Always start with the original email (index 0)
              setCurrentReplyIndex(0);
              // Set viewingReply to false to show the original email first
              setViewingReply(false);
            }
          } else {
            // This is an original email, fetch all replies to it
            const repliesResponse = await axiosInstance.get(
              `${EMAIL_LIST_API}?replied_to_email_id=eq.${id}`
            );

            if (repliesResponse.data && repliesResponse.data.length > 0) {
              // Sort replies by created_date
              const sortedReplies = repliesResponse.data.sort(
                (a: any, b: any) =>
                  new Date(a.created_date).getTime() -
                  new Date(b.created_date).getTime()
              );

              // Add the original email as the first in the thread
              setRepliedEmails([currentEmail, ...sortedReplies]);
              setCurrentReplyIndex(0); // Start with the original email
              setViewingReply(false); // Ensure we're viewing the original email
            }
          }
        }
      } catch (error) {
        console.log("error fetching email thread:", error);
      }
    };

    fetchRepliedEmails();
  }, [id, isView]);

  const handlePreviousEmail = () => {
    if (currentReplyIndex > -1) {
      setCurrentReplyIndex(currentReplyIndex - 1);

      if (currentReplyIndex === 0) {
        // Going back to original email
        setViewingReply(false);
      } else {
        // Going to previous reply
        setViewingReply(true);
      }
    }
  };

  const handleNextEmail = () => {
    if (currentReplyIndex < repliedEmails.length - 1) {
      setCurrentReplyIndex(currentReplyIndex + 1);
      setViewingReply(true);
    }
  };

  const displayedEmail = useMemo(() => {
    if (
      viewingReply &&
      currentReplyIndex >= 0 &&
      currentReplyIndex < repliedEmails.length
    ) {
      return repliedEmails[currentReplyIndex];
    }
    return data;
  }, [viewingReply, currentReplyIndex, repliedEmails, data]);

  useEffect(() => {
    // This effect will run whenever the displayed email changes
    if (displayedEmail) {
      if (isView) {
        // When in view mode, update the displayed content based on the current email
        setSubject(displayedEmail.subject || "");
        setTo(displayedEmail.to_user_email || []);
        setCc(displayedEmail.cc_emails || []);
        setBcc(displayedEmail.bcc_emails || []);
        setMessage(displayedEmail.body || "");

        // Show CC/BCC sections if they have content
        if (displayedEmail.cc_emails?.length > 0) {
          setShowCc(true);
        } else {
          setShowCc(false);
        }

        if (displayedEmail.bcc_emails?.length > 0) {
          setShowBcc(true);
        } else {
          setShowBcc(false);
        }
      }
    }
  }, [displayedEmail, isView]);

  const handleSaveTemplate = async () => {
    const payload = {
      created_user_id: session?.user?.id,
      created_user_name: session?.user?.name,
      created_date: new Date().toISOString(),
      business_name: session?.user?.business_name,
      business_number: session?.user?.business_number,
      subject: subject,
      sender_email: session?.user?.email,
      sender_name: session?.user?.name,
      sender_mobile: session?.user?.mobile,
      to_user_email: to,
      cc_emails: cc,
      bcc_emails: bcc,
      body: message,
      from_user_email: from[0],
      from_user_name: settingsData?.find(
        (item: any) => item.data_response.user === from[0]
      )?.data_response.name,
      template: true,
      template_name: subject,
      email_no: randomId,
    };

    const response = await axiosInstance.post(EMAIL_LIST_API, payload);
    if (response.status === 201) {
      toast.success("Email template saved successfully");
      setEmailContent("");
    } else {
      toast.error("Failed to save email template"); 
    }
    
  };

  const handleSaveDraft = async () => {
    const payload = {
      created_user_id: session?.user?.id,
      created_user_name: session?.user?.name,
      created_date: new Date().toISOString(),
      business_name: session?.user?.business_name,
      business_number: session?.user?.business_number,
      subject: subject,
      sender_email: session?.user?.email,
      sender_name: session?.user?.name,
      sender_mobile: session?.user?.mobile,
      to_user_email: to,
      cc_emails: cc,
      bcc_emails: bcc,
      body: message,
      from_user_email: settingsData?.find(
        (item: any) => item.data_response.user === from[0]
      )?.data_response.user,
      from_user_name: settingsData?.find(
        (item: any) => item.data_response.user === from[0]
      )?.data_response.name,
      is_draft: true,
      email_no: randomId,
      email_file_json: fileData,
    };

    const response = await axiosInstance.post(EMAIL_LIST_API, payload);
    if (response.status === 201) {
      toast.success("Email draft saved successfully");
      setEmailContent("");
    } else {
      toast.error("Failed to save email draft");
    }
  };

  const createReferenceEmails = async (
    primaryEmailId: string,
    primaryPayload: any
  ) => {
    for (const ccEmail of cc) {
      const ccUser: any = users.find(
        (user: any) => user.user_email === ccEmail
      );
      if (ccUser) {
        const ccPayload = {
          ...primaryPayload,
          to_user_email: [ccEmail],
          to_user_name: ccUser.user_name || "",
          to_business_name: ccUser.business_name || "",
          to_business_number: ccUser.business_number || "",
          for_business_name: ccUser.business_name || "",
          for_business_number: ccUser.business_number || "",
          from_business_name: settingsData?.find(
            (item: any) => item.data_response.user === from[0]
          )?.business_name,
          from_business_number: settingsData?.find(
            (item: any) => item.data_response.user === from[0]
          )?.business_number,
          to_user_mobile: ccUser.user_mobile || "",
          cc_emails: [],
          bcc_emails: [],
          ref_email_id: primaryEmailId,
        };
        await axiosInstance.post(EMAIL_LIST_API, ccPayload);
      }
    }
    for (const bccEmail of bcc) {
      const bccUser: any = users.find(
        (user: any) => user.user_email === bccEmail
      );
      if (bccUser) {
        const bccPayload = {
          ...primaryPayload,
          to_user_email: [bccEmail],
          to_user_name: bccUser.user_name || "",
          to_business_name: bccUser.business_name || "",
          to_business_number: bccUser.business_number || "",
          for_business_name: bccUser.business_name || "",
          for_business_number: bccUser.business_number || "",
          from_business_name: settingsData?.find(
            (item: any) => item.data_response.user === from[0]
          )?.business_name,
          from_business_number: settingsData?.find(
            (item: any) => item.data_response.user === from[0]
          )?.business_number,
          to_user_mobile: bccUser.user_mobile || "",
          cc_emails: [],
          bcc_emails: [],
          ref_email_id: primaryEmailId,
        };
        await axiosInstance.post(EMAIL_LIST_API, bccPayload);
      }
    }
  };

  const resetData = () => {
    setSubject("");
    setTo([]);
    setCc([]);
    setBcc([]);
    setMessage("");
    setEmailContent("");
    setFileData([]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const mainRecipient: any = users.find(
      (user: any) => user.user_email === to[0]
    );
    const payload = {
      created_user_id: session?.user?.id,
      created_user_name: session?.user?.name,
      created_date: new Date().toISOString(),
      business_name: session?.user?.business_name,
      business_number: session?.user?.business_number,
      subject: subject,
      sender_email: session?.user?.email,
      sender_name: session?.user?.name,
      sender_mobile: session?.user?.mobile,
      to_user_email: to,
      to_user_name: mainRecipient?.user_name || "",
      to_business_name: mainRecipient?.business_name || "",
      to_business_number: mainRecipient?.business_number || "",
      for_business_name: mainRecipient?.business_name || "",
      for_business_number: mainRecipient?.business_number || "",
      from_business_name: settingsData?.find(
        (item: any) => item.data_response.user === from[0]
      )?.business_name,
      from_business_number: settingsData?.find(
        (item: any) => item.data_response.user === from[0]
      )?.business_number,
      to_user_mobile: mainRecipient?.user_mobile || "",
      cc_emails: cc,
      bcc_emails: bcc,
      body: message,
      from_user_email: settingsData?.find(
        (item: any) => item.data_response.user === from[0]
      )?.data_response.user,
      from_user_mobile: settingsData?.find(
        (item: any) => item.data_response.user === from[0]
      )?.mobile,
      from_user_name: settingsData?.find(
        (item: any) => item.data_response.user === from[0]
      )?.name,
      email_no: randomId,
      replied_to_email_id: isReply ? replyId : isReplyAll ? replyAllId : null,
      ref_email_id: isReply ? replyId : isReplyAll ? replyAllId : null,
      forwarded_from_email_id: isForward ? forwardId : null,
      email_file_json: fileData,
    };
    const response = await axiosInstance.post(EMAIL_LIST_API, payload);
    if (response.status === 201) {
      const primaryEmailId = randomId;
      await createReferenceEmails(primaryEmailId, payload);
      setIsLoading(false);
      toast.success("Email sent successfully");
      if (!isForward || !isReply || !isReplyAll) {
        resetData();
      }
    } else {
      setIsLoading(false);
      toast.error("Failed to send email");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files?.[0];
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size exceeds 5MB limit");
        return;
      }
    }
    setFileUpload(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        const fileData = {
          id: uuidv4(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: data.url,
        };
        setFileData((prev) => [...prev, fileData]);
        setFileUrl(data.url);
      } else {
        toast.error("Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file", error);
    } finally {
      setFileUpload(false);
    }
  };

  const handleDownload = async (file: any) => {
    const url = file?.url;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = file?.name;
      a.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  const handleAddActions = async (email: any, action: string) => {
    try {
      const response = await axiosInstance.patch(
        `${EMAIL_LIST_API}?email_list_id=eq.${email?.email_list_id}`,
        {
          [action]: true,
        }
      );
      fetchEmailData();
    } catch (error) {
      console.log("error------", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {isView
            ? "View Email"
            : isReply
            ? "Edit Email - Reply"
            : isReplyAll
            ? "Edit Email - Reply All"
            : isForward
            ? "Edit Email - Forward"
            : "New Email"}
        </h1>
        <Link href="/Email">
          <Button variant={"outline"} className="border-0">
            Back to Email
          </Button>
        </Link>
      </div>
      <div>
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div
                className={`${isView ? "block mt-5 border-b pb-5" : "hidden"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarFallback>
                        {displayedEmail?.sender_email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {displayedEmail?.cc_emails?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span>cc:</span>
                        {displayedEmail?.cc_emails.map((item: any) => (
                          <Avatar key={item.email_list_id}>
                            <AvatarFallback>
                              {item.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    )}
                    {displayedEmail?.bcc_emails?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span>bcc:</span>
                        {displayedEmail?.bcc_emails.map((item: any) => (
                          <Avatar key={item.email_list_id}>
                            <AvatarFallback>
                              {item.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-5">
                    <ChevronLeft
                      className={`h-5 w-5 ${
                        currentReplyIndex >= 0
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-50"
                      } text-muted-foreground`}
                      onClick={handlePreviousEmail}
                    />
                    <span className="text-sm">
                      {currentReplyIndex + 1 > 0 ? currentReplyIndex + 1 : 0}/
                      {repliedEmails.length}
                    </span>
                    <ChevronRight
                      className={`h-5 w-5 ${
                        currentReplyIndex < repliedEmails.length - 1
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-50"
                      } text-muted-foreground`}
                      onClick={handleNextEmail}
                    />
                  </div>
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  <span className="font-semibold text-lg">
                    From: {displayedEmail?.sender_name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {displayedEmail?.sender_email}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(
                      displayedEmail?.created_date
                    ).toLocaleDateString()}
                    {" - "}
                    {displayedEmail?.created_date &&
                      formatDistanceToNow(
                        new Date(displayedEmail?.created_date)
                      )}{" "}
                    ago
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex mt-2.5 gap-3 items-center">
                    <Flag
                      onClick={() => handleAddActions(data, "is_important")}
                      className={`h-4 w-4 cursor-pointer text-muted-foreground 
                              ${
                                displayedEmail?.is_important
                                  ? "border-secondary fill-red-500"
                                  : ""
                              }
                              `}
                    />
                    <Star
                      onClick={() => handleAddActions(data, "is_starred")}
                      className={`h-4 w-4 cursor-pointer text-muted-foreground 
                              ${
                                displayedEmail?.is_starred
                                  ? "border-secondary fill-yellow-500"
                                  : ""
                              }
                              `}
                    />
                    <Bookmark
                      onClick={() => handleAddActions(data, "is_bookmark")}
                      className={`h-4 w-4 cursor-pointer text-muted-foreground 
                              ${
                                displayedEmail?.is_bookmark
                                  ? "border-secondary fill-blue-500"
                                  : ""
                              }
                              `}
                    />
                    <Archive
                      onClick={() => handleAddActions(data, "is_archive")}
                      className={`h-4 w-4 cursor-pointer text-muted-foreground 
                              ${
                                displayedEmail?.is_archive
                                  ? "border-secondary fill-green-500"
                                  : ""
                              }
                              `}
                    />
                    <FaReadme
                      onClick={() => handleAddActions(data, "is_read")}
                      className={`h-4 w-4 cursor-pointer text-muted-foreground 
                              ${
                                displayedEmail?.is_read
                                  ? "border-secondary fill-green-500"
                                  : ""
                              }
                              `}
                    />
                    <AlertTriangle
                      onClick={() => handleAddActions(data, "is_alert")}
                      className={`h-4 w-4 cursor-pointer text-muted-foreground 
                              ${
                                displayedEmail?.is_alert
                                  ? "border-secondary fill-yellow-500"
                                  : ""
                              }
                              `}
                    />
                    <Bell
                      // onClick={() => handleAddActions(data, "is_alert")}
                      className={`h-4 w-4 cursor-pointer text-muted-foreground 
                              
                              `}
                    />
                    <MessageSquare
                      // onClick={() => handleAddActions(data, "is_alert")}
                      className={`h-4 w-4 cursor-pointer text-muted-foreground 
                              
                              `}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <Link href={`/Email/reply/${id}`}>
                        <DropdownMenuItem>
                          <Reply className="h-4 w-4 mr-2" />
                          Reply
                        </DropdownMenuItem>
                      </Link>
                      <Link href={`/Email/replyAll/${id}`}>
                        <DropdownMenuItem>
                          <ReplyAll className="h-4 w-4 mr-2" />
                          Reply All
                        </DropdownMenuItem>
                      </Link>
                      <Link href={`/Email/forward/${id}`}>
                        <DropdownMenuItem>
                          <Forward className="h-4 w-4 mr-2" />
                          Forward
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="mt-4">
                <Label
                  htmlFor="select-template"
                  className={`${
                    isView || isReply || isReplyAll || isForward ? "hidden" : ""
                  }`}
                >
                  Select Template
                </Label>
                <Select
                  onValueChange={(selectedId) => {
                    const selectedItem = templateList.find(
                      (item: any) => item?.email_list_id == selectedId
                    );
                    setSelectedTemplate(selectedItem);
                  }}
                  value={selectedTemplate?.email_list_id}
                >
                  <SelectTrigger
                    className={`${
                      isView || isReply || isReplyAll || isForward
                        ? "hidden"
                        : ""
                    }`}
                    id="select-template"
                  >
                    <SelectValue placeholder="Select a Template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateList?.map(
                      (item: any) =>
                        item && (
                          <SelectItem
                            key={item?.email_list_id}
                            value={item?.email_list_id}
                          >
                            {item?.subject}
                          </SelectItem>
                        )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  readOnly={isView}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1"
                  id="subject"
                  placeholder="Enter Subject"
                />
              </div>
              <div className="mt-4">
                <Label htmlFor="from">From</Label>
                {isView ? (
                  <Input
                    readOnly
                    value={displayedEmail?.sender_email}
                    className="mt-1"
                    id="from"
                  />
                ) : (
                  <Select
                    onValueChange={(value) => setFrom([value])}
                    value={from[0]}
                  >
                    <SelectTrigger disabled={isView} id="from">
                      <SelectValue placeholder="Select a contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {settingsData?.map((item: any) => (
                        <SelectItem
                          key={item.user_catalog_data_id}
                          value={item.data_response.user}
                        >
                          {item.data_response.user}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="mt-4">
                <div className="flex justify-between">
                  <Label htmlFor="to">To</Label>
                  <div className="flex gap-2">
                    <Label
                      htmlFor="cc"
                      className="text-blue-400 cursor-pointer"
                      onClick={() => !isView && setShowCc(!showCc)}
                    >
                      Cc
                    </Label>
                    <Label
                      htmlFor="bcc"
                      className="text-blue-400 cursor-pointer"
                      onClick={() => !isView && setShowBcc(!showBcc)}
                    >
                      Bcc
                    </Label>
                  </div>
                </div>

                <MultiSelector
                  values={to}
                  onValuesChange={(values: string[]) => setTo(values)}
                >
                  <MultiSelectorTrigger disabled={isView}>
                    <MultiSelectorInput
                      disabled={isView}
                      placeholder="Select: To"
                    />
                  </MultiSelectorTrigger>
                  <MultiSelectorContent>
                    <MultiSelectorList>
                      {users.map((item: any) => (
                        <MultiSelectorItem
                          key={item.user_catalog_id}
                          value={item.user_email}
                        >
                          {item.user_email}
                        </MultiSelectorItem>
                      ))}
                    </MultiSelectorList>
                  </MultiSelectorContent>
                </MultiSelector>
              </div>
              {showCc && (
                <div className="mt-4">
                  <div className="flex justify-between">
                    <Label htmlFor="Cc">Cc</Label>
                  </div>

                  <MultiSelector
                    values={cc}
                    onValuesChange={(values: string[]) => setCc(values)}
                  >
                    <MultiSelectorTrigger disabled={isView}>
                      <MultiSelectorInput
                        disabled={isView}
                        placeholder="Select: Cc"
                      />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        {users.map((item: any) => (
                          <MultiSelectorItem
                            key={item.user_catalog_id}
                            value={item.user_email}
                          >
                            {item.user_email}
                          </MultiSelectorItem>
                        ))}
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                </div>
              )}
              {showBcc && (
                <div className="mt-4">
                  <div className="flex justify-between">
                    <Label htmlFor="Bcc">Bcc</Label>
                  </div>

                  <MultiSelector
                    values={bcc}
                    onValuesChange={(values: string[]) => setBcc(values)}
                  >
                    <MultiSelectorTrigger disabled={isView}>
                      <MultiSelectorInput
                        disabled={isView}
                        placeholder="Select: Bcc"
                      />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        {users.map((item: any) => (
                          <MultiSelectorItem
                            key={item.user_catalog_id}
                            value={item.user_email}
                          >
                            {item.user_email}
                          </MultiSelectorItem>
                        ))}
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                </div>
              )}
              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <Label>Message</Label>
                  {!isView && !isForward && (
                    <div className="flex gap-2.5">
                      <Link
                        href={
                          isReply
                            ? `/Email/reply/${replyId}/email-agent`
                            : isReplyAll
                            ? `/Email/replyAll/${replyAllId}/email-agent`
                            : "/Email/email-agent"
                        }
                      >
                        <Bot className="h-5 w-5 cursor-pointer" />
                      </Link>
                      <Workflow className="h-5 w-5 cursor-pointer" />
                    </div>
                  )}
                </div>
                <div className="border rounded-md overflow-hidden mt-1">
                  {/* Toolbar */}
                  <div className="flex items-center p-2 border-b bg-gray-50">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Bold"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Italic"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Underline"
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                    <div className="h-6 border-l mx-2"></div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Bullet List"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Numbered List"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <div className="h-6 border-l mx-2"></div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Insert Link"
                    >
                      <LuLink className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Insert Image"
                    >
                      <LuImage className="h-4 w-4" />
                    </Button>
                    {/* <Button
                      type="button"
                      variant="ghost"
                      disabled={isForward}
                      size="icon"
                      onClick={() => fileRef.current?.click()}
                      className="h-8 w-8"
                      title="Attach File"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    {fileUpload && (
                      <span className="text-sm text-gray-500">
                        Uploading...
                      </span>
                    )} */}
                  </div>
                  <input
                    type="file"
                    ref={fileRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {isView ? (
                    <div className="p-4 min-h-[300px] prose max-w-none">
                      {renderSafeHtml(message)}
                    </div>
                  ) : (
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="p-4 resize-none min-h-[300px] prose max-w-none focus:outline-none"
                    />
                  )}
                </div>
              </div>
              {fileData.length > 0 && (
                <div className="mt-4">
                  <Label htmlFor="attachments">
                    Attachments ({fileData?.length})
                  </Label>
                  <div
                    className="flex border justify-between rounded-md p-2 items-center gap-2"
                    id="attachments"
                  >
                    <div className="flex flex-col gap-2 w-full">
                      {fileData.map((file, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center gap-2.5"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="bg-gray-200 p-2.5 rounded-md">
                              {file?.type.split("/")[1].toUpperCase()}
                            </span>
                            <div className="flex flex-col">
                              <span>{file?.name}</span>
                              <span>
                                {((file?.size / 1024 / 1024) * 100).toFixed(2)}
                                MB
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mr-3">
                            <Download
                              onClick={() => handleDownload(file)}
                              className="h-4 w-4 cursor-pointer"
                            />
                            {isView && (
                              <Link
                                href={`/Email/preview/${id}/viewFile/${encodeURIComponent(
                                  file?.url
                                )}`}
                              >
                                <Eye className="h-4 w-4 cursor-pointer" />
                              </Link>
                            )}
                            {/* <Sheet>
                              <SheetTrigger>
                                {isView && (
                                  <FileText className="h-4 w-4 cursor-pointer" />
                                )}
                              </SheetTrigger>
                              <SheetContent>
                                <SheetHeader>
                                  <SheetTitle>Documents Uploaded</SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col mt-5  gap-2.5">
                                  {fileData.map((file, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2.5"
                                    >
                                      <Checkbox
                                        checked={selectedFiles.includes(file)}
                                        onCheckedChange={(checked) => {
                                          setSelectedFiles((prev: any) => {
                                            if (checked) {
                                              return [...prev, file];
                                            } else {
                                              return prev.filter(
                                                (item: any) => item !== file
                                              );
                                            }
                                          });
                                        }}
                                      />
                                      <div className="flex flex-col">
                                        <span>{file?.name}</span>
                                        <span>
                                          {(
                                            (file?.size / 1024 / 1024) *
                                            100
                                          ).toFixed(2)}
                                          MB
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <SheetFooter>
                                  <Button
                                    onClick={() => {
                                      console.log(
                                        "selectedFiles----",
                                        selectedFiles
                                      );
                                      router.push(
                                        `/Email/chat_with_doc/${id}/${file?.id}`
                                      );
                                    }}
                                  >
                                    Check
                                  </Button>
                                </SheetFooter>
                              </SheetContent>
                            </Sheet> */}
                            {isView && (
                              <Link
                                href={`/Email/chat_with_doc/${id}/${file?.id}`}
                              >
                                <Bot className="h-4 w-4 cursor-pointer" />
                              </Link>
                            )}
                            {!isView && (
                              <X
                                className="h-4 w-4 cursor-pointer"
                                onClick={() => {
                                  setFileData(
                                    fileData.filter((_, i) => i !== index)
                                  );
                                }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-4">
                <Button
                  variant={"outline"}
                  className="w-full flex gap-2.5 items-center"
                  onClick={() => fileRef.current?.click()}
                  disabled={fileUpload}
                  type="button"
                >
                  {fileUpload ? (
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                    </span>
                  ) : (
                    <>
                      <Paperclip className="h-4 w-4" />
                      Attach Files
                    </>
                  )}
                </Button>
              </div>
              <div
                className={`${
                  isView ? "mt-4 flex gap-2.5 items-center" : "hidden"
                }`}
              >
                <Link href={`/Email/reply/${data?.email_list_id}`}>
                  <Button
                    variant={"outline"}
                    className="flex items-center gap-2"
                    type="button"
                  >
                    <Reply className="h-5 w-5" />
                    Reply
                  </Button>
                </Link>
                <Link href={`/Email/replyAll/${data?.email_list_id}`}>
                  <Button
                    variant={"outline"}
                    className="flex items-center gap-2"
                    type="button"
                  >
                    <ReplyAll className="h-5 w-5" />
                    Reply All
                  </Button>
                </Link>
                <Link href={`/Email/forward/${data?.email_list_id}`}>
                  <Button
                    variant={"outline"}
                    className="flex items-center gap-2"
                    type="button"
                  >
                    <Forward className="h-5 w-5" />
                    Forward
                  </Button>
                </Link>
                <Button
                  variant={"outline"}
                  className="flex text-red-500 items-center gap-2"
                  type="button"
                >
                  <Trash className="h-5 text-red-500 w-5" />
                  Delete
                </Button>
              </div>
              <div
                className={`${
                  isView ? "hidden" : "mt-4 flex justify-between gap-2"
                }`}
              >
                <Button variant={"outline"} type="button">
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant={"outline"}
                    type="button"
                    onClick={handleSaveTemplate}
                    disabled={isLoading}
                    className={`${
                      isReply || isReplyAll || isForward
                        ? "hidden"
                        : "flex items-center gap-2.5"
                    }`}
                  >
                    Save as Template
                  </Button>
                  <Button
                    variant={"outline"}
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isLoading}
                    className={`${
                      isReply || isReplyAll || isForward
                        ? "hidden"
                        : "flex items-center gap-2.5"
                    }`}
                  >
                    <Save className="h-5 w-5" />
                    Save as Draft
                  </Button>
                  <Button
                    disabled={
                      isLoading ||
                      !to?.length ||
                      !subject ||
                      !message ||
                      !from[0]
                    }
                    className="flex items-center gap-2.5"
                  >
                    <Send className="h-5 w-5" />
                    {isLoading ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewEmail;
