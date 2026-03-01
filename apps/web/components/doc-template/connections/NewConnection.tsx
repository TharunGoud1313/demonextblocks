"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ADD_CONNECTIONS, NEXT_PUBLIC_API_KEY } from "@/constants/envConfig";
import axiosInstance from "@/utils/axiosInstance";

type Connection = {
  id: string;
  status: "active" | "inactive";
  created_date: string;
  connection_name: string;
  connection_type: string;
  api_method: "GET" | "POST";
  api_url: string;
  key: string;
  secret: string;
  test_status: "passed" | "failed" | "pending";
  test_data?: string;
};

const NewConnections = ({
  isEditing = false,
  connectionId = "",
}: {
  isEditing?: boolean;
  connectionId?: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [connection, setConnection] = useState<Partial<Connection>>({
    status: "inactive",
    created_date: new Date().toISOString().split("T")[0],
    test_status: "pending",
    api_method: "GET",
    test_data: '{\n  "key": "value"\n}',
  });

  useEffect(() => {
    if (isEditing && connectionId) {
      fetchConnection(connectionId);
    }
  }, [isEditing, connectionId]);

  const fetchConnection = async (id: string) => {
    setIsLoading(true);
    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${NEXT_PUBLIC_API_KEY}`);
      const requestOptions = {
        method: "GET",
        headers: myHeaders,
      };
      const response = await fetch(
        `${ADD_CONNECTIONS}?id=eq.${id}`,
        requestOptions
      );
      if (!response.ok) {
        throw new Error("Failed to fetch connection");
      }
      const connections: Connection[] = await response.json();
      if (connections.length > 0) {
        setConnection(connections[0]);
      } else {
        toast({
          description: "Connection not found",
          variant: "destructive",
        });
        // router.push("/AgentMaker/connections");
      }
    } catch (error) {
      console.error("Error fetching connection:", error);
      toast({
        description: "Failed to fetch connection details",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setConnection({ ...connection, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setConnection({ ...connection, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${NEXT_PUBLIC_API_KEY}`);
      myHeaders.append("Content-Type", "application/json");

      const { test_data, ...connectionData } = connection;

      const url = isEditing
        ? `${ADD_CONNECTIONS}?id=eq.${connection?.id}`
        : ADD_CONNECTIONS;
      const method = isEditing ? "PUT" : "POST";
      const requestOptions = {
        method: method,
        headers: myHeaders,
        body: JSON.stringify(connectionData),
      };

      const response = await fetch(url, requestOptions);
      if (!response.ok) {
        throw new Error("Failed to save connection");
      }

      toast({
        description: `Connection ${
          isEditing ? "updated" : "added"
        } successfully`,
        variant: "default",
      });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast({
        description: `Failed to ${isEditing ? "edit" : "add"} connection`,
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = async () => {
    if (!connection.key || !connection.secret || !connection.api_url) {
      toast({
        description: "API URL, Key and Secret are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append(connection.key, connection.secret);

      let requestOptions: RequestInit = {
        method: connection.api_method,
        headers: headers,
      };

      if (connection.api_method === "POST") {
        if (!connection.test_data) {
          toast({
            description: "Test data is required for POST requests",
            variant: "destructive",
          });
          return;
        }

        try {
          const parsedData = JSON.parse(connection.test_data);
          requestOptions.body = JSON.stringify(parsedData);
        } catch (e) {
          toast({
            description: "Invalid JSON data format",
            variant: "destructive",
          });
          return;
        }
      }

      const response = await fetch(connection.api_url, requestOptions);

      if (!response.ok) {
        setConnection({ ...connection, test_status: "failed" });
        const errorData = await response.json();
        throw new Error(errorData.error || "Connection test failed");
      }

      await response.json();
      setConnection({ ...connection, test_status: "passed" });
      toast({
        description: "Connection test passed successfully",
        variant: "default",
      });
    } catch (error: any) {
      setConnection({ ...connection, test_status: "failed" });
      toast({
        description: error.message || "Connection test failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Connection" : "Add New Connection"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && isEditing ? (
            <div className="flex justify-center items-center py-10">
              <Loader className="animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="connection_name">Connection Name</Label>
                  <Input
                    id="connection_name"
                    name="connection_name"
                    value={connection.connection_name || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="connection_type">Connection Type</Label>
                  <Select
                    value={connection.connection_type || ""}
                    onValueChange={(value) =>
                      handleSelectChange("connection_type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="API">API</SelectItem>
                      <SelectItem value="Database">Database</SelectItem>
                      <SelectItem value="OAuth">OAuth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api_method">API Method</Label>
                  <Select
                    value={connection.api_method || "GET"}
                    onValueChange={(value) =>
                      handleSelectChange("api_method", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={connection.status || "inactive"}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="api_url">API URL</Label>
                  <Input
                    id="api_url"
                    name="api_url"
                    value={connection.api_url || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key">Key</Label>
                  <Input
                    id="key"
                    name="key"
                    value={connection.key || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret">Secret</Label>
                  <Input
                    id="secret"
                    name="secret"
                    type="password"
                    value={connection.secret || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {connection.api_method === "POST" && (
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="test_data">Test Data (JSON)</Label>
                    <Textarea
                      id="test_data"
                      name="test_data"
                      value={connection.test_data || ""}
                      onChange={handleInputChange}
                      className="min-h-[100px] font-mono"
                      placeholder="Enter JSON data for POST request"
                      required
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <div className="space-x-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        {isEditing ? "Updating..." : "Adding..."}
                      </>
                    ) : isEditing ? (
                      "Update Connection"
                    ) : (
                      "Add Connection"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/doc-template")}
                  >
                    Cancel
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                >
                  Test Connection
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewConnections;
