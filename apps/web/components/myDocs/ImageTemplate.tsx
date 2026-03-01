"use client";

import React, { useState, useMemo } from "react";

import RcTiptapEditor from "reactjs-tiptap-editor";
import { BaseKit, Image } from "reactjs-tiptap-editor";

import "katex/dist/katex.min.css";

import "reactjs-tiptap-editor/style.css";
import { toast } from "../ui/use-toast";

function convertBase64ToBlob(base64: string) {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

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
  const refEditor = React.useRef<any>(null);

  const [theme, setTheme] = useState("light");

  const extensions = useMemo(
    () => [
      BaseKit.configure({
        multiColumn: true,
        placeholder: {
          showOnlyCurrent: true,
        },
        characterCount: {
          limit: 50_000,
        },
      }),
      Image.configure({
        upload: (files: File) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(URL.createObjectURL(files));
            }, 500);
          });
        },
      }),
    ],
    [],
  );

  return (
    <main className="">
      <div className="max-w-[1024px] mx-auto">
        <RcTiptapEditor
          //   ref={refEditor}
          output="html"
          content={content}
          onChangeContent={onContentChange}
          extensions={extensions}
          dark={theme === "dark"}
          disabled={readOnly}
          //   disabled={disable}
        />
      </div>
    </main>
  );
}
