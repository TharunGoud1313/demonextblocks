/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import { FormFieldType } from "@/types";
import { defaultFieldConfig } from "@/constants";
import If from "../ui/if";
import { FormFieldList } from "./DocFieldList";
import { FormPreview } from "./DocPreview";
import { EditFieldDialog } from "./EditFieldDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import List from "./List/List";
import ConnectionsNew from "./connections/connections";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  ADD_DOC_FIELDS,
  NEXT_PUBLIC_API_KEY,
  SAVE_DOC_TEMPLATE,
  SAVE_FORM_DATA,
} from "@/constants/envConfig";
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "../ui/use-toast";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import View from "./View/View";
import { Plus, Search, Settings } from "lucide-react";
import { FormSettingsModal } from "./doc-settings-modal";
// import { fieldTypes } from "@/constants";
import { docFieldTypes } from "@/constants/docIndex";

import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import DocCardTemplate from "./List/DocCardTemplate";

export interface Session {
  user: {
    name: string;
    email: string;
    id: string | number;
    mobile: string | number;
    business_number: string | number;
    business_name: string;
    first_name: string;
    last_name: string;
    business_postcode: string;
    roles: string;
    roles_json: string[];
  };
}

export type FormFieldOrGroup = FormFieldType | FormFieldType[];

