import { MY_DOC_LIST } from "@/constants/envConfig";
import React, { useEffect, useState } from "react";
import { toast } from "../ui/use-toast";
import {
  Calendar,
  Edit,
  Eye,
  File,
  Loader,
  Search,
  Share,
  Share2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Session } from "../doc-template/DocTemplate";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import Link from "next/link";

const MyDocList = () => {
  const [docList, setDocList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

  useEffect(() => {
    const fetchDocList = async () => {
      setIsLoading(true);
      const response = await fetch(MY_DOC_LIST, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      });
      if (!response.ok) {
        toast({
          description: "Error fetching Doc List",
          variant: "destructive",
        });
      }
      const data = await response.json();
      const filteredData = data.filter(
        (item: any) => item.business_number === session?.user?.business_number
      );
      setDocList(filteredData);
      setIsLoading(false);
    };
    fetchDocList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="flex w-full mb-4 gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="pl-10 text-md"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center">
          <Loader className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-4 w-full">
          {docList
            .filter((doc: any) =>
              doc.doc_name.toLowerCase().includes(search.toLowerCase())
            )
            .map((doc: any) => (
              <Card key={doc.mydoc_list_id} className="py-2 px-2">
                <CardContent className="space-y-[10px] px-2 py-2">
                  <h2 className="font-semibold text-md">{doc.doc_name}</h2>
                  <p className="text-md text-muted-foreground">
                    {doc.doc_group}
                  </p>
                  <p className="flex items-center gap-2 text-md">
                    <span>Doc No: {doc.doc_no}</span>
                  </p>
                  <p className="flex items-center gap-2 text-md">
                    <span>Version No: {doc.version_no}</span>
                  </p>
                  <p className="flex items-center gap-2 text-md">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>
                      {new Date(doc.created_date).toLocaleDateString()}
                    </span>
                  </p>
                  <div className="flex justify-end gap-2.5">
                    <Link href={`/myDocs/view/${doc.mydoc_list_id}`}>
                      <Eye className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                    </Link>
                    <Link href={`/myDocs/edit/${doc.mydoc_list_id}`}>
                      <Edit className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                    </Link>
                    <Link href={`/myDocs/share/${doc.mydoc_list_id}`}>
                      <Share2 className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default MyDocList;
