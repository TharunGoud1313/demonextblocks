"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import DocsTableRowActions from "./doc-table-row-actions";

export const columns: ColumnDef<any>[] = [
  { accessorKey: "mydoc_id", header: "Doc ID" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "active"
              ? "default"
              : status === "inactive"
              ? "outline"
              : "secondary"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  { accessorKey: "created_user_name", header: "Created Name" },
  {
    accessorKey: "created_date",
    header: "Created Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_date"));
      return date.toLocaleDateString();
    },
  },
  { accessorKey: "template_name", header: "Template" },
  //   { accessorKey: "share_url", header: "Share URL" },
  { accessorKey: "version_no", header: "Version" },
  { accessorKey: "doc_publish_url", header: "Doc URL" },
  //   { accessorKey: "business_number", header: "Business Number" },
  //   { accessorKey: "created_user_name", header: "User Name" },
  //   {
  //     accessorKey: "form_json",
  //     header: "Form Fields",
  //     cell: ({ row }) => {
  //       const formJson = row.getValue("form_json") as any[];
  //       return (
  //         <div>
  //           {formJson.map((field, index) => (
  //             <div key={index}>
  //               {field.label}: {field.variant}
  //             </div>
  //           ))}
  //         </div>
  //       );
  //     },
  //   },
  {
    id: "actions",
    cell: ({ row }) => {
      const docId = row.getValue("doc_id") as string;
      const docPublishUrl = row.getValue("doc_publish_url") as string;
      const versionNo = row.getValue("version_no") as string;
      const createdUserName = row.getValue("created_user_name") as string;
      return (
        <DocsTableRowActions
          docId={docId}
          docPublishUrl={docPublishUrl}
          versionNo={versionNo}
          createdUserName={createdUserName}
        />
      );
    },
  },
];
