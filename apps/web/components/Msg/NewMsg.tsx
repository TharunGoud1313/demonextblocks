"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  GET_CONTACTS_API,
  MESSAGES_API,
  MSG_GROUP_API,
  MY_DOC_LIST,
  PLAN_API,
  PLAN_GROUP_API,
  PLAN_PHASE_API,
  TASK_GROUP_API,
  TASKS_API,
} from "@/constants/envConfig";
import { countries, states } from "@/lib/country-state-data";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { CalendarDatePicker } from "../ui/calendar-date-picker";
import { DateTimePicker } from "../ui/DateTimePicker";
import { DatetimePicker } from "../ui/datetime-picker";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Session } from "../doc-template/DocTemplate";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "../ui/multi-select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ChevronDown } from "lucide-react";
import { Command, CommandGroup, CommandItem } from "../ui/command";
import { Checkbox } from "../ui/checkbox";

interface FormData {
  date: string;
  plan: string;
  phase: string;
  taskTitle: string;
  docName: string;
  msgGroup: string;
  to: string;
  cc: string | string[];
  subject: string;
  body: string;
  status: string;
}

const NewMsg = ({
  data,
  isEdit = false,
  isView = false,
}: {
  data?: any;
  isEdit?: boolean;
  isView?: boolean;
}) => {
  const router = useRouter();
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [plan, setPlan] = React.useState<any[]>([]);
  const [phase, setPhase] = React.useState<any[]>([]);
  const [taskTitle, setTaskTitle] = React.useState<any[]>([]);
  const [docName, setDocName] = React.useState<any[]>([]);
  const [msgGroup, setMsgGroup] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

  const [formData, setFormData] = React.useState<FormData>({
    date: "",
    plan: "",
    phase: "",
    taskTitle: "",
    docName: "",
    msgGroup: "",
    to: "",
    cc: [],
    subject: "",
    body: "",
    status: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        date: data.created_date,
        plan: data.plan_name,
        phase: data.plan_phase_name,
        taskTitle: data.task_title,
        docName: data.mydoc_name,
        msgGroup: data.msg_group,
        to: data.msg_to,
        cc: data.msg_cc,
        subject: data.msg_subject,
        body: data.msg_description,
        status: data.status,
      });
    }
  }, [data]);

  useEffect(() => {
    const fetchPlans = async () => {
      const response = await fetch(PLAN_API, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      });
      if (!response.ok) {
        toast({
          description: "Failed to fetch plan name",
          variant: "destructive",
        });
        return;
      }
      const data = await response.json();
      setPlan(data);
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchPlanPhase = async () => {
      const response = await fetch(PLAN_PHASE_API, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      });
      if (!response.ok) {
        toast({
          description: "Failed to fetch plan group",
          variant: "destructive",
        });
        return;
      }
      const data = await response.json();
      setPhase(data);
    };
    fetchPlanPhase();
  }, []);

  useEffect(() => {
    const fetchTaskTitle = async () => {
      const response = await fetch(TASKS_API, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      });
      if (!response.ok) {
        toast({
          description: "Failed to fetch plan group",
          variant: "destructive",
        });
        return;
      }
      const data = await response.json();
      setTaskTitle(data);
    };
    fetchTaskTitle();
  }, []);

  useEffect(() => {
    const fetchDocName = async () => {
      const response = await fetch(MY_DOC_LIST, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      });
      if (!response.ok) {
        toast({
          description: "Failed to fetch plan group",
          variant: "destructive",
        });
        return;
      }
      const data = await response.json();
      setDocName(data);
    };
    fetchDocName();
  }, []);

  useEffect(() => {
    const fetchMsgGroup = async () => {
      const response = await fetch(MSG_GROUP_API, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      });
      if (!response.ok) {
        toast({
          description: "Failed to fetch plan group",
          variant: "destructive",
        });
        return;
      }
      const data = await response.json();
      setMsgGroup(data);
    };
    fetchMsgGroup();
  }, []);

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
        toast({
          description: "Failed to fetch plan group",
          variant: "destructive",
        });
        return;
      }
      const data = await response.json();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleFromDateSelect = (date: Date | undefined, field: string) => {
    if (date) {
      setFormData((prev) => ({ ...prev, [field]: date.toISOString() }));
    }
  };

  const validateForm = () => {
    let newErrors: Record<string, string> = {};

    const fields = ["date", "msgGroup", "to", "subject", "body", "status"];

    fields.forEach((field) => {
      if (
        !formData[field as keyof typeof formData] ||
        (Array.isArray(formData[field as keyof typeof formData]) &&
          formData[field as keyof typeof formData].length === 0)
      ) {
        newErrors[field] = "Required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    const payload = {
      plan_id: plan.find((item) => item.plan_name === formData.plan)?.plan_id,
      plan_name: formData.plan,
      plan_phase_id: phase.find(
        (item) => item.plan_phase_name === formData.phase
      )?.plan_phase_id,
      plan_phase_name: formData.phase,
      task_id: taskTitle.find((item) => item.task_title === formData.taskTitle)
        ?.task_id,
      task_title: formData.taskTitle,
      mydoc_list_id: docName.find((item) => item.doc_name === formData.docName)
        ?.mydoc_list_id,

      mydoc_name: formData.docName,
      msg_group: formData.msgGroup,
      msg_to: formData.to,
      msg_cc: formData.cc,
      msg_subject: formData.subject,
      msg_description: formData.body,
      status: formData.status,
      // ...(formData.actualEnd && { actual_end_date: formData.actualEnd }),
      created_user_id: session?.user?.id,
      created_date: formData.date,
      created_user_name: session?.user?.name,
      business_name: session?.user?.business_name,
      business_number: session?.user?.business_number,
    };
    const response = await fetch(
      isEdit ? `${MESSAGES_API}?msg_id=eq.${data.msg_id}` : MESSAGES_API,

      {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    );
    if (response.ok) {
      setIsLoading(false);
      toast({
        description: isEdit
          ? "Msg updated successfully"
          : "Msg created successfully",
        variant: "default",
      });

      setFormData({
        date: "",
        plan: "",
        phase: "",
        taskTitle: "",
        docName: "",
        msgGroup: "",
        to: "",
        cc: [],
        subject: "",
        body: "",
        status: "",
      });
    } else {
      setIsLoading(false);
      toast({
        description: isEdit ? "Failed to updated Msg" : "Failed to create Msg",
        variant: "destructive",
      });
    }
  };

  const handleSelectChange = (value: string, field: string) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  return (
    <div className="w-full max-w-[800px] mx-auto md:p-4 p-2">
      <Card className="border-0 p-0 m-0 md:border md:p-2 md:m-4">
        <CardContent className="px-1.5 py-1.5">
          <div className="flex justify-between mb-6 items-center">
            <h1 className="text-2xl font-bold">
              {isEdit ? "Edit Msg" : isView ? "View Msg" : "Add New Msg"}
            </h1>
            <Link href="/Msg">
              <Button variant={"outline"} className="border-0">
                Back to Msg
              </Button>
            </Link>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="date">
                  Date <span className="text-red-500">*</span>
                </Label>

                {errors.date && (
                  <p className="text-red-500 text-sm">{errors.date}</p>
                )}
              </div>
              <div className="w-full">
                <CalendarDatePicker
                  date={formData.date ? new Date(formData.date) : undefined}
                  onDateSelect={(date) => handleFromDateSelect(date, "date")}
                  placeholder="Date"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between">
                <Label htmlFor="project">Project</Label>
                {errors.plan && (
                  <p className="text-red-500 text-sm">{errors.plan}</p>
                )}
              </div>

              <Select
                disabled={isView}
                value={formData.plan}
                onValueChange={(value) => handleSelectChange(value, "plan")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Plan " />
                </SelectTrigger>

                <SelectContent>
                  {plan.map((item: any) => (
                    <SelectItem key={item.plan_id} value={item.plan_name}>
                      {item.plan_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex justify-between">
                <Label htmlFor="planPhase">Phase</Label>
                {errors.phase && (
                  <p className="text-red-500 text-sm">{errors.phase}</p>
                )}
              </div>

              <Select
                disabled={isView}
                value={formData.phase}
                onValueChange={(value) => handleSelectChange(value, "phase")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Phase" />
                </SelectTrigger>

                <SelectContent>
                  {phase.map((item: any) => (
                    <SelectItem
                      key={item.plan_phase_id}
                      value={item.plan_phase_name}
                    >
                      {item.plan_phase_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="taskTitle">Task Title</Label>
                {errors.taskTitle && (
                  <p className="text-red-500 text-sm">{errors.taskTitle}</p>
                )}
              </div>

              <Select
                disabled={isView}
                value={formData.taskTitle}
                onValueChange={(value) =>
                  handleSelectChange(value, "taskTitle")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Plan Group" />
                </SelectTrigger>

                <SelectContent>
                  {taskTitle.map((item: any) => (
                    <SelectItem key={item.task_id} value={item.task_title}>
                      {item.task_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="docName">Doc Name</Label>
                {errors.docName && (
                  <p className="text-red-500 text-sm">{errors.docName}</p>
                )}
              </div>

              <Select
                disabled={isView}
                value={formData.docName}
                onValueChange={(value) => handleSelectChange(value, "docName")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Doc Name" />
                </SelectTrigger>

                <SelectContent>
                  {docName.map((item: any) => (
                    <SelectItem key={item.mydoc_list_id} value={item.doc_name}>
                      {item.doc_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="msgGroup">
                  Msg Group <span className="text-red-500">*</span>
                </Label>
                {errors.msgGroup && (
                  <p className="text-red-500 text-sm">{errors.msgGroup}</p>
                )}
              </div>

              <Select
                disabled={isView}
                value={formData.msgGroup}
                onValueChange={(value) => handleSelectChange(value, "msgGroup")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Msg Group" />
                </SelectTrigger>

                <SelectContent>
                  {msgGroup.map((item: any) => (
                    <SelectItem key={item.msg_group_id} value={item.msg_group}>
                      {item.msg_group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="subject">
                  Subject <span className="text-red-500">*</span>
                </Label>

                {errors.subject && (
                  <p className="text-red-500 text-sm">{errors.subject}</p>
                )}
              </div>

              <Input
                id="subject"
                placeholder="Enter Subject"
                readOnly={isView}
                onChange={handleChange}
                value={formData.subject}
                className={errors.subject ? "border-red-500" : ""}
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="to">
                  To <span className="text-red-500">*</span>
                </Label>

                {errors.to && (
                  <p className="text-red-500 text-sm">{errors.to}</p>
                )}
              </div>

              <Select
                disabled={isView}
                value={formData.to}
                onValueChange={(value) => handleSelectChange(value, "to")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select: To" />
                </SelectTrigger>

                <SelectContent>
                  {users.map((item: any) => (
                    <SelectItem
                      key={item.user_catalog_id}
                      value={item.user_email}
                    >
                      {item.user_email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="cc">CC</Label>
                {errors.cc && (
                  <p className="text-red-500 text-sm">{errors.cc}</p>
                )}
              </div>
              <MultiSelector
                values={
                  Array.isArray(formData.cc)
                    ? formData.cc
                    : typeof formData.cc === "string" && formData.cc
                    ? formData?.cc?.split(",")
                    : []
                }
                onValuesChange={(values: string[]) =>
                  handleSelectChange(values.join(","), "cc")
                }
              >
                <MultiSelectorTrigger>
                  <MultiSelectorInput placeholder="Select: CC" />
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
            <div>
              <div className="flex justify-between">
                <Label htmlFor="body">
                  Body <span className="text-red-500">*</span>
                </Label>

                {errors.body && (
                  <p className="text-red-500 text-sm">{errors.body}</p>
                )}
              </div>

              <Input
                id="body"
                placeholder="Enter Body"
                readOnly={isView}
                onChange={handleChange}
                value={formData.body}
                className={errors.body ? "border-red-500" : ""}
              />
            </div>

            <div>
              <div className="flex justify-between">
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                {errors.status && (
                  <p className="text-red-500 text-sm">{errors.status}</p>
                )}
              </div>
              <Select
                disabled={isView}
                value={formData.status}
                onValueChange={(value) => handleSelectChange(value, "status")}
              >
                <SelectTrigger
                  className={errors.status ? "border-red-500" : ""}
                  id="status"
                >
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="InActive">InActive</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!isView && (
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/Msg")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewMsg;
