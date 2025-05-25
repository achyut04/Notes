import React, { useState, useEffect, useCallback } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { FileText, Eye, Brain, X } from "lucide-react";
import { Note } from "@/lib/api";
import { toast } from "sonner";

interface NoteEditorProps {
  note: Note | null;
  onSave: (title: string, content: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onSummarize: () => Promise<void>;
  summary: string | null;
  isLoading: boolean;
  isSummaryLoading: boolean;
  isSaving: boolean;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onDelete,
  onSummarize,
  summary,
  isLoading,
  isSummaryLoading,
  isSaving,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [note]);

  useEffect(() => {
    if (summary) {
      setShowSidePanel(true);
      setActiveTab("summary");
    }
  }, [summary]);

  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (titleToSave: string, contentToSave: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
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

          if (titleToSave.trim() || contentToSave.trim()) {
            try {
              await onSave(titleToSave || "Untitled", contentToSave);
            } catch (error) {
              toast.error("Failed to auto-save note");
            }
          }
        }, 1000);
      };
    })(),
    [note, onSave, onDelete]
  );

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedSave(newTitle, content);
  };

  const handleContentChange = (newContent: string | undefined) => {
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
    <div className="flex-1 flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note title..."
            className="text-xl font-semibold border-none p-0 focus:ring-0 focus:outline-none bg-transparent max-w-2xl"
          />

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSummarize}
              variant="outline"
              size="sm"
              disabled={isSummaryLoading}
            >
              <Brain className="h-4 w-4 mr-2" />
              {isSummaryLoading ? "Generating..." : "AI Summary"}
            </Button>
            <Button onClick={toggleSidePanel} variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              {showSidePanel ? "Hide Panel" : "Show Panel"}
            </Button>
          </div>
        </div>
      </div>

      {isSaving && (
        <div className="flex items-center text-sm text-gray-500 mt-2">
          <svg
            className="animate-spin h-4 w-4 mr-2 text-blue-500"
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
          Saving changes... please don’t close the tab.
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div
          className={`${
            showSidePanel ? "w-1/2" : "flex-1"
          } transition-all duration-300`}
        >
          <MDEditor
            value={content}
            onChange={handleContentChange}
            height="100%"
            preview="edit"
            hideToolbar={false}
            data-color-mode="light"
          />
        </div>

        {showSidePanel && (
          <>
            <Separator orientation="vertical" />
            <div className="w-1/2 bg-gray-50 flex flex-col transition-all duration-300">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
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
                className="flex-1 flex flex-col min-h-0"
              >
                <TabsList className="grid w-full grid-cols-2 m-4 mb-2">
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
                  className="flex-1 mx-4 mb-4 min-h-0"
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
                  className="flex-1 mx-4 mb-4 min-h-0"
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
