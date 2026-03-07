"use client";

import React, { useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import TipTapMenuBar from "../ui/RichTextEditors/TipTapMenuBar";
import "../ui/RichTextEditors/tiptap-styles.css";

interface TableTemplateProps {
  content: string;
  onContentChange: (content: string) => void;
  readOnly?: boolean;
}

export default function TableTemplate({
  content,
  onContentChange,
  readOnly,
}: TableTemplateProps) {
  const extensions = useMemo(
    () => [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({
        placeholder: "Click the table button to insert a table...",
      }),
    ],
    [],
  );

  const editor = useEditor({
    extensions,
    content,
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none",
      },
    },
  });

  return (
    <main className="">
      <div className="max-w-[1024px] mx-auto">
        <div className="tiptap-editor">
          {!readOnly && (
            <TipTapMenuBar
              editor={editor}
              showHeadings={false}
              showFormatting={true}
              showLists={false}
              showAlignment={false}
              showTable={true}
              showMedia={false}
              showHistory={true}
            />
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
    </main>
  );
}