export default function DocTemplate() {
  const t = useTranslations();
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;
  const path = usePathname();
  const route = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState<FormFieldOrGroup[]>([]);
  const [selectedField, setSelectedField] = useState<FormFieldType | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formInput, setFormInput] = useState("");
  const [editModeData, setEditModeData] = useState<any>([]);
  const [editFormInput, setEditFormInput] = useState<any>("");
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [apiFieldData, setApiFieldData] = React.useState<any>([]);
  const [apiEndpoint, setApiEndpoint] = React.useState("");
  const [contentData, setContentData] = React.useState("");
  const [formStatus, setFormStatus] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");
  const [redirectUrl, setRedirectUrl] = React.useState("");
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);

  const currentPath = path.includes("edit");
  const currentId = path.split("/").at(-1);
  const viewPath = path.includes("view");

  const filteredComponents = React.useMemo(
    () =>
      docFieldTypes.filter((component) =>
        component.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const addFormField = (variant: string, index: number) => {
    const newFieldName = `name_${Math.random().toString().slice(-10)}`;

    const { label, description, placeholder } = defaultFieldConfig[variant] || {
      label: t(`${variant}`, { fallback: variant }),
      description: "",
      placeholder: "",
    };

    const newField: FormFieldType = {
      checked: true,
      description: description || "",
      disabled: false,
      label: label,
      name: newFieldName,
      onChange: () => {},
      onSelect: () => {},
      placeholder: placeholder || "Placeholder",
      required: true,
      rowIndex: index,
      setValue: () => {},
      type: "",
      value: "",
      variant,
      // placeholder_file_url: "",
      // placeholder_video_url: "",
      // placeholder_file_upload_url: "",
      // placeholder_pdf_file_url: "",
      // validation_message: "",
      // variant_code: newFieldName,
    };
    setFormFields([...formFields, newField]);
  };

  const createDefaultField = () => {
    return {
      checked: true,
      description: "",
      disabled: false,
      label: "Heading Label",
      name: `name_${Math.random().toString().slice(-10)}`,
      onChange: () => {},
      onSelect: () => {},
      placeholder: "Type your text...",
      required: true,
      rowIndex: formFields.length,
      setValue: () => {},
      type: "text",
      value: "",
      variant: "Heading",
      validation_message: "",
      variant_code: `name_${Math.random().toString().slice(-10)}`,
    };
  };

  useEffect(() => {
    if (formFields.length === 0) {
      setFormFields([createDefaultField()]);
    }
  }, []);

  function formatDateToCustomFormat(date: Date) {
    const pad = (num: any, size = 2) => String(num).padStart(size, "0"); // Helper to pad numbers
    return (
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
      )} ` +
      `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
        date.getSeconds()
      )}.` +
      `${pad(date.getMilliseconds(), 3)}`
    );
  }

  const getData = async () => {
    try {
      const response = await fetch(
        `${SAVE_DOC_TEMPLATE}?mydoc_id=eq.${currentId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${NEXT_PUBLIC_API_KEY}`,
          },
        }
      );

      const result = await response.json();
      setEditModeData(result[0]);
      console.log("result-----", result);
      if (response.ok) {
        toast({ description: "Data fetched successfully", variant: "default" });
      } else {
        toast({ description: "Failed to fetch data", variant: "destructive" });
      }
    } catch (error) {
      console.log("Error in fetching data", error);
      toast({ description: "Error in fetching data", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (currentPath) {
      getData();
    }
  }, []);

  useEffect(() => {
    if (currentPath && editModeData?.doc_json) {
      setFormFields(editModeData.doc_json);
      setEditFormInput(editModeData?.template_name || "");
      setFormInput(editModeData?.template_name || "");
    }
  }, [currentPath, editModeData]);

  console.log("selectedUsers-----", selectedUsers);

  const handleSave = async () => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${NEXT_PUBLIC_API_KEY}`);
    const date = new Date();
    setIsLoading(true);

    // Filter out disabled fields from formFields
    const activeFormFields = formFields
      .filter((field: any) => {
        // If field is an array (grouped fields), filter out disabled fields within the group
        if (Array.isArray(field)) {
          return field.some((subField: any) => !subField.disabled);
        }
        // For individual fields, check if not disabled
        return !field.disabled;
      })
      .map((field: any) => {
        // If it's a grouped field, filter out disabled subfields
        if (Array.isArray(field)) {
          return field.filter((subField: any) => !subField.disabled);
        }
        return field;
      });

    // Get name fields from active form fields
    const nameFields =
      activeFormFields &&
      activeFormFields.flatMap((field: any) =>
        Array.isArray(field)
          ? field.map((subField: any) => subField.label)
          : field.label
      );

    if (formInput === "") {
      toast({
        description: "Doc Template Name cannot be empty",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    const shareUrl = uuidv4();

    const payload = {
      status: formStatus,
      created_user_id: session?.user?.id,
      created_user_name: session?.user?.name,
      business_number: session?.user?.business_number,
      business_name: session?.user?.business_name,
      created_date: formatDateToCustomFormat(date),
      template_name: formInput,
      users_json: selectedUsers,
      doc_json: activeFormFields,
      version_no: 1,
      data_api_url: apiEndpoint,
      content: contentData,
      // form_success_url: redirectUrl,
      // form_success_message: successMsg,
      shareurl: shareUrl,

      custom_one: nameFields,
    };

    try {
      let response;

      if (currentPath && editModeData) {
        const updatePayload = {
          ...payload,
          doc_json: activeFormFields, // Use filtered form fields
          template_name: editFormInput,
          version_no: editModeData?.version_no + 1,
        };

        response = await fetch(
          `${SAVE_DOC_TEMPLATE}?mydoc_id=eq.${currentId}`,
          {
            method: "PATCH",
            headers: headers,
            body: JSON.stringify(updatePayload),
          }
        );
      } else {
        response = await fetch(SAVE_DOC_TEMPLATE, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          toast({
            description: "Failed to save document",
            variant: "destructive",
          });
        }
        const getResponse = await fetch(
          `${SAVE_DOC_TEMPLATE}?shareurl=eq.${shareUrl}`,
          {
            method: "GET",
            headers: headers,
          }
        );

        if (!getResponse.ok) {
          toast({
            description: "Failed to fetch document id",
            variant: "destructive",
          });
        }
        const getData = await getResponse.json();

        const myDocFieldsPayload = {
          mydoc_id: getData[0].mydoc_id,
          template_name: getData[0].template_name,
          component_type: getData[0].custom_one,
        };
        const fieldResponse = await fetch(ADD_DOC_FIELDS, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(myDocFieldsPayload),
        });

        if (!fieldResponse.ok) {
          toast({
            description: "Failed to save form fields",
            variant: "destructive",
          });
          throw new Error("Failed to save form fields");
        }
      }

      setIsLoading(false);
      // toast({ description: "Doc saved successfully", variant: "default" });
      // route.push(`/doc-template/${payload.shareurl}`);

      setFormFields([]);
      setSelectedUsers([]);
      setFormInput("");
    } catch (error) {
      setIsLoading(false);
      toast({ description: "Failed to save form", variant: "destructive" });
    }
  };

  const findFieldPath = (
    fields: FormFieldOrGroup[],
    name: string
  ): number[] | null => {
    const search = (
      currentFields: FormFieldOrGroup[],
      currentPath: number[]
    ): number[] | null => {
      for (let i = 0; i < currentFields.length; i++) {
        const field = currentFields[i];
        if (Array.isArray(field)) {
          const result = search(field, [...currentPath, i]);
          if (result) return result;
        } else if (field.name === name) {
          return [...currentPath, i];
        }
      }
      return null;
    };
    return search(fields, []);
  };

  const updateFormField = (path: number[], updates: Partial<FormFieldType>) => {
    const updatedFields = JSON.parse(JSON.stringify(formFields)); // Deep clone
    let current: any = updatedFields;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = {
      ...current[path[path.length - 1]],
      ...updates,
    };
    setFormFields(updatedFields);
  };

  const openEditDialog = (field: FormFieldType) => {
    setSelectedField(field);
    setIsDialogOpen(true);
  };

  const handleSaveField = (updatedField: FormFieldType) => {
    if (selectedField) {
      const path = findFieldPath(formFields, selectedField.name);
      if (path) {
        updateFormField(path, updatedField);
      }
    }
    setIsDialogOpen(false);
  };

  console.log("currentPath-----", currentPath);

  return (
    <section className="p-2.5  space-y-8">
      <Tabs
        defaultValue={currentPath ? "edit" : viewPath ? "view" : "doc-maker"}
        className=" pt-5 pr-5 pl-5"
      >
        <div className="flex items-center justify-center">
          <TabsList
            className={`grid items-center justify-center  ${
              currentPath
                ? "grid-cols-5"
                : viewPath
                ? "grid-cols-4"
                : "grid-cols-4"
            }`}
          >
            <TabsTrigger disabled={currentPath} value="doc-maker">
              Doc Maker
            </TabsTrigger>
            <TabsTrigger disabled={currentPath} value="doc-templates">
              Doc Templates
            </TabsTrigger>
            <TabsTrigger disabled={currentPath} value="doc-response">
              Doc Response
            </TabsTrigger>
            <TabsTrigger disabled={currentPath} value="connections">
              Connections
            </TabsTrigger>
            {currentPath && <TabsTrigger value="edit">Edit</TabsTrigger>}
          </TabsList>
        </div>
        <TabsContent value="doc-maker">
          <div className="w-full min-h-screen overflow-y-auto  max-w-[950px] mx-auto md:p-4 space-y-6">
            <div className="border rounded-lg p-4 mb-8">
              <div className="flex items-center gap-4">
                <Input
                  className="text-xl font-medium border-none bg-transparent focus-visible:ring-0 p-0 h-auto placeholder:text-muted-foreground"
                  placeholder="Enter Doc name"
                  value={formInput}
                  onChange={(e) => setFormInput(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="h-5 w-5" />
                </Button>
                <Button onClick={handleSave} className="px-8">
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Version No. {1}. {"Jan 31"}
              </div>
            </div>

            <Tabs defaultValue="template" className="w-full">
              <div className="flex justify-center mb-6">
                <TabsList className="inline-flex h-10 items-center justify-center rounded-full bg-muted p-1 text-muted-foreground">
                  <TabsTrigger
                    value="template"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                  >
                    Template
                  </TabsTrigger>
                  <TabsTrigger
                    value="doc"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                  >
                    Doc
                  </TabsTrigger>

                  <TabsTrigger
                    value="json"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                  >
                    JSON
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="template">
                <>
                  <FormFieldList
                    formFields={formFields}
                    setFormFields={setFormFields}
                    updateFormField={updateFormField}
                    openEditDialog={openEditDialog}
                  />
                  <Card className="p-4 mt-5 ">
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-9"
                          placeholder="Search components"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <ScrollArea className="h-[300px]">
                        {filteredComponents.map((component, index) => (
                          <Button
                            key={component.name}
                            variant="ghost"
                            className="w-full justify-start mb-2"
                            onClick={() => addFormField(component.name, index)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            {component.name}
                          </Button>
                        ))}
                      </ScrollArea>
                    </div>
                  </Card>
                </>
              </TabsContent>
              <TabsContent value="doc">
                <div className=" w-full h-full">
                  <FormPreview
                    formFields={formFields}
                    apiFieldData={apiFieldData}
                  />
                </div>
              </TabsContent>

              <TabsContent value="json">
                <div className=" w-full h-full">
                  <If
                    condition={formFields.length > 0}
                    render={() => (
                      <pre className="p-4 text-sm bg-secondary rounded-lg h-full md:max-h-[70vh] overflow-auto">
                        {JSON.stringify(formFields, null, 2)}
                      </pre>
                    )}
                    otherwise={() => (
                      <div className="h-[50vh] flex justify-center items-center">
                        <p>No form element selected yet.</p>
                      </div>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <EditFieldDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            field={selectedField}
            onSave={handleSaveField}
            existingField={formFields.map((field: any) => field?.name)}
            setApiFieldData={setApiFieldData}
          />
        </TabsContent>
        <TabsContent value="doc-templates">
          <DocCardTemplate />
        </TabsContent>
        <TabsContent value="doc-response">
          <h1>Doc Response</h1>
        </TabsContent>
        <TabsContent value="view">
          <View />
        </TabsContent>

        <TabsContent value="connections">
          <ConnectionsNew />
        </TabsContent>
        <TabsContent value="edit">
          <div className="w-full min-h-screen overflow-y-auto  max-w-[800px] mx-auto md:p-4 space-y-6">
            <div className="border rounded-lg p-4 mb-8">
              <div className="flex items-center gap-4">
                <Input
                  className="text-xl font-medium border-none bg-transparent focus-visible:ring-0 p-0 h-auto placeholder:text-muted-foreground"
                  placeholder="Enter Doc name"
                  value={editFormInput}
                  onChange={(e) => setEditFormInput(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="h-5 w-5" />
                </Button>
                <Button onClick={handleSave} className="px-8">
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Version No. {1}. {"Jan 31"}
              </div>
            </div>

            <Tabs defaultValue="template" className="w-full">
              <div className="flex justify-center mb-6">
                <TabsList className="inline-flex h-10 items-center justify-center rounded-full bg-muted p-1 text-muted-foreground">
                  <TabsTrigger
                    value="template"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                  >
                    Template
                  </TabsTrigger>
                  <TabsTrigger
                    value="doc"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                  >
                    Doc
                  </TabsTrigger>

                  <TabsTrigger
                    value="json"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                  >
                    JSON
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="template">
                <>
                  <FormFieldList
                    formFields={formFields}
                    setFormFields={setFormFields}
                    updateFormField={updateFormField}
                    openEditDialog={openEditDialog}
                  />
                  <Card className="p-4 mt-5 ">
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-9"
                          placeholder="Search components"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <ScrollArea className="h-[300px]">
                        {filteredComponents.map((component, index) => (
                          <Button
                            key={component.name}
                            variant="ghost"
                            className="w-full justify-start mb-2"
                            onClick={() => addFormField(component.name, index)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            {component.name}
                          </Button>
                        ))}
                      </ScrollArea>
                    </div>
                  </Card>
                </>
              </TabsContent>
              <TabsContent value="doc">
                <div className=" w-full h-full">
                  <FormPreview
                    formFields={formFields}
                    apiFieldData={apiFieldData}
                  />
                </div>
              </TabsContent>

              <TabsContent value="json">
                <div className=" w-full h-full">
                  <If
                    condition={formFields.length > 0}
                    render={() => (
                      <pre className="p-4 text-sm bg-secondary rounded-lg h-full md:max-h-[70vh] overflow-auto">
                        {JSON.stringify(formFields, null, 2)}
                      </pre>
                    )}
                    otherwise={() => (
                      <div className="h-[50vh] flex justify-center items-center">
                        <p>No form element selected yet.</p>
                      </div>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <EditFieldDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            field={selectedField}
            onSave={handleSaveField}
            existingField={formFields.map((field: any) => field?.name)}
            setApiFieldData={setApiFieldData}
          />
        </TabsContent>
        <FormSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          apiEndpoint={apiEndpoint}
          setApiEndpoint={setApiEndpoint}
          setContentData={setContentData}
          editModeData={editModeData}
          setFormStatus={setFormStatus}
          setFormInput={setFormInput}
          setSuccessMsg={setSuccessMsg}
          setRedirectActionUrl={setRedirectUrl}
          formInput={formInput}
          setUsersSelected={setSelectedUsers}
        />
      </Tabs>
    </section>
  );
}
