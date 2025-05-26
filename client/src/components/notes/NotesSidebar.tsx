import React from "react";
import {
  Plus,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Note } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface NotesSidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  onNoteSelect: (note: Note) => void;
  onNewNote: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const NotesSidebar: React.FC<NotesSidebarProps> = ({
  notes,
  selectedNoteId,
  onNoteSelect,
  onNewNote,
  searchTerm,
  onSearchChange,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { logout, user } = useAuth();

  const notesArray = Array.isArray(notes) ? notes : [];

  const filteredNotes = notesArray.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`${
        isCollapsed ? "w-16" : "w-80"
      } bg-gray-50 border-r border-gray-200 flex flex-col h-full transition-all duration-300 ease-in-out relative group`}
      onMouseEnter={() => isCollapsed && onToggleCollapse()}
      onMouseLeave={() => !isCollapsed && selectedNoteId && onToggleCollapse()}
    >
      <Button
        onClick={onToggleCollapse}
        variant="ghost"
        size="sm"
        className="absolute top-4 -right-3 z-10 bg-white border border-gray-200 rounded-full shadow-sm h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      <div className="p-4 border-b border-gray-200">
        {!isCollapsed && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </Button>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </>
        )}

        <Button
          onClick={onNewNote}
          className={`${isCollapsed ? "w-8 h-8 p-0" : "w-full"} transition-all`}
          size="sm"
          title={isCollapsed ? "New Note" : ""}
        >
          <Plus className="h-4 w-4 mr-2" />
          {!isCollapsed && "New Note"}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredNotes.length === 0 && !isCollapsed ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {searchTerm ? "No notes found" : "No notes yet"}
              </p>
              {!searchTerm && (
                <p className="text-xs mt-1">
                  Create your first note to get started
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onNoteSelect(note)}
                  className={`${
                    isCollapsed ? "p-2" : "p-3"
                  } rounded-lg cursor-pointer transition-colors ${
                    selectedNoteId === note.id
                      ? "bg-blue-100 border border-blue-200"
                      : "hover:bg-white hover:shadow-sm border border-transparent"
                  }`}
                  title={isCollapsed ? note.title : ""}
                >
                  {isCollapsed ? (
                    <div className="flex items-center justify-center">
                      <FileText className="h-4 w-4 text-gray-600" />
                    </div>
                  ) : (
                    <>
                      <h3 className="font-medium text-sm text-gray-900 mb-1 truncate">
                        {note.title || "Untitled Note"}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {note.content.slice(0, 100)}...
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 truncate">
            Signed in as {user?.email}
          </p>
        </div>
      )}
    </div>
  );
};
