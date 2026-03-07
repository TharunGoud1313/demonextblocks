"use client";

import React, { useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Placeholder from "@tiptap/extension-placeholder";
import TipTapMenuBar from "./TipTapMenuBar";
import "./tiptap-styles.css";

interface HeadingEditorProps {
  content?: string;
  onContentChange?: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export default function HeadingEditor({
  content = "",
  onContentChange,
  readOnly = false,
  placeholder = "Start typing your heading...",
}: HeadingEditorProps) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
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
          showHeadings={true}
          showFormatting={false}
          showLists={false}
          showAlignment={false}
          showTable={false}
          showMedia={false}
          showHistory={true}
        />
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
