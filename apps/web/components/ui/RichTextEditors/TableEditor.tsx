"use client";

import React, { useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import TipTapMenuBar from "./TipTapMenuBar";
import "./tiptap-styles.css";

interface TableEditorProps {
  content?: string;
  onContentChange?: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export default function TableEditor({
  content = "",
  onContentChange,
  readOnly = false,
  placeholder = "Click the table button to insert a table...",
}: TableEditorProps) {
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
        placeholder,
      }),
    ],
    [placeholder],
  );

  const editor = useEditor({
    extensions,
    content,
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none",
      },
    },
  });

  return (
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
  );
}
