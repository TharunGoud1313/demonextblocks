/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import { AgentFieldType, FormFieldType } from "@/types";
import { defaultFieldConfig } from "@/constants";
import If from "../ui/if";
import { FormFieldList } from "./FormFieldList";
import { FormPreview } from "./FormPreview";
import { EditFieldDialog } from "./EditFieldDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import List from "./List/List";
import { ConnectionTable } from "./connections";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  ADD_CONNECTIONS,
  NEXT_PUBLIC_API_KEY,
  SAVE_FORM_DATA,
  SAVE_FORM_FIELDS,
} from "@/constants/envConfig";
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "../ui/use-toast";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import View from "./View/View";
import { Plus, Search, Settings } from "lucide-react";
import { FormSettingsModal } from "./form-settings-modal";
import { fieldTypes } from "@/constants/agentIndex";

import { ChatForm } from "./ChatPreview";
import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { ChatWithDB } from "./ChatWithData";
import AgentsList from "./AgentsList";
import ConnectionsNew from "./Connections/ConnectionsNew";
import axiosInstance from "@/utils/axiosInstance";

export interface Session {
  user: {
    name: string;
    email: string;
    id: string | number;
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

export default function FormBuilder() {
  return (
    <section className="p-2.5 space-y-8">
      <Tabs defaultValue="agents" className="pt-5 pr-5 pl-5">
        <div className="flex items-center justify-center">
          <TabsList className="grid items-center justify-center md:w-[400px] grid-cols-2">
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="agents">
          <AgentsList />
        </TabsContent>
        <TabsContent value="connections">
          <ConnectionsNew />
        </TabsContent>
      </Tabs>
    </section>
  );
}
