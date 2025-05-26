// import React, { useEffect } from "react";
// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import { Button } from "@/components/ui/button";

// export interface RichTextEditorProps {
//   content: string;
//   onChange: (html: string) => void;
// }

// export const RichTextEditor: React.FC<RichTextEditorProps> = ({
//   content,
//   onChange,
// }) => {
//   const editor = useEditor({
//     extensions: [StarterKit],
//     content,
//     onUpdate: ({ editor }) => {
//       onChange(editor.getHTML());
//     },
//   });

//   // When `content` prop changes (e.g. on note load), update editor
//   useEffect(() => {
//     if (editor && editor.getHTML() !== content) {
//       editor.commands.setContent(content, false);
//     }
//   }, [content, editor]);

//   if (!editor) return null;

//   return (
//     <div className="rich-text-editor h-full flex flex-col">
//       <div className="p-2 border-b border-gray-200 flex gap-2">
//         <Button
//           size="sm"
//           onClick={() => editor.chain().focus().toggleBold().run()}
//         >
//           Bold
//         </Button>
//         <Button
//           size="sm"
//           onClick={() => editor.chain().focus().toggleItalic().run()}
//         >
//           Italic
//         </Button>
//         <Button
//           size="sm"
//           onClick={() => editor.chain().focus().toggleBulletList().run()}
//         >
//           • List
//         </Button>
//         {/* add more controls as you like */}
//       </div>
//       <div className="flex-1 overflow-auto p-4">
//         <EditorContent editor={editor} />
//       </div>
//     </div>
//   );
// };

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string) => void;
  hasSelection: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onAction,
  hasSelection,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-48"
      style={{ left: x, top: y }}
    >
      {hasSelection && (
        <>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            onClick={() => onAction("cut")}
          >
            <span>✂️</span> Cut
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            onClick={() => onAction("copy")}
          >
            <span>📋</span> Copy
          </button>
        </>
      )}
      <button
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
        onClick={() => onAction("paste")}
      >
        <span>📋</span> Paste
      </button>
      <Separator className="my-1" />
      {hasSelection && (
        <>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            onClick={() => onAction("bold")}
          >
            <span className="font-bold">B</span> Bold
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            onClick={() => onAction("italic")}
          >
            <span className="italic">I</span> Italic
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            onClick={() => onAction("underline")}
          >
            <span className="underline">U</span> Underline
          </button>
          <Separator className="my-1" />
        </>
      )}
      <button
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
        onClick={() => onAction("selectAll")}
      >
        Select All
      </button>
    </div>
  );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    hasSelection: boolean;
  } | null>(null);

  const executeCommand = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    },
    [onChange]
  );

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const selection = window.getSelection();
    const hasSelection = selection ? selection.toString().length > 0 : false;

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      hasSelection,
    });
  };

  const handleContextAction = (action: string) => {
    switch (action) {
      case "cut":
        executeCommand("cut");
        break;
      case "copy":
        executeCommand("copy");
        break;
      case "paste":
        navigator.clipboard.readText().then((text) => {
          executeCommand("insertText", text);
        });
        break;
      case "bold":
        executeCommand("bold");
        break;
      case "italic":
        executeCommand("italic");
        break;
      case "underline":
        executeCommand("underline");
        break;
      case "selectAll":
        executeCommand("selectAll");
        break;
    }
    setContextMenu(null);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          executeCommand("bold");
          break;
        case "i":
          e.preventDefault();
          executeCommand("italic");
          break;
        case "u":
          e.preventDefault();
          executeCommand("underline");
          break;
        case "z":
          e.preventDefault();
          executeCommand("undo");
          break;
        case "y":
          e.preventDefault();
          executeCommand("redo");
          break;
      }
    }
  };

  const insertList = (type: "ordered" | "unordered") => {
    executeCommand(
      type === "ordered" ? "insertOrderedList" : "insertUnorderedList"
    );
  };

  const formatBlock = (tag: string) => {
    executeCommand("formatBlock", tag);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  const changeTextColor = (color: string) => {
    executeCommand("foreColor", color);
  };

  const changeBackgroundColor = (color: string) => {
    executeCommand("hiliteColor", color);
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3 bg-gray-50">
        <div className="flex flex-wrap items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("undo")}
              className="h-8 w-8 p-0"
              title="Undo (Ctrl+Z)"
            >
              ↶
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("redo")}
              className="h-8 w-8 p-0"
              title="Redo (Ctrl+Y)"
            >
              ↷
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Text Formatting */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("bold")}
              className="h-8 px-3 font-bold"
              title="Bold (Ctrl+B)"
            >
              B
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("italic")}
              className="h-8 px-3 italic"
              title="Italic (Ctrl+I)"
            >
              I
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("underline")}
              className="h-8 px-3 underline"
              title="Underline (Ctrl+U)"
            >
              U
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("strikethrough")}
              className="h-8 px-3 line-through"
              title="Strikethrough"
            >
              S
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Heading Dropdown */}
          <Select onValueChange={formatBlock}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue placeholder="Heading" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="div">Normal</SelectItem>
              <SelectItem value="h1">Heading 1</SelectItem>
              <SelectItem value="h2">Heading 2</SelectItem>
              <SelectItem value="h3">Heading 3</SelectItem>
              <SelectItem value="h4">Heading 4</SelectItem>
              <SelectItem value="h5">Heading 5</SelectItem>
              <SelectItem value="h6">Heading 6</SelectItem>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6" />

          {/* Text Color */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3"
                title="Text Color"
              >
                A
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className="grid grid-cols-4 gap-1 p-2">
                {[
                  "#000000",
                  "#ff0000",
                  "#00ff00",
                  "#0000ff",
                  "#ffff00",
                  "#ff00ff",
                  "#00ffff",
                  "#ffffff",
                ].map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 border border-gray-300 rounded"
                    style={{ backgroundColor: color }}
                    onClick={() => changeTextColor(color)}
                    title={`Text color: ${color}`}
                  />
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Background Color */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3"
                title="Background Color"
              >
                🎨
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className="grid grid-cols-4 gap-1 p-2">
                {[
                  "transparent",
                  "#ffff00",
                  "#00ff00",
                  "#00ffff",
                  "#ff00ff",
                  "#ff0000",
                  "#0000ff",
                  "#c0c0c0",
                ].map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 border border-gray-300 rounded"
                    style={{
                      backgroundColor:
                        color === "transparent" ? "#ffffff" : color,
                    }}
                    onClick={() => changeBackgroundColor(color)}
                    title={`Background color: ${color}`}
                  />
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          {/* Alignment */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("justifyLeft")}
              className="h-8 px-3"
              title="Align Left"
            >
              ⇤
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("justifyCenter")}
              className="h-8 px-3"
              title="Align Center"
            >
              ≡
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("justifyRight")}
              className="h-8 px-3"
              title="Align Right"
            >
              ⇥
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("justifyFull")}
              className="h-8 px-3"
              title="Justify"
            >
              ⬌
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Lists */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => insertList("unordered")}
              className="h-8 px-3"
              title="Bullet List"
            >
              •
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => insertList("ordered")}
              className="h-8 px-3"
              title="Numbered List"
            >
              1.
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Indent */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("outdent")}
              className="h-8 px-3"
              title="Decrease Indent"
            >
              ⇤
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("indent")}
              className="h-8 px-3"
              title="Increase Indent"
            >
              ⇥
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Insert */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={insertLink}
              className="h-8 px-3"
              title="Insert Link"
            >
              🔗
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("insertHorizontalRule")}
              className="h-8 px-3"
              title="Insert Horizontal Rule"
            >
              ―
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Remove Formatting */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => executeCommand("removeFormat")}
            className="h-8 px-3"
            title="Clear Formatting"
          >
            🧹
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onContextMenu={handleContextMenu}
          className="h-full p-6 outline-none prose prose-sm max-w-none leading-relaxed"
          style={{ minHeight: "100%" }}
          suppressContentEditableWarning={true}
          spellCheck={true}
        />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          hasSelection={contextMenu.hasSelection}
          onClose={() => setContextMenu(null)}
          onAction={handleContextAction}
        />
      )}
    </div>
  );
};
