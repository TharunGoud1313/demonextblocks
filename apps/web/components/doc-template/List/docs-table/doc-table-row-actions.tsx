import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import React from "react";

interface DocsTableRowProps {
  docId: string;
  docPublishUrl: string;
  versionNo: string;
  createdUserName: string;
}

const DocsTableRowActions = ({
  docId,
  docPublishUrl,
  versionNo,
  createdUserName,
}: DocsTableRowProps) => {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>View Doc</DropdownMenuItem>
          <Link href={`/form_maker/edit/${docId}`}>
            <DropdownMenuItem>Edit Doc</DropdownMenuItem>
          </Link>
          {/* <a href={`/submit/${docPublishUrl}`} target="_blank">
            <DropdownMenuItem>View Doc</DropdownMenuItem>
          </a>
          <Link href={`/form_maker/view/${docId}`}>
            <DropdownMenuItem>View Doc</DropdownMenuItem>
          </Link> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DocsTableRowActions;
