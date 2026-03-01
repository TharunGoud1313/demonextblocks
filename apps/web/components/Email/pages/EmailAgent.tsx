"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCcw, Send } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { generateEmail } from "./actions";
import { toast } from "@/components/ui/use-toast";
import { useEmailAgentContext } from "@/contexts/EmailAgentContext";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/utils/axiosInstance";
import { EMAIL_LIST_API } from "@/constants/envConfig";

const EmailAgent = ({ id }: { id?: string }) => {
  const [prompt, setPrompt] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const { emailContent, setEmailContent } = useEmailAgentContext();

  useEffect(() => {
    if (id) {
      try {
        const getEmailData = async () => {
          const response = await axiosInstance.get(
            `${EMAIL_LIST_API}?email_list_id=eq.${id}`
          );
          const data = response.data;
          setSubject(data[0]?.subject);
          setBody(data[0]?.body);
        };
        getEmailData();
      } catch (error) {
        console.error("Error fetching email data:", error);
      }
    }
  }, [id]);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    try {
      const email = await generateEmail(prompt);
      setGeneratedEmail(email.body);
    } catch (error) {
      console.error("Error generating email:", error);
      toast({
        description: "Failed to generate email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseInComposer = () => {
    setEmailContent(generatedEmail);
    if (id && pathname.includes("replyAll")) {
      router.push(`/Email/replyAll/${id}`);
    } else if (id && pathname.includes("reply")) {
      router.push(`/Email/reply/${id}`);
    } else {
      router.push("/Email/new");
    }
  };

  const handleReset = () => {
    setPrompt("");
    setGeneratedEmail("");
  };

  return (
    <div>
      <Card>
        <CardContent>
          <div className="flex justify-between items-center mt-5">
            <h1 className="text-2xl font-semibold">Email Writing Assistant</h1>
            <Link href={"/Email"}>
              <Button variant={"outline"} className="border-0">
                Back to Email
              </Button>
            </Link>
          </div>
          <div className="mt-5">
            <Label className={`${id && "hidden"}`}>Plop Templates: </Label>
            <Select>
              <SelectTrigger className={`${id && "hidden"}`}>
                <SelectValue placeholder="Select Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent1">Agent 1</SelectItem>
                <SelectItem value="agent2">Agent 2</SelectItem>
                <SelectItem value="agent3">Agent 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {id && (
            <>
              <div className="mt-5">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Subject"
                  value={subject}
                  readOnly
                />
              </div>
              <div className="mt-5">
                <Label htmlFor="body">Body</Label>
                <Textarea
                  className="min-h-[200px]"
                  id="body"
                  placeholder="Body"
                  value={body}
                  readOnly
                />
              </div>
            </>
          )}
          <div className="mt-5">
            <Label>Describe the email you want to write: </Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Write prompt here..."
              className="min-h-[200px]"
            />
          </div>
          <div className="mt-5 justify-end flex">
            <Button disabled={!prompt || isLoading} onClick={handleGenerate}>
              <Send className="w-4 h-4 mr-2" />{" "}
              {isLoading ? "Generating..." : "Generate"}
            </Button>
          </div>
          <div className="mt-5">
            <Label>Generated Email: </Label>
            <Textarea
              value={generatedEmail}
              className="min-h-[200px]"
              onChange={(e) => setGeneratedEmail(e.target.value)}
            />
          </div>
          <div className="mt-5 flex justify-between">
            <Button
              onClick={handleReset}
              variant={"outline"}
              disabled={!generatedEmail}
            >
              <RefreshCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
            <Button disabled={!generatedEmail} onClick={handleUseInComposer}>
              Use in Composer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailAgent;
