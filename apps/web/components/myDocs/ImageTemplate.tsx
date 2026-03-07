"use client";

import React, { useMemo, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "../ui/button";
import { ImageIcon, Upload } from "lucide-react";
import "../ui/RichTextEditors/tiptap-styles.css";

interface ImageTemplateProps {
  content: string;
  onContentChange: (content: string) => void;
  readOnly?: boolean;
}

export default function ImageTemplate({
  content,
  onContentChange,
  readOnly,
}: ImageTemplateProps) {
  const extensions = useMemo(
    () => [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: "Click to add an image...",
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

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && editor) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          editor.chain().focus().setImage({ src: result }).run();
        };
        reader.readAsDataURL(file);
      }
    },
    [editor],
  );

  return (
    <main className="">
      <div className="max-w-[1024px] mx-auto">
        <div className="tiptap-editor">
          {!readOnly && (
            <div className="flex gap-2 p-2 border-b bg-muted/50 rounded-t-md">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImage}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Add Image URL
              </Button>
              <label>
                <Button type="button" variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
    </main>
  );
}
