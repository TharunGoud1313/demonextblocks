import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { fetchValidApi } from "@/utils/fetchValidApi";
import { toast, useToast } from "../ui/use-toast";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "../ui/multi-select";
import axiosInstance from "@/utils/axiosInstance";
import { GET_CONTACTS_API } from "@/constants/envConfig";
import { Copy } from "lucide-react";

interface FormSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiEndpoint: string;
  setApiEndpoint: (value: string) => void;
  setContentData: (value: string) => void;
  editModeData: any;
  setFormStatus: (value: string) => void;
  setFormInput: (value: string) => void;
  setSuccessMsg: (value: string) => void;
  setRedirectActionUrl: (value: string) => void;
  formInput: string;
  setUsersSelected: (value: string[]) => void;
  apiConnectionJson: string;
  setApiConnectionJson: (value: string) => void;
  dbConnectionJson: string;
  setDbConnectionJson: (value: string) => void;
  documentConnectionJson: string;
  setDocumentConnectionJson: (value: string) => void;
  shareUrl: string;
}

export function FormSettingsModal({
  isOpen,
  onClose,
  setApiEndpoint,
  setContentData,
  editModeData,
  setFormStatus,
  setFormInput,
  setSuccessMsg,
  setRedirectActionUrl,
  formInput,
  setUsersSelected,
  apiConnectionJson,
  setApiConnectionJson,
  dbConnectionJson,
  setDbConnectionJson,
  documentConnectionJson,
  setDocumentConnectionJson,
  shareUrl,
}: FormSettingsModalProps) {
  const { toast } = useToast();
  const [apiUrl, setApiUrl] = useState("");
  const [contentText, setContent] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formActive, setFormActive] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [currentTab, setCurrentTab] = useState("settings");
  const [localFormInput, setLocalFormInput] = useState(formInput || ""); // Local state for form input
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const {
    content,
    data_api_url,
    form_name,
    status,
    form_success_url,
    form_success_message,
  } = editModeData;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get(GET_CONTACTS_API);

        setUsers(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (editModeData?.users_json) {
      setSelectedUsers(editModeData?.users_json);
    }
  }, [editModeData]);

  // Update form status when active state changes
  useEffect(() => {
    if (formActive) {
      setFormStatus("active");
    } else {
      setFormStatus("inactive");
    }
  }, [formActive, setFormStatus]);

  // Initialize all form values when editModeData changes
  useEffect(() => {
    setApiUrl(data_api_url || "");
    setLocalFormInput(form_name || "");
    setFormInput(form_name || "");
    setContent(content || "");
    setFormActive(status === "active");
    setSuccessMessage(form_success_message || "");
    setRedirectUrl(form_success_url || "");
  }, [
    data_api_url,
    form_name,
    content,
    status,
    form_success_message,
    form_success_url,
    setFormInput,
  ]);

  // Update local form input when prop changes
  useEffect(() => {
    setLocalFormInput(formInput || "");
  }, [formInput]);

  const handleSettingsSave = () => {
    if (!localFormInput.trim()) {
      toast({
        description: "Form name is required",
        variant: "destructive",
      });
      return;
    }

    setFormInput(localFormInput);
    setFormStatus(formActive ? "active" : "inactive");
    toast({
      description: "Form settings saved successfully",
      variant: "default",
    });
  };

  const handleContentSave = () => {
    if (!contentText.trim()) {
      toast({
        description: "Content data is required",
        variant: "destructive",
      });
      return;
    }

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = contentText;
    const formattedContent = tempDiv.innerHTML;

    setContentData(formattedContent);
    toast({
      description: "Content saved successfully",
      variant: "default",
    });
  };

  const handleConnectionSave = async () => {
    if (!apiUrl.trim()) {
      toast({
        description: "API endpoint is required",
        variant: "destructive",
      });
      return;
    }

    if (apiUrl.length > 0) {
      setApiEndpoint(apiUrl);
      toast({
        description: "API endpoint saved successfully",
        variant: "default",
      });
    } else {
      toast({
        description: "Invalid API endpoint",
        variant: "destructive",
      });
    }
  };

  const handleActionSave = () => {
    if (!successMessage.trim() || !redirectUrl.trim()) {
      toast({
        description: "Success message and redirect URL are required",
        variant: "destructive",
      });
      return;
    }

    setSuccessMsg(successMessage);
    setRedirectActionUrl(redirectUrl);

    toast({
      description: "Form actions saved successfully",
      variant: "default",
    });
    onClose();
  };

  const handleUsersSave = () => {
    setUsersSelected(selectedUsers);
    toast({
      description: "Users saved successfully",
      variant: "default",
    });
    onClose();
  };

  const renderSaveButton = () => {
    const saveHandlers = {
      settings: handleSettingsSave,
      users: handleUsersSave,
      content: handleContentSave,
      connection: handleConnectionSave,
      action: handleActionSave,
    };

    return (
      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={saveHandlers[currentTab as keyof typeof saveHandlers]}>
          Save {currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}
        </Button>
      </div>
    );
  };

  const handleSelectChange = (values: string[]) => {
    setSelectedUsers(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-h-[500px] overflow-y-scroll max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Agent Settings
            {/* <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button> */}
          </DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue="settings"
          className="w-full"
          onValueChange={(value) => setCurrentTab(value)}
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="action">Action</TabsTrigger>
          </TabsList>
          <TabsContent value="settings">
            <div className="space-y-4">
              <div>
                <Label htmlFor="formName">Agent Name</Label>
                <Input
                  value={localFormInput}
                  onChange={(e) => setLocalFormInput(e.target.value)}
                  id="formName"
                  placeholder="Enter Agent name"
                />
              </div>
              <div>
                <Label htmlFor="formDescription">Agent Description</Label>
                <Textarea
                  id="formDescription"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Enter Agent description"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="formActive"
                  checked={formActive}
                  onCheckedChange={setFormActive}
                />
                <Label htmlFor="formActive">Agent Active</Label>
              </div>
              <div className="">
                <Label htmlFor="url" className="text-right">
                  URL
                </Label>
                <Input id="url" placeholder="Url" value={shareUrl} />
              </div>
              <div className="">
                <Label htmlFor="shortUrl" className="text-right">
                  Short URL
                </Label>
                <Input id="shortUrl" value={shareUrl} placeholder="Short Url" />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="users">
            <MultiSelector
              values={selectedUsers}
              onValuesChange={(values: string[]) => handleSelectChange(values)}
            >
              <MultiSelectorTrigger>
                <MultiSelectorInput placeholder="Select Users" />
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
          </TabsContent>
          <TabsContent value="content">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Form Content</h3>
              <Textarea
                placeholder="Enter content (HTML formatting supported)"
                value={contentText}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          </TabsContent>
          <TabsContent value="connection">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data Connections</h3>
              <div>
                <Label htmlFor="apiEndpoint">API Endpoint</Label>
                <Input
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  id="apiEndpoint"
                  placeholder="Add API Endpoint"
                />
                <Label htmlFor="apiConnectionJson">API Connection JSON</Label>
                <Textarea
                  id="apiConnectionJson"
                  placeholder="Enter
                  API Connection JSON"
                  className="min-h-[150px]"
                  value={apiConnectionJson}
                  onChange={(e) => setApiConnectionJson(e.target.value)}
                />
                <Label htmlFor="dbConnectionJson">
                  Database Connection JSON
                </Label>
                <Textarea
                  id="dbConnectionJson"
                  placeholder="Enter
                  Database Connection JSON"
                  className="min-h-[150px]"
                  value={dbConnectionJson}
                  onChange={(e) => setDbConnectionJson(e.target.value)}
                />
                <Label htmlFor="documentConnectionJson">
                  Document Connection JSON
                </Label>
                <Textarea
                  id="documentConnectionJson"
                  placeholder="Enter
                  Document Connection JSON"
                  className="min-h-[150px]"
                  value={documentConnectionJson}
                  onChange={(e) => setDocumentConnectionJson(e.target.value)}
                />
              </div>
            </div>
            {/* <ConnectionsNew /> */}
          </TabsContent>
          <TabsContent value="action">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Form Actions</h3>
              <div>
                <Label htmlFor="successMessage">Success Message</Label>
                <Input
                  id="successMessage"
                  value={successMessage}
                  onChange={(e) => setSuccessMessage(e.target.value)}
                  placeholder="Thank you for your submission!"
                />
              </div>
              <div>
                <Label htmlFor="redirectUrl">Redirect URL</Label>
                <Input
                  id="redirectUrl"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  placeholder="https://example.com/thank-you"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        {renderSaveButton()}
      </DialogContent>
    </Dialog>
  );
}
