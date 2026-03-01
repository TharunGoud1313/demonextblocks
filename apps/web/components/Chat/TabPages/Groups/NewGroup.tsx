"use client";
import { Session } from "@/components/doc-template/DocTemplate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { CHAT_GROUP_API } from "@/constants/envConfig";
import axiosInstance from "@/utils/axiosInstance";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const NewGroup = ({ isEdit, data }: { isEdit: boolean; data?: any }) => {
  const [groupName, setGroupName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

  console.log("data----", data);

  useEffect(() => {
    if (data) {
      setGroupName(data?.chat_group_name);
      setStatus(data?.status);
    }
  }, [data]);

  const handleSave = async () => {
    if (!groupName) return;
    try {
      setLoading(true);
      const payload = {
        chat_group_name: groupName,
        status: status,
        created_user_id: session?.user?.id,
        created_user: session?.user?.name,
        business_number: session?.user?.business_number,
        business_name: session?.user?.business_name,
        created_at_datetime: new Date().toISOString(),
      };
      let response;
      if (data) {
        response = await axiosInstance.patch(
          `${CHAT_GROUP_API}?chat_group_id=eq.${data.chat_group_id}`,
          payload
        );
      } else {
        response = await axiosInstance.post(CHAT_GROUP_API, payload);
      }
      setLoading(false);
      setGroupName("");
      setStatus("");
      console.log("response----", response);
      if (response.status === 201) {
        toast({
          description: "Group created successfully",
          variant: "default",
        });
      }
      if (response.status === 204) {
        toast({
          description: "Group updated successfully",
          variant: "default",
        });
      }
    } catch (error) {
      setLoading(false);
      setGroupName("");
      setStatus("");
      console.log("error----", error);
      toast({
        description: "Error creating group",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <Card>
        <CardContent>
          <div className="flex items-center w-full mt-5 justify-between">
            <h1 className="text-xl font-semibold">Create New Group</h1>
            <Link href={"/Chat"}>
              <Button className="border-0" variant={"outline"}>
                Back to Group
              </Button>
            </Link>
          </div>
          <div className="mt-5">
            <Label htmlFor="group_name">
              Group Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="group_name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group Name"
            />
          </div>
          <div className="mt-5">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center justify-end w-full gap-2">
            <Link href={"/Chat"}>
              <Button variant={"outline"}>Cancel</Button>
            </Link>
            <Button disabled={!groupName || loading} onClick={handleSave}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NewGroup;
