"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import axiosInstance from "@/utils/axiosInstance";
import { useCustomSession } from "@/utils/session";
import { CREATE_IMAP_DETAILS_URL } from "@/constants/envConfig";
import { toast } from "../ui/use-toast";

const NewSettings = ({
  id,
  isView,
  isEdit,
}: {
  id?: string;
  isView?: boolean;
  isEdit?: boolean;
}) => {
  const [settingsData, setSettingsData] = useState({
    user: "",
    password: "",
    host: "",
    port: "",
    tls: "",
  });
  const session = useCustomSession();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      try {
        const fetchSettings = async () => {
          const response = await axiosInstance.get(
            `${CREATE_IMAP_DETAILS_URL}?user_catalog_data_id=eq.${id}`
          );
          const data = response.data[0];

          if (isEdit || isView) {
            setSettingsData({
              user: data?.data_response?.user,
              password: data?.data_response?.password,
              host: data?.data_response?.host,
              port: data?.data_response?.port,
              tls: data?.data_response?.tls as string,
            });
          }
        };
        fetchSettings();
      } catch (error) {}
    }
  }, [id, isEdit, isView]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      user_catalog_id: session?.user?.id,
      user_name: session?.user?.name,
      user_email: session?.user?.email,
      user_mobile: session?.user?.mobile,
      business_number: session?.user?.business_number,
      business_name: session?.user?.business_name,
      data_response: settingsData,
    };
    setIsLoading(true);

    let response;
    if (id) {
      // Use PATCH method for updating existing settings
      response = await axiosInstance.patch(
        `${CREATE_IMAP_DETAILS_URL}?user_catalog_data_id=eq.${id}`,
        payload
      );
    } else {
      // Use POST method for creating new settings
      response = await axiosInstance.post(CREATE_IMAP_DETAILS_URL, payload);
    }

    if (response.status === 201 || response.status === 204) {
      if (!id) {
        // Only reset form for new settings creation
        setSettingsData({
          user: "",
          password: "",
          host: "",
          port: "",
          tls: "",
        });
      }

      toast({
        variant: "default",
        description: id
          ? "Settings updated successfully"
          : "Settings saved successfully",
      });
    } else {
      toast({
        variant: "destructive",
        description: id
          ? "Failed to update settings"
          : "Failed to save settings",
      });
    }
    setIsLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mt-5">
        <Card>
          <CardContent>
            <div className="flex mt-5 justify-between items-center">
              <h1 className="text-2xl font-semibold">
                {isView
                  ? "View Settings"
                  : isEdit
                  ? "Edit Settings"
                  : "New Settings"}
              </h1>
              <Link href="/Email/settings">
                <Button className="border-0" variant={"outline"}>
                  Back to Settings
                </Button>
              </Link>
            </div>
            <div className="mt-5">
              <div>
                <Label htmlFor="user">User</Label>
                <Input
                  disabled={isView}
                  id="user"
                  placeholder="Enter User"
                  value={settingsData.user}
                  onChange={(e) => {
                    setSettingsData({
                      ...settingsData,
                      user: e.target.value,
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  disabled={isView}
                  placeholder="Enter Password"
                  value={settingsData.password}
                  onChange={(e) => {
                    setSettingsData({
                      ...settingsData,
                      password: e.target.value,
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="host">Host</Label>
                <Input
                  disabled={isView}
                  id="host"
                  placeholder="Enter Host"
                  value={settingsData.host}
                  onChange={(e) => {
                    setSettingsData({
                      ...settingsData,
                      host: e.target.value,
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="port">Port</Label>
                <Input
                  disabled={isView}
                  id="port"
                  placeholder="Enter Port"
                  value={settingsData.port}
                  onChange={(e) => {
                    setSettingsData({
                      ...settingsData,
                      port: e.target.value,
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="tls">TLS</Label>
                <Select
                  disabled={isView}
                  value={settingsData.tls}
                  onValueChange={(value) => {
                    setSettingsData({ ...settingsData, tls: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select TLS" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div
              className={`mt-5 ${
                isView ? "hidden" : "flex"
              }  justify-end gap-2`}
            >
              <Button variant={"outline"}>Cancel</Button>
              <Button
                disabled={
                  isLoading ||
                  !settingsData.user ||
                  !settingsData.password ||
                  !settingsData.host ||
                  !settingsData.port ||
                  !settingsData.tls
                }
              >
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default NewSettings;
