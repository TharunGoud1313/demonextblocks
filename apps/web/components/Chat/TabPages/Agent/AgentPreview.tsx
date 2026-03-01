"use client";
import {
  ArrowUp,
  Bookmark,
  Bot,
  Check,
  Code,
  Copy,
  Edit,
  Eye,
  FileText,
  FileUp,
  History,
  Image,
  Loader2,
  Menu,
  Mic,
  Pencil,
  Plus,
  RefreshCcw,
  RefreshCw,
  Share2,
  Star,
  ThumbsDown,
  ThumbsUp,
  User,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import SideBar from "@/components/Agents/SideBar/History";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { generateAIResponse } from "@/components/Agents/actions";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HistoryBar from "@/components/Agents/SideBar/History";
import MenuBar from "@/components/Agents/SideBar/Menu";
import BookmarkBar from "@/components/Agents/SideBar/Bookmark";
import { Session } from "@/components/doc-template/DocTemplate";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  CHAT_MESSAGE_API,
  CHAT_SESSION_API,
  SAVE_FORM_FIELDS,
} from "@/constants/envConfig";
import axiosInstance from "@/utils/axiosInstance";
import { Card } from "@/components/ui/card";
import CardRender from "@/components/Agents/Chat/Card";
import ChatwithDataCardJSON from "@/components/AgentMaker/chat-with-data-json/ChatwithDataJSON";
import TablesRendered from "@/components/Agents/Chat/TablesRendered";
import { Avatar } from "@/components/ui/avatar";
import { FaArrowUp } from "react-icons/fa";
import ChatHistory from "@/components/Agents/SideBar/History";

