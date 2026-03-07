"use client";

import React, { useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import TipTapMenuBar from "../ui/RichTextEditors/TipTapMenuBar";
import "../ui/RichTextEditors/tiptap-styles.css";

interface RichTextTemplateProps {
  content: string;
  onContentChange: (content: string) => void;
  readOnly?: boolean;
}

export default function RichTextTemplate({
  content,
  onContentChange,
  readOnly,
}: RichTextTemplateProps) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Placeholder.configure({
        placeholder: "Start typing...",
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Youtube.configure({
        width: 640,
        height: 360,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      CharacterCount.configure({
        limit: 50000,
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
              showFormatting={true}
              showLists={true}
              showAlignment={true}
              showTable={false}
              showMedia={true}
              showHistory={true}
            />
          )}
          <EditorContent editor={editor} />
          {editor && !readOnly && (
            <div className="text-xs text-muted-foreground p-2 border-t text-right">
              {editor.storage.characterCount.characters()} / 50000 characters
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
