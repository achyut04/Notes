import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Outdent,
  Indent,
  Link,
  Minus,
  Eraser,
  Undo,
  Redo,
  Palette,
  Type,
} from "lucide-react";

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
            <Bold className="h-4 w-4" /> Bold
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            onClick={() => onAction("italic")}
          >
            <Italic className="h-4 w-4" /> Italic
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            onClick={() => onAction("underline")}
          >
            <Underline className="h-4 w-4" /> Underline
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
  const toolbarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    hasSelection: boolean;
  } | null>(null);
  const [activeCommands, setActiveCommands] = useState<Record<string, boolean>>(
    {}
  );

  const updateActiveCommands = useCallback(() => {
    if (document) {
      setActiveCommands({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikethrough: document.queryCommandState("strikethrough"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        justifyFull: document.queryCommandState("justifyFull"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      });
    }
  }, []);

  const executeCommand = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
        updateActiveCommands();
      }
    },
    [onChange, updateActiveCommands]
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
      updateActiveCommands();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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

    // Apply proper styling to list items
    setTimeout(() => {
      if (editorRef.current) {
        const lists = editorRef.current.querySelectorAll(
          type === "ordered" ? "ol" : "ul"
        );
        lists.forEach((list) => {
          (list as HTMLElement).style.margin = "1em 0";
          (list as HTMLElement).style.paddingLeft = "2em";
          const items = list.querySelectorAll("li");
          items.forEach((item) => {
            (item as HTMLElement).style.margin = "0.5em 0";
            (item as HTMLElement).style.listStyleType =
              type === "ordered" ? "decimal" : "disc";
          });
        });
      }
    }, 10);
  };

  const formatBlock = (tag: string) => {
    executeCommand("formatBlock", `<${tag}>`);

    // Apply appropriate styling based on heading
    setTimeout(() => {
      if (tag.startsWith("h") && editorRef.current) {
        const headings = editorRef.current.querySelectorAll(tag);
        headings.forEach((heading) => {
          const headingLevel = Number.parseInt(tag.substring(1));
          const fontSize = Math.max(32 - (headingLevel - 1) * 4, 16);
          const fontWeight = headingLevel <= 3 ? "bold" : "600";
          (heading as HTMLElement).style.fontSize = `${fontSize}px`;
          (heading as HTMLElement).style.fontWeight = fontWeight;
          (heading as HTMLElement).style.margin = "1em 0 0.5em 0";
          (heading as HTMLElement).style.lineHeight = "1.2";
        });
      }
    }, 10);
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

  useEffect(() => {
    const updateButtonStates = () => {
      updateActiveCommands();
    };

    document.addEventListener("selectionchange", updateButtonStates);
    return () =>
      document.removeEventListener("selectionchange", updateButtonStates);
  }, [updateActiveCommands]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-white overflow-hidden"
    >
      {/* Fixed Toolbar */}
      <div
        ref={toolbarRef}
        className="border-b border-gray-200 p-3 bg-gray-50 sticky top-0 z-10 w-full flex-shrink-0"
      >
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("undo")}
              className="h-8 w-8 p-0 flex-shrink-0"
              title="Undo (Ctrl+Z)"
              onMouseDown={(e) => e.preventDefault()}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("redo")}
              className="h-8 w-8 p-0 flex-shrink-0"
              title="Redo (Ctrl+Y)"
              onMouseDown={(e) => e.preventDefault()}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("bold")}
              className={`h-8 px-3 flex-shrink-0 ${
                activeCommands.bold ? "bg-blue-100 border-blue-300" : ""
              }`}
              title="Bold (Ctrl+B)"
              onMouseDown={(e) => e.preventDefault()}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("italic")}
              className={`h-8 px-3 flex-shrink-0 ${
                activeCommands.italic ? "bg-blue-100 border-blue-300" : ""
              }`}
              title="Italic (Ctrl+I)"
              onMouseDown={(e) => e.preventDefault()}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("underline")}
              className={`h-8 px-3 flex-shrink-0 ${
                activeCommands.underline ? "bg-blue-100 border-blue-300" : ""
              }`}
              title="Underline (Ctrl+U)"
              onMouseDown={(e) => e.preventDefault()}
            >
              <Underline className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("strikethrough")}
              className={`h-8 px-3 flex-shrink-0 ${
                activeCommands.strikethrough
                  ? "bg-blue-100 border-blue-300"
                  : ""
              }`}
              title="Strikethrough"
              onMouseDown={(e) => e.preventDefault()}
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <Select onValueChange={formatBlock}>
            <SelectTrigger className="h-8 w-32 flex-shrink-0">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 flex-shrink-0"
                title="Text Color"
                onMouseDown={(e) => e.preventDefault()}
              >
                <Type className="h-4 w-4" />
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 flex-shrink-0"
                title="Background Color"
                onMouseDown={(e) => e.preventDefault()}
              >
                <Palette className="h-4 w-4" />
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

          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("justifyLeft")}
              className={`h-8 px-3 flex-shrink-0 ${
                activeCommands.justifyLeft ? "bg-blue-100 border-blue-300" : ""
              }`}
              title="Align Left"
              onMouseDown={(e) => e.preventDefault()}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("justifyCenter")}
              className={`h-8 px-3 flex-shrink-0 ${
                activeCommands.justifyCenter
                  ? "bg-blue-100 border-blue-300"
                  : ""
              }`}
              title="Align Center"
              onMouseDown={(e) => e.preventDefault()}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("justifyRight")}
              className={`h-8 px-3 flex-shrink-0 ${
                activeCommands.justifyRight ? "bg-blue-100 border-blue-300" : ""
              }`}
              title="Align Right"
              onMouseDown={(e) => e.preventDefault()}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("justifyFull")}
              className={`h-8 px-3 flex-shrink-0 ${
                activeCommands.justifyFull ? "bg-blue-100 border-blue-300" : ""
              }`}
              title="Justify"
              onMouseDown={(e) => e.preventDefault()}
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => insertList("unordered")}
              className={`h-8 px-3 flex-shrink-0 ${
                activeCommands.insertUnorderedList
                  ? "bg-blue-100 border-blue-300"
                  : ""
              }`}
              title="Bullet List"
              onMouseDown={(e) => e.preventDefault()}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => insertList("ordered")}
              className={`h-8 px-3 flex-shrink-0 ${
                activeCommands.insertOrderedList
                  ? "bg-blue-100 border-blue-300"
                  : ""
              }`}
              title="Numbered List"
              onMouseDown={(e) => e.preventDefault()}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("outdent")}
              className="h-8 px-3 flex-shrink-0"
              title="Decrease Indent"
              onMouseDown={(e) => e.preventDefault()}
            >
              <Outdent className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("indent")}
              className="h-8 px-3 flex-shrink-0"
              title="Increase Indent"
              onMouseDown={(e) => e.preventDefault()}
            >
              <Indent className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={insertLink}
              className="h-8 px-3 flex-shrink-0"
              title="Insert Link"
              onMouseDown={(e) => e.preventDefault()}
            >
              <Link className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeCommand("insertHorizontalRule")}
              className="h-8 px-3 flex-shrink-0"
              title="Insert Horizontal Rule"
              onMouseDown={(e) => e.preventDefault()}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <Button
            size="sm"
            variant="outline"
            onClick={() => executeCommand("removeFormat")}
            className="h-8 px-3 flex-shrink-0"
            title="Clear Formatting"
            onMouseDown={(e) => e.preventDefault()}
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onContextMenu={handleContextMenu}
          className="h-full p-6 outline-none prose prose-sm max-w-none leading-relaxed"
          style={{
            minHeight: "100%",
            wordWrap: "break-word",
            overflowWrap: "break-word",
          }}
          suppressContentEditableWarning={true}
          spellCheck={true}
        />
      </div>

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
