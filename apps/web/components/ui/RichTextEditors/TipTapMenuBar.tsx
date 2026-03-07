"use client";

import { Editor } from "@tiptap/react";
import { Button } from "../button";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Table,
  Image,
  Youtube,
  Minus,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../tooltip";
import { useCallback } from "react";

interface TipTapMenuBarProps {
  editor: Editor | null;
  showHeadings?: boolean;
  showFormatting?: boolean;
  showLists?: boolean;
  showAlignment?: boolean;
  showTable?: boolean;
  showMedia?: boolean;
  showHistory?: boolean;
}

interface MenuButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}

function MenuButton({
  onClick,
  isActive,
  disabled,
  tooltip,
  children,
}: MenuButtonProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", isActive && "bg-muted text-primary")}
            onClick={onClick}
            disabled={disabled}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function TipTapMenuBar({
  editor,
  showHeadings = true,
  showFormatting = true,
  showLists = true,
  showAlignment = false,
  showTable = false,
  showMedia = false,
  showHistory = true,
}: TipTapMenuBarProps) {
  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addYouTubeVideo = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("YouTube URL");
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-toolbar flex flex-wrap gap-1 p-2 border-b bg-muted/50 rounded-t-md">
      {showHistory && (
        <>
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            tooltip="Undo"
          >
            <Undo className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            tooltip="Redo"
          >
            <Redo className="h-4 w-4" />
          </MenuButton>
          <div className="w-px h-6 bg-border mx-1" />
        </>
      )}

      {showHeadings && (
        <>
          <MenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            isActive={editor.isActive("heading", { level: 1 })}
            tooltip="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive("heading", { level: 2 })}
            tooltip="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            isActive={editor.isActive("heading", { level: 3 })}
            tooltip="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </MenuButton>
          <div className="w-px h-6 bg-border mx-1" />
        </>
      )}

      {showFormatting && (
        <>
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            tooltip="Bold"
          >
            <Bold className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            tooltip="Italic"
          >
            <Italic className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            tooltip="Underline"
          >
            <Underline className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            tooltip="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
            tooltip="Inline Code"
          >
            <Code className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive("highlight")}
            tooltip="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={setLink}
            isActive={editor.isActive("link")}
            tooltip="Link"
          >
            <Link className="h-4 w-4" />
          </MenuButton>
          <div className="w-px h-6 bg-border mx-1" />
        </>
      )}

      {showLists && (
        <>
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            tooltip="Bullet List"
          >
            <List className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            tooltip="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive("taskList")}
            tooltip="Task List"
          >
            <CheckSquare className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            tooltip="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            tooltip="Horizontal Rule"
          >
            <Minus className="h-4 w-4" />
          </MenuButton>
          <div className="w-px h-6 bg-border mx-1" />
        </>
      )}

      {showAlignment && (
        <>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            tooltip="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            tooltip="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            tooltip="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            isActive={editor.isActive({ textAlign: "justify" })}
            tooltip="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </MenuButton>
          <div className="w-px h-6 bg-border mx-1" />
        </>
      )}

      {showTable && (
        <>
          <MenuButton onClick={insertTable} tooltip="Insert Table">
            <Table className="h-4 w-4" />
          </MenuButton>
          {editor.isActive("table") && (
            <>
              <MenuButton
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                tooltip="Add Column"
              >
                <span className="text-xs font-semibold">+Col</span>
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().addRowAfter().run()}
                tooltip="Add Row"
              >
                <span className="text-xs font-semibold">+Row</span>
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().deleteColumn().run()}
                tooltip="Delete Column"
              >
                <span className="text-xs font-semibold">-Col</span>
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().deleteRow().run()}
                tooltip="Delete Row"
              >
                <span className="text-xs font-semibold">-Row</span>
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().deleteTable().run()}
                tooltip="Delete Table"
              >
                <span className="text-xs font-semibold text-destructive">
                  Del
                </span>
              </MenuButton>
            </>
          )}
          <div className="w-px h-6 bg-border mx-1" />
        </>
      )}

      {showMedia && (
        <>
          <MenuButton onClick={addImage} tooltip="Insert Image">
            <Image className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={addYouTubeVideo} tooltip="Insert YouTube Video">
            <Youtube className="h-4 w-4" />
          </MenuButton>
        </>
      )}
    </div>
  );
}
