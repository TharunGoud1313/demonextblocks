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
  PLAN_API,
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

const NewTask = ({
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
  const [taskGroup, setTaskGroup] = React.useState<any[]>([]);
  const [planName, setPlanName] = React.useState<any[]>([]);
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

  const [formData, setFormData] = React.useState({
    taskTitle: "",
    taskGroup: "",
    planName: "",
    planId: "",
    description: "",
    start: "",
    end: "",
    actualStart: "",
    actualEnd: "",
    status: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        taskTitle: data.task_title,
        taskGroup: data.task_group,
        planId: data.plan_id,
        planName: data.plan_name,
        description: data.task_description,
        start: data.plan_start_date,
        end: data.plan_end_date,
        actualStart: data.actual_start_date,
        actualEnd: data.actual_end_date,
        status: data.status,
      });
    }
  }, [data]);

  useEffect(() => {
    const fetchPlanName = async () => {
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

      const filteredData = data.filter(
        (item: any) => item.business_number === session?.user?.business_number
      );
      setPlanName(filteredData);
    };
    fetchPlanName();
  }, [session]);

  useEffect(() => {
    const fetchTaskGroup = async () => {
      const response = await fetch(TASK_GROUP_API, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      });
      if (!response.ok) {
        toast({
          description: "Failed to fetch task group",
          variant: "destructive",
        });
        return;
      }
      const data = await response.json();
      setTaskGroup(data);
    };
    fetchTaskGroup();
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

    const fields = [
      "taskTitle",
      "taskGroup",
      "description",
      "start",
      "end",
      "status",
    ];

    fields.forEach((field) => {
      if (
        !formData[field as keyof typeof formData] ||
        formData[field as keyof typeof formData].trim() === ""
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
      task_title: formData.taskTitle,
      task_group: formData.taskGroup,
      plan_name: formData.planName,
      plan_id: formData.planId,
      task_description: formData.description,
      plan_start_date: formData.start,
      plan_end_date: formData.end,
      ...(formData.actualStart && { actual_start_date: formData.actualStart }),
      ...(formData.actualEnd && { actual_end_date: formData.actualEnd }),
      status: formData.status,
      created_user_id: session?.user?.id,
      created_user_name: session?.user?.name,
      business_name: session?.user?.business_name,
      business_number: session?.user?.business_number,
    };
    const response = await fetch(
      isEdit ? `${TASKS_API}?task_id=eq.${data.task_id}` : TASKS_API,

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
          ? "Task updated successfully"
          : "Task created successfully",
        variant: "default",
      });

      setFormData({
        taskTitle: "",
        taskGroup: "",
        planName: "",
        planId: "",
        description: "",
        start: "",
        end: "",
        actualStart: "",
        actualEnd: "",
        status: "",
      });
      //   router.push("/contacts");
    } else {
      setIsLoading(false);
      toast({
        description: isEdit
          ? "Failed to updated Task"
          : "Failed to create Task",
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
              {isEdit ? "Edit Task" : isView ? "View Task" : "Add New Task"}
            </h1>
            <Link href="/Tasks">
              <Button variant={"outline"} className="border-0">
                Back to Tasks
              </Button>
            </Link>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="taskTitle">
                  Task Title <span className="text-red-500">*</span>
                </Label>
                {errors.taskTitle && (
                  <p className="text-red-500 text-sm">{errors.taskTitle}</p>
                )}
              </div>
              <Input
                id="taskTitle"
                placeholder="Enter Task Title"
                readOnly={isView}
                onChange={handleChange}
                value={formData.taskTitle}
                className={errors.taskTitle ? "border-red-500" : ""}
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="planName">Plan Name</Label>
                {errors.planName && (
                  <p className="text-red-500 text-sm">{errors.planName}</p>
                )}
              </div>

              <Select
                disabled={isView}
                value={formData.planName}
                onValueChange={(value) => {
                  const selectedPlan = planName.find(
                    (item: any) => item.plan_name === value
                  );
                  handleSelectChange(value, "planName");
                  if (selectedPlan) {
                    handleSelectChange(
                      selectedPlan.plan_id.toString(),
                      "planId"
                    );
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Plan Name" />
                </SelectTrigger>

                <SelectContent>
                  {planName.map((item: any) => (
                    <SelectItem key={item.plan_id} value={item.plan_name}>
                      {item.plan_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="taskGroup">
                  Task Group <span className="text-red-500">*</span>
                </Label>
                {errors.taskGroup && (
                  <p className="text-red-500 text-sm">{errors.taskGroup}</p>
                )}
              </div>
              <Select
                disabled={isView}
                value={formData.taskGroup}
                onValueChange={(value) =>
                  handleSelectChange(value, "taskGroup")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Task Group" />
                </SelectTrigger>

                <SelectContent>
                  {taskGroup.map((item: any) => (
                    <SelectItem
                      key={item.task_group_id}
                      value={item.task_group}
                    >
                      {item.task_group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* <div>
              <div className="flex justify-between">
                <Label htmlFor="planName">
                  Plan Name <span className="text-red-500">*</span>
                </Label>

                {errors.planName && (
                  <p className="text-red-500 text-sm">{errors.planName}</p>
                )}
              </div>
              <Input
                id="planName"
                placeholder="Enter Plan Name"
                readOnly={isView}
                onChange={handleChange}
                value={formData.planName}
                className={errors.planName ? "border-red-500" : ""}
              />
            </div> */}
            <div>
              <div className="flex justify-between">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>

                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>

              <Input
                id="description"
                placeholder="Enter Description"
                readOnly={isView}
                onChange={handleChange}
                value={formData.description}
                className={errors.description ? "border-red-500" : ""}
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="start">
                  Start Date <span className="text-red-500">*</span>
                </Label>

                {errors.start && (
                  <p className="text-red-500 text-sm">{errors.start}</p>
                )}
              </div>
              <div className="w-full">
                <CalendarDatePicker
                  date={formData.start ? new Date(formData.start) : undefined}
                  onDateSelect={(date) => handleFromDateSelect(date, "start")}
                  placeholder="Start Date"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="end">
                  End Date <span className="text-red-500">*</span>
                </Label>
                {errors.end && (
                  <p className="text-red-500 text-sm">{errors.end}</p>
                )}
              </div>
              <CalendarDatePicker
                date={formData.end ? new Date(formData.end) : undefined}
                onDateSelect={(date) => handleFromDateSelect(date, "end")}
                placeholder="End Date"
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="actualStart">Actual Start Date</Label>

                {errors.actualStart && (
                  <p className="text-red-500 text-sm">{errors.actualStart}</p>
                )}
              </div>

              <CalendarDatePicker
                date={
                  formData.actualStart
                    ? new Date(formData.actualStart)
                    : undefined
                }
                onDateSelect={(date) =>
                  handleFromDateSelect(date, "actualStart")
                }
                placeholder="Actual Start Date"
              />
            </div>

            <div>
              <div className="flex justify-between">
                <Label htmlFor="actualEnd">Actual End Date</Label>

                {errors.actualEnd && (
                  <p className="text-red-500 text-sm">{errors.actualEnd}</p>
                )}
              </div>
              <CalendarDatePicker
                date={
                  formData.actualEnd ? new Date(formData.actualEnd) : undefined
                }
                onDateSelect={(date) => handleFromDateSelect(date, "actualEnd")}
                placeholder="Actual End Date"
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
                  onClick={() => router.push("/Tasks")}
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

export default NewTask;
