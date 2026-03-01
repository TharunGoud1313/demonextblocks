import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Code,
  Calendar,
  Activity,
  CheckCircle2,
  Edit,
  Eye,
  Link as LinkIcon,
  Globe,
  Key,
  Lock,
  Server,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ADD_CONNECTIONS, NEXT_PUBLIC_API_KEY } from "@/constants/envConfig";
import { Session } from "@/components/doc-template/DocTemplate";
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

const ConnectionsNew = () => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Connection[]>([]);
  const [filteredData, setFilteredData] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

  const [newConnection, setNewConnection] = useState<Partial<Connection>>({
    status: "inactive",
    created_date: new Date().toISOString().split("T")[0],
    test_status: "pending",
    api_method: "GET",
    test_data: '{\n  "key": "value"\n}',
  });

  useEffect(() => {
    const results = data.filter((item) =>
      Object.values(item).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(search.toLowerCase())
      )
    );
    setFilteredData(results);
  }, [search, data]);

  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${NEXT_PUBLIC_API_KEY}`);
      const requestOptions = {
        method: "GET",
        headers: myHeaders,
      };
      const response = await fetch(ADD_CONNECTIONS, requestOptions);
      if (!response.ok) {
        throw new Error("Failed to fetch connections");
      }
      const connections: Connection[] = await response.json();
      setData(connections);
      setFilteredData(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      toast({
        description: "Failed to fetch connections",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewConnection({ ...newConnection, [e.target.name]: e.target.value });
  };

  const handleEdit = (item: Connection) => {
    setIsDialogOpen(true);
    setIsEditing(true);
    setNewConnection(item);
  };

  const handleDelete = async (id: string, fetchConnections: () => void) => {
    console.log("id----", id);
    const response = await axiosInstance.delete(
      `${ADD_CONNECTIONS}?id=eq.${id}`
    );
    fetchConnections();
    if (response.status === 200) {
      toast({
        description: "Connection deleted successfully",
        variant: "default",
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewConnection({ ...newConnection, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${NEXT_PUBLIC_API_KEY}`);
      myHeaders.append("Content-Type", "application/json");

      const { test_data, ...connectionData } = newConnection;

      const url = isEditing
        ? `${ADD_CONNECTIONS}?id=eq.${newConnection?.id}`
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
      setIsDialogOpen(false);
      fetchConnections();
    } catch (error) {
      setIsLoading(false);
      toast({
        description: `Failed to ${isEditing ? "edit" : "add"} connection`,
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = async (connection: Partial<Connection>) => {
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
        setNewConnection({ ...connection, test_status: "failed" });
        const errorData = await response.json();
        throw new Error(errorData.error || "Connection test failed");
      }

      await response.json();
      setNewConnection({ ...connection, test_status: "passed" });
      toast({
        description: "Connection test successful",
        variant: "default",
      });
    } catch (error: any) {
      setNewConnection({ ...connection, test_status: "failed" });
      toast({
        description: error.message || "Connection test failed",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col max-w-[800px] mx-auto justify-center gap-4 w-full items-center">
      <div className="flex w-full gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search connections"
            className="pl-10 text-md"
          />
        </div>
        <Link href="/doc-template/connections/new">
          <Button
            size={"icon"}
            onClick={() => {
              setIsEditing(false);
              setNewConnection({
                status: "inactive",
                created_date: new Date().toISOString().split("T")[0],
                test_status: "pending",
                api_method: "GET",
                test_data: '{\n  "key": "value"\n}',
              });
            }}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </Link>

        {/* <DialogContent className="w-full max-w-[800px]">
            <Card className="border-none">
              <CardHeader>
                <CardTitle>
                  {isEditing ? "Edit Connection" : "Add New Connection"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="connection_name">Connection Name</Label>
                      <Input
                        id="connection_name"
                        name="connection_name"
                        value={newConnection.connection_name || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="connection_type">Connection Type</Label>
                      <Select
                        value={newConnection.connection_type || ""}
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
                        value={newConnection.api_method || "GET"}
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
                        value={newConnection.status || "inactive"}
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
                        value={newConnection.api_url || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="key">Key</Label>
                      <Input
                        id="key"
                        name="key"
                        value={newConnection.key || ""}
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
                        value={newConnection.secret || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {newConnection.api_method === "POST" && (
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="test_data">Test Data (JSON)</Label>
                        <Textarea
                          id="test_data"
                          name="test_data"
                          value={newConnection.test_data || ""}
                          onChange={handleInputChange}
                          className="min-h-[100px] font-mono"
                          placeholder="Enter JSON data for POST request"
                          required
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <Button type="submit">
                      {isEditing
                        ? "Update Connection"
                        : isLoading
                        ? "Adding Connection..."
                        : "Add Connection"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleTestConnection(newConnection)}
                    >
                      Test Connection
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog> */}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center w-full">
          <Loader className="animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 w-full">
          {filteredData.map((item) => (
            <Card key={item.id} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  {/* Content Section */}
                  <div className="flex flex-col gap-4">
                    {/* Name and Type */}
                    <h2 className="font-semibold text-xl">
                      {item.connection_name}
                    </h2>

                    {/* Connection Type */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-5 w-5" />
                      <span>Type: {item.connection_type}</span>
                    </div>

                    {/* API Method */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Server className="h-5 w-5" />
                      <span>Method: {item.api_method}</span>
                    </div>

                    {/* API URL */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <LinkIcon className="h-5 w-5" />
                      <span className="truncate">URL: {item.api_url}</span>
                    </div>

                    {/* Key */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Key className="h-5 w-5" />
                      <span>Key: {item.key}</span>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-5 w-5" />
                      <span>Created: {formatDate(item.created_date)}</span>
                    </div>

                    {/* Test Status and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Activity className="h-5 w-5" />
                        <span>Test Status: </span>
                        <p>{item.test_status}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/doc-template/connections/edit/${item.id}`}
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleDelete(item.id, fetchConnections)
                          }
                        >
                          <Trash2 className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectionsNew;
