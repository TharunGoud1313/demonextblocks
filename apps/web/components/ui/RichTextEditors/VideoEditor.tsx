"use client";

import React, { useMemo, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "../button";
import { Youtube as YoutubeIcon } from "lucide-react";
import "./tiptap-styles.css";

interface VideoEditorProps {
  content?: string;
  onContentChange?: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export default function VideoEditor({
  content = "",
  onContentChange,
  readOnly = false,
  placeholder = "Click to add a YouTube video...",
}: VideoEditorProps) {
  const extensions = useMemo(
    () => [
      StarterKit,
      Youtube.configure({
        width: 640,
        height: 360,
        nocookie: true,
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

  const addYouTubeVideo = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("YouTube URL");
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  }, [editor]);

  return (
    <div className="tiptap-editor">
      {!readOnly && (
        <div className="flex gap-2 p-2 border-b bg-muted/50 rounded-t-md">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addYouTubeVideo}
          >
            <YoutubeIcon className="h-4 w-4 mr-2" />
            Add YouTube Video
          </Button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
