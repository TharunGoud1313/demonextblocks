"use client";

import React, { useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Placeholder from "@tiptap/extension-placeholder";
import TipTapMenuBar from "../ui/RichTextEditors/TipTapMenuBar";
import "../ui/RichTextEditors/tiptap-styles.css";

interface HeadingTemplateProps {
  content: string;
  onContentChange: (content: string) => void;
  readOnly?: boolean;
}

export default function HeadingTemplate({
  content,
  onContentChange,
  readOnly,
}: HeadingTemplateProps) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Placeholder.configure({
        placeholder: "Start typing your heading...",
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
      </div>
    </main>
  );
}