const AgentPreview = ({ field, chatId }: { field: any; chatId?: string }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>("");

  const suggestions = ["Chat with Data", "Chat with Doc"];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [openHistory, setOpenHistory] = useState<boolean>(false);
  const [openFavorites, setOpenFavorites] = useState<boolean>(false);
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");
  const [history, setHistory] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [deleteHistory, setDeleteHistory] = useState<boolean>(false);
  const router = useRouter();
  const [userChatSession, setUserChatSession] = useState<any>({});
  const [chatData, setChatData] = useState<any>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [refreshBookmarkState, setRefreshBookmarkState] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [getMenuData, setMenuData] = useState<any>(null);
  const [cardField, setCardField] = useState<any>(field);
  const [loading, setLoading] = useState(false);
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;
  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [chartConfig, setChartConfig] = useState<any>(null);
  const [componentName, setComponentName] = useState<any>(null);
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    if (field) {
      setCardField(field);
    }
  }, [field]);

  useEffect(() => {
    const initializeChat = async () => {
      if (!chatId && userChatSession?.id && field) {
        // Generate a UUID for the new chat
        const newChatUuid = uuidv4();
        const chatCode = `Agent_${Math.random().toString().slice(-4)}`;

        try {
          // Create a new chat
          await fetch("https://amogaagents.morr.biz/Chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            },
            body: JSON.stringify({
              createdAt: new Date().toISOString(),
              user_id: userChatSession?.id,
              id: newChatUuid,
              form_name: field?.form_name,
              form_code: field?.form_code,
              chat_session: [
                `${session?.user?.business_number},${field?.form_name},${chatCode},${session?.user?.name}`,
              ],
              chat_code: chatCode,
              form_id: field?.form_id,
            }),
          });

          // Redirect to the new chat URL
          router.push(`/Chat/agents/${field?.form_id}/${newChatUuid}`);
        } catch (error) {
          console.error("Error creating chat:", error);
          toast({
            description: "Failed to create new chat",
            variant: "destructive",
          });
        }
      }
    };

    initializeChat();
  }, [
    chatId,
    userChatSession?.id,
    field,
    session?.user?.business_number,
    session?.user?.name,
    router,
  ]);

  useEffect(() => {
    const fetchMenuData = async () => {
      const response = await axiosInstance.get(SAVE_FORM_FIELDS);
      const filteredData = response.data.filter((form: any) =>
        form?.users_json?.includes(session?.user?.email)
      );
      setMenuData(filteredData);
    };
    fetchMenuData();
  }, [openMenu, session]);

  // Add message helper function
  const addMessage = (role: "user" | "assistant", content: React.ReactNode) => {
    setMessages((prev) => [...prev, { id: uuidv4(), role, content }]);
  };

  useEffect(() => {
    if (messages.length === 0 && cardField) {
      // Add cardField check
      const messageContent = (
        <div className="flex w-full items-center">
          <CardRender
            key={JSON.stringify(cardField)} // Add key to force re-render
            field={cardField}
            setLoading={setLoading}
            setResults={setResults}
            setColumns={setColumns}
            setChartConfig={setChartConfig}
            setComponentName={setComponentName}
            setApiData={setApiData}
            session={session}
            handleRadioChange={(value: any) => {
              setSelectedValue(value);
              setCardField((prev: any) => {
                const updated = {
                  ...prev,
                  cardui_json: [
                    {
                      ...prev.cardui_json[0],
                      chat_with_data: {
                        ...prev.cardui_json[0]?.chat_with_data,
                        preference: value,
                      },
                    },
                  ],
                };
                return updated;
              });
            }}
          />
        </div>
      );
      addMessage("assistant", messageContent);
    }
  }, [cardField, messages.length, session]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch("https://amogaagents.morr.biz/User", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      });
      const data = await response.json();
      if (data.length > 0) {
        const existingUser = data.find(
          (user: any) => user?.email === session?.user?.email
        );

        setUserChatSession(existingUser);
        if (!existingUser) {
          const newUser = await fetch("https://amogaagents.morr.biz/User", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            },
            body: JSON.stringify({
              email: session?.user?.email,
              mobile: session?.user?.mobile,
            }),
          });
          const newUserData = await newUser.json();
          setUserChatSession(newUserData);
        }
      }
    };
    fetchUsers();
  }, [session]);

  const fetchHistory = async (userChatSession: any, setHistory: any) => {
    try {
      const response = await fetch(
        `https://amogaagents.morr.biz/Chat?form_name=neq.null`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        toast({
          description: "Failed to fetch history",
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();

      // Sort messages by creation timestamp
      const sortedMessages = data.sort((a: any, b: any) => {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      // Map the messages to include all necessary fields
      const formattedMessages = sortedMessages.map((msg: any) => ({
        id: msg.id,
        chatId: msg.chatId,
        content: msg.content,
        role: msg.role,
        status: msg.status,
        createdAt: msg.createdAt,
        user_id: msg.user_id,
        bookmark: msg.bookmark,
        isLike: msg.isLike,
        favorite: msg.favorite,
        response_data_json: msg.response_data_json,
        prompt_json: msg.prompt_json,
        form_name: msg.form_name,
        form_code: msg.form_code,
        chat_code: msg.chat_code,
        form_id: msg.form_id,
      }));

      setHistory(formattedMessages);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast({
        description: "Failed to fetch history",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (chatId && userChatSession) {
      fetchHistory(userChatSession, setHistory);
    }
  }, [chatId, userChatSession]);

  const handleSubmit = async () => {
    if (!selectedValue) return;
    setIsLoading(true);

    try {
      // Get chat details
      const chatResponse = await fetch(
        `https://amogaagents.morr.biz/Chat?id=eq.${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const chatData = await chatResponse.json();
      const currentChat = chatData[0];

      // Prepare prompt JSON
      const selectedButton =
        field?.cardui_json?.[0]?.chat_with_data?.buttons.find(
          (button: any) => button.button_text === selectedValue
        );

      // Prepare prompt JSON with proper structure
      const promptJson = {
        action: selectedButton?.button_text || selectedValue,
        prompt: selectedButton?.prompt || "",
        datetime: new Date().toISOString(),
      };

      // Prepare response data JSON
      const responseDataJson = {
        form_id: field?.form_id,
        results,
        columns,
        chartConfig,
        componentName,
        apiData,
      };

      // Save message to API
      await fetch("https://amogaagents.morr.biz/Message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
        body: JSON.stringify({
          id: uuidv4(),
          chatId: currentChat.id,
          prompt_json: promptJson,
          response_data_json: responseDataJson,
          chat_session: currentChat.chat_session,
          createdAt: new Date().toISOString(),
          user_id: session?.user?.id,
        }),
      });

      // Update UI with messages
      setMessages([
        {
          id: uuidv4(),
          role: "assistant",
          content: (
            <div className="flex flex-col">
              <span className="font-medium">
                {JSON.parse(field?.label) || "Please select your preference"}
              </span>
              {JSON.parse(field?.description) && (
                <span className="text-sm text-muted-foreground">
                  {JSON.parse(field?.description)}
                </span>
              )}
            </div>
          ),
        },
      ]);

      // Add user message with TablesRendered
      addMessage(
        "user",
        <div className="flex w-full overflow-x-auto items-center">
          <TablesRendered
            results={results}
            columns={columns}
            currentField={cardField}
            chartConfig={chartConfig}
            componentName={componentName}
            apiData={apiData}
            preference={selectedValue}
          />
        </div>
      );

      setIsLoading(false);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        description: "An error occurred while saving the message",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    // Reset all states
    setSelectedValue("");
    setResults([]);
    setColumns([]);
    setChartConfig(null);
    setComponentName(null);
    setApiData(null);

    // Reset messages to show CardRender
    setMessages([
      {
        id: uuidv4(),
        role: "assistant",
        content: (
          <div className="flex w-full overflow-x-auto md:w-[80vw] items-center">
            <CardRender
              field={field}
              handleRadioChange={(value: any) => setSelectedValue(value)}
              setLoading={setLoading}
              setResults={setResults}
              setColumns={setColumns}
              setChartConfig={setChartConfig}
              setComponentName={setComponentName}
              setApiData={setApiData}
              session={session}
            />
          </div>
        ),
      },
    ]);
  };

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between">
        <h1 className="flex text-xl font-semibold items-center gap-2">
          <Bot className="w-5 h-5 text-muted-foreground" />
          {field?.form_name}
        </h1>

        <Link href={`/Chat`}>
          <Button className="border-0" variant={"outline"}>
            Back to Chat
          </Button>
        </Link>
      </div>
      {field?.id && (
        <div className="flex items-center gap-2 mt-2">
          {/* <Input
            type="text"
            value={isEditingTitle ? editedTitle : field?.form_name}
            className={`border-0 w-fit max-w-[50% ] ${
              isEditingTitle ? "border border-primary" : ""
            }`}
            readOnly={!isEditingTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onFocus={() => {
              if (isEditingTitle && !editedTitle && chatData?.[0]?.title) {
                setEditedTitle(chatData[0].title);
              }
            }}
          /> */}
          {/* {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Check
                className="w-5 h-5 cursor-pointer"
                // onClick={handleUpdateTitle}
              />
              <X
                className="w-5 h-5 cursor-pointer"
                onClick={() => {
                  setIsEditingTitle(false);
                  setEditedTitle("");
                }}
              />
            </div>
          ) : (
            <Edit
              className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-primary"
              onClick={() => {
                setIsEditingTitle(true);
                setEditedTitle(chatData?.[0]?.title || "");
              }}
            />
          )} */}
          {/* <Bookmark
            className={`w-5 h-5 cursor-pointer text-muted-foreground hover:text-primary ${
              chatData?.[0]?.bookmark ? "fill-primary text-primary" : ""
            }`}
            // onClick={handleChatBookmark}
          /> */}
        </div>
      )}

      <ChatHistory
        open={openHistory}
        setOpen={setOpenHistory}
        data={history}
        setDeleteHistory={setDeleteHistory}
        title="History"
        refreshHistory={() => fetchHistory(userChatSession, setHistory)}
      />
      <BookmarkBar
        open={openFavorites}
        setOpen={setOpenFavorites}
        // bookmarks={bookmarks}
        favorites={favorites}
        setRefreshState={setRefreshBookmarkState}
        title="Favorites"
      />
      <MenuBar
        open={openMenu}
        setOpen={setOpenMenu}
        data={getMenuData}
        setDeleteHistory={setDeleteHistory}
        title="Menu"
      />

      <div className="flex flex-col space-y-4 w-full">
        <div className="flex flex-col space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } items-end`}
            >
              {message.role === "assistant" && (
                <Avatar className="mr-2">
                  <Bot className="h-5 w-5" />
                </Avatar>
              )}
              <div
                className={`w-full  rounded-lg p-4 ${
                  message.role === "assistant"
                    ? "bg-secondary w-full"
                    : "bg-secondary overflow-x-auto text-primary-foreground"
                }`}
              >
                {message.content}
              </div>
              {message.role === "user" && (
                <Avatar className="ml-2">
                  <User className="h-5 w-5" />
                </Avatar>
              )}
            </div>
          ))}
        </div>

        {selectedValue && (
          <div className="flex justify-end mt-4">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <div>
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : (
                <FaArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* <div className="mt-4">
        <CardRender field={field} />
        <Button onClick={handleSubmit}>Submit</Button>
      </div> */}
    </div>
  );
};

export default AgentPreview;
