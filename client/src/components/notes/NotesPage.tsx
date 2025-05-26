import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotesSidebar } from "./NotesSidebar";
import { NoteEditor } from "./NoteEditor";
import { notesAPI, Note } from "@/lib/api";
import { toast } from "sonner";

export const NotesPage = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: notesAPI.getAll,
  });

  const createNoteMutation = useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      notesAPI.create(title, content),
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setSelectedNote(newNote);
      setSummary(null);
      toast.success("Note created!");
    },
    onError: () => {
      toast.error("Failed to create note. Please try again.");
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({
      id,
      title,
      content,
    }: {
      id: string;
      title: string;
      content: string;
    }) => notesAPI.update(id, title, content),
    onSuccess: (updatedNote) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setSelectedNote(updatedNote);
    },
    onError: () => {
      toast.error("Failed to update note. Please try again.");
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => notesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setSelectedNote(null);
      setSummary(null);
    },
    onError: () => {
      toast.error("Failed to delete note. Please try again.");
    },
  });

  const summarizeMutation = useMutation({
    mutationFn: (id: string) => notesAPI.summarize(id),
    onSuccess: (data) => {
      setSummary(data.summary);
    },
    onError: () => {
      toast.error("Failed to generate summary. Please try again.");
    },
  });

  useEffect(() => {
    setSummary(null);
  }, [selectedNote?.id]);

  const handleNewNote = () => {
    if (selectedNote?.id?.startsWith("temp-")) return;
    const newNote: Note = {
      id: "temp-" + Date.now(),
      title: "New Note",
      content: "# Welcome to your new note\n\nStart writing here...",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "temp",
    };
    setSelectedNote(newNote);
    setSummary(null);
  };

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    setSummary(null);
  };

  const handleSave = async (title: string, content: string) => {
    if (!selectedNote) return;

    const isTitleEmpty = !title.trim();
    const isContentEmpty = !content.trim();

    if (isTitleEmpty && isContentEmpty) {
      if (!selectedNote.id.startsWith("temp-")) {
        await deleteNoteMutation.mutateAsync(selectedNote.id);
      }
    }

    try {
      if (selectedNote.id.startsWith("temp-")) {
        await createNoteMutation.mutateAsync({ title, content });
      } else {
        await updateNoteMutation.mutateAsync({
          id: selectedNote.id,
          title,
          content,
        });
      }
      toast.success("Note saved successfully!");
    } catch (error) {
      toast.error("Failed to save note. Please try again.");
    } finally {
    }
  };

  const handleDelete = async () => {
    if (!selectedNote || selectedNote.id.startsWith("temp-")) return;
    await deleteNoteMutation.mutateAsync(selectedNote.id);
  };

  const handleSummarize = async () => {
    if (!selectedNote || selectedNote.id.startsWith("temp-")) {
      toast.error("Please save the note before summarizing.");
      return;
    }
    await summarizeMutation.mutateAsync(selectedNote.id);
  };

  const toggleSidebarCollapse = () => setSidebarCollapsed((prev) => !prev);

  if (isLoading || !notes) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white">
      <NotesSidebar
        notes={notes}
        selectedNoteId={selectedNote?.id || null}
        onNoteSelect={handleNoteSelect}
        onNewNote={handleNewNote}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
      <NoteEditor
        note={selectedNote}
        onSave={handleSave}
        onDelete={handleDelete}
        onSummarize={handleSummarize}
        summary={summary}
        isSummaryLoading={summarizeMutation.isPending}
        isSaving={createNoteMutation.isPending || updateNoteMutation.isPending}
      />
    </div>
  );
};
