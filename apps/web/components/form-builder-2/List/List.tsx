"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NEXT_PUBLIC_API_KEY, SAVE_FORM_DATA } from "@/constants/envConfig";
import { Session } from "../FormBuilder";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  File,
  ClipboardCheck,
  Edit,
  Eye,
  Calendar,
  Code,
} from "lucide-react";

function Loading() {
  return <div>Loading...</div>;
}

function ErrorDisplay({ error }: { error: Error }) {
  return <div>Error: {error.message}</div>;
}

export default function FormsList() {
  const [apiData, setApiData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [search, setSearch] = useState<string>("");
  const { data: sessionData } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const response = await fetch(SAVE_FORM_DATA, {
          headers: {
            Authorization: `Bearer ${NEXT_PUBLIC_API_KEY}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch API data");
        }
        const data = await response.json();
        const filteredData = data.filter(
          (item: any) => item.business_number === session?.user?.business_number
        );
        setApiData(filteredData);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApiData();
  }, [session]);

  // Filter data based on search term
  const filteredData = apiData.filter((item) => {
    const searchTerm = search.toLowerCase();
    return (
      item.form_name?.toLowerCase().includes(searchTerm) ||
      item.form_id?.toString().includes(searchTerm) ||
      item.created_user_name?.toLowerCase().includes(searchTerm)
    );
  });

  // Function to parse and extract field data from custom_one
  const getFormFields = (item: any) => {
    try {
      if (item.custom_one) {
        const fields = JSON.parse(item.custom_one);
        return Array.isArray(fields) ? fields : [];
      }
    } catch (error) {
      console.error("Error parsing form fields:", error);
    }
    return [];
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="flex flex-col max-w-[800px] mx-auto justify-center gap-4 w-full items-center">
      <div className="flex w-full mt-4 gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search forms"
            className="pl-10 text-md"
          />
        </div>
        <Link href="/form-builder-2">
          <Button size={"icon"}>
            <Plus className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="w-full space-y-4">
        {filteredData.map((item) => (
          <Card key={item.form_id} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-xl">
                    {item.form_name || "Untitled Form"}
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Code className="h-5 w-5" />
                  <span>Form ID: {item.form_id}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>
                    Created:{" "}
                    {new Date(
                      item.created_at || Date.now()
                    ).toLocaleDateString()}
                  </span>
                </div>

                {getFormFields(item).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {getFormFields(item)
                      .slice(0, 5)
                      .map((field: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {field}
                        </Badge>
                      ))}
                    {getFormFields(item).length > 5 && (
                      <Badge variant="outline">
                        +{getFormFields(item).length - 5} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Created by: {item.created_user_name || "Unknown"}
                  </span>
                  <div className="flex items-center gap-3">
                    <Link href={`/form-builder-2`}>
                      <File className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                    </Link>
                    <ClipboardCheck className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                    <Link href={`/form_maker/edit/${item.form_id}`}>
                      <Edit className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    </Link>
                    <Link href={`/form_maker/view/${item.form_id}`}>
                      <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredData.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              No forms found. Create a new form to get started.
            </p>
            <Button
              onClick={() => router.push("/form-builder-2")}
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Form
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
