import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import MDEditor from "@uiw/react-md-editor";
import { RichTextEditor } from "./RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { FileText, Eye, Brain, X } from "lucide-react";
import type { Note } from "@/lib/api";
import { toast } from "sonner";

interface NoteEditorProps {
  note: Note | null;
  onSave: (title: string, content: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onSummarize: () => Promise<void>;
  summary: string | null;
  isSummaryLoading: boolean;
  isSaving: boolean;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onDelete,
  onSummarize,
  summary,
  isSummaryLoading,
  isSaving,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<{ title: string; content: string }>({
    title: "",
    content: "",
  });
  const [editorMode, setEditorMode] = useState<"markdown" | "rich-text">(
    "rich-text"
  );

  const isActivelyEditingRef = useRef(false);
  const activeEditingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const markAsActivelyEditing = useCallback(() => {
    isActivelyEditingRef.current = true;

    if (activeEditingTimeoutRef.current) {
      clearTimeout(activeEditingTimeoutRef.current);
    }

    activeEditingTimeoutRef.current = setTimeout(() => {
      isActivelyEditingRef.current = false;
    }, 2000);
  }, []);

  useEffect(() => {
    if (note && !isActivelyEditingRef.current) {
      const isDifferentNote =
        !lastSavedRef.current ||
        (note.id !== lastSavedRef.current.title &&
          note.id !== lastSavedRef.current.content);

      if (isDifferentNote || (title === "" && content === "")) {
        setTitle(note.title);
        setContent(note.content);
        lastSavedRef.current = {
          title: note.title,
          content: note.content,
        };
      }
    } else if (!note) {
      setTitle("");
      setContent("");
      lastSavedRef.current = { title: "", content: "" };
      isActivelyEditingRef.current = false;
    }
  }, [note, title, content]);

  const performSave = useCallback(
    async (titleToSave: string, contentToSave: string) => {
      if (!note) return;
      if (!titleToSave.trim() && !contentToSave.trim()) {
        if (!note.id.startsWith("temp-")) {
          try {
            await onDelete();
            toast.success("Empty note deleted");
          } catch (error) {
            toast.error("Failed to delete note");
          }
        }
        return;
      }
      if (
        titleToSave === lastSavedRef.current.title &&
        contentToSave === lastSavedRef.current.content
      ) {
        return;
      }

      try {
        await onSave(titleToSave, contentToSave);
        lastSavedRef.current = { title: titleToSave, content: contentToSave };

        setTimeout(() => {
          isActivelyEditingRef.current = false;
        }, 500);
      } catch (error) {
        toast.error("Failed to auto-save note");
      }
    },
    [note, onSave, onDelete]
  );

  useEffect(() => {
    if (summary) {
      setShowSidePanel(true);
      setActiveTab("summary");
    }
  }, [summary]);

  const debouncedSave = useCallback(
    (titleToSave: string, contentToSave: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        performSave(titleToSave, contentToSave);
      }, 800);
    },
    [performSave]
  );

  const handleTitleChange = (newTitle: string) => {
    markAsActivelyEditing();
    setTitle(newTitle);
    debouncedSave(newTitle, content);
  };

  const handleContentChange = (newContent: string | undefined) => {
    markAsActivelyEditing();
    const contentValue = newContent || "";
    setContent(contentValue);
    debouncedSave(title, contentValue);
  };

  const handleSummarize = async () => {
    await onSummarize();
  };

  const toggleSidePanel = () => {
    setShowSidePanel(!showSidePanel);
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (activeEditingTimeoutRef.current) {
        clearTimeout(activeEditingTimeoutRef.current);
      }
    };
  }, []);

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center text-gray-500">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No note selected</h3>
          <p className="text-sm">
            Select a note from the sidebar or create a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note title..."
            className="text-2xl font-bold border-none p-0 focus:ring-0 focus:outline-none bg-transparent max-w-2xl text-gray-900"
          />

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSummarize}
              variant="outline"
              size="sm"
              disabled={isSummaryLoading}
              className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
            >
              <Brain className="h-4 w-4 mr-2" />
              {isSummaryLoading ? "Generating..." : "AI Summary"}
            </Button>
            <Button
              onClick={toggleSidePanel}
              variant="outline"
              size="sm"
              className="bg-gray-50 hover:bg-gray-100"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showSidePanel ? "Hide Panel" : "Show Panel"}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={editorMode === "rich-text" ? "default" : "outline"}
              onClick={() => setEditorMode("rich-text")}
              className={
                editorMode === "rich-text"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : ""
              }
            >
              Rich Text
            </Button>
            <Button
              size="sm"
              variant={editorMode === "markdown" ? "default" : "outline"}
              onClick={() => setEditorMode("markdown")}
              className={
                editorMode === "markdown"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : ""
              }
            >
              Markdown
            </Button>
          </div>

          {isSaving && (
            <div className="flex items-center text-sm text-gray-500">
              <svg
                className="animate-spin h-4 w-4 mr-2 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Saving changes...
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor Section */}
        <div
          className={`${
            showSidePanel ? "w-1/2" : "w-full"
          } transition-all duration-300 flex flex-col overflow-hidden`}
          style={{ minWidth: showSidePanel ? "50%" : "100%" }}
        >
          {editorMode === "markdown" ? (
            <div className="flex-1 overflow-hidden">
              <MDEditor
                value={content}
                onChange={(val) => handleContentChange(val || "")}
                height="100%"
                preview="edit"
                hideToolbar={false}
                data-color-mode="light"
              />
            </div>
          ) : (
            <RichTextEditor
              content={content}
              onChange={handleContentChange}
            />
          )}
        </div>

        {/* Side Panel */}
        {showSidePanel && (
          <>
            <Separator orientation="vertical" className="flex-shrink-0" />
            <div
              className="w-1/2 bg-gray-50 flex flex-col overflow-hidden"
              style={{ minWidth: "50%" }}
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Panel</h3>
                <Button
                  onClick={() => setShowSidePanel(false)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <TabsList className="grid w-full grid-cols-2 m-4 mb-2 flex-shrink-0">
                  <TabsTrigger
                    value="preview"
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger
                    value="summary"
                    className="flex items-center gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    AI Summary
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="preview"
                  className="flex-1 mx-4 mb-4 overflow-hidden"
                >
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-3 flex-shrink-0">
                      <h4 className="text-sm font-semibold text-gray-900">
                        Live Preview
                      </h4>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-6 pt-0">
                      <div className="prose prose-sm max-w-none">
                        <MDEditor.Markdown source={content} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent
                  value="summary"
                  className="flex-1 mx-4 mb-4 overflow-hidden"
                >
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between flex-shrink-0">
                      <h4 className="text-sm font-semibold text-gray-900">
                        AI Summary
                      </h4>
                      {!summary && (
                        <Button
                          onClick={handleSummarize}
                          variant="outline"
                          size="sm"
                          disabled={isSummaryLoading}
                        >
                          {isSummaryLoading ? "Generating..." : "Generate"}
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-6 pt-0">
                      {isSummaryLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                      ) : summary ? (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {summary}
                          </p>
                          <Button
                            onClick={handleSummarize}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            Regenerate Summary
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">No summary available</p>
                          <p className="text-xs mt-1">
                            Save your note and click generate to create an AI
                            summary
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
