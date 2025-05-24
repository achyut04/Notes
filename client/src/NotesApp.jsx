import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X, FileText } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

const NotesApp = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const userId = 1;

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/notes?userId=${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/notes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, userId }),
      });
      
      if (!response.ok) throw new Error('Failed to create note');
      
      const newNote = await response.json();
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
      setIsCreating(false);
      setTitle('');
      setContent('');
      setError('');
    } catch (err) {
      setError('Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async () => {
    if (!selectedNote || !title.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      
      if (!response.ok) throw new Error('Failed to update note');
      
      const updatedNote = await response.json();
      setNotes(notes.map(note => 
        note.id === selectedNote.id ? updatedNote : note
      ));
      setSelectedNote(updatedNote);
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('Failed to update note');
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/notes/${noteId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete note');
      
      setNotes(notes.filter(note => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
      setError('');
    } catch (err) {
      setError('Failed to delete note');
    } finally {
      setLoading(false);
    }
  };

  const selectNote = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(false);
    setIsCreating(false);
  };

  const startCreating = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedNote(null);
    setTitle('');
    setContent('');
    setError('');
  };

  const startEditing = () => {
    if (!selectedNote) return;
    setIsEditing(true);
    setIsCreating(false);
    setTitle(selectedNote.title);
    setContent(selectedNote.content);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setIsCreating(false);
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
    } else {
      setTitle('');
      setContent('');
    }
    setError('');
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border h-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">My Notes</h2>
              <button
                onClick={startCreating}
                className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
                title="Create New Note"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-96">
              {loading && notes.length === 0 ? (
                <div className="p-4 text-center text-gray-500">Loading notes...</div>
              ) : notes.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <FileText size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>No notes yet. Create your first note!</p>
                </div>
              ) : (
                <div className="p-2">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => selectNote(note)}
                      className={`p-3 mb-2 rounded-md cursor-pointer transition-colors group ${
                        selectedNote?.id === note.id
                          ? 'bg-blue-50 border-blue-200 border'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {note.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                          title="Delete Note"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border h-full">
            {isCreating || isEditing ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {isCreating ? 'Create New Note' : 'Edit Note'}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={isCreating ? createNote : updateNote}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save size={16} />
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
                
                {error && (
                  <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                    {error}
                  </div>
                )}
                
                <div className="p-4 flex-1 flex flex-col">
                  <input
                    type="text"
                    placeholder="Note title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl font-semibold border border-gray-300 rounded-md px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <div className="flex-1">
                    <RichTextEditor
                      content={content}
                      onChange={setContent}
                      placeholder="Start writing your note..."
                    />
                  </div>
                </div>
              </div>
            ) : selectedNote ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      {selectedNote.title}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      Last updated: {new Date(selectedNote.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={startEditing}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto">
                  <div 
                    className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No note selected</h3>
                  <p>Select a note from the sidebar or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesApp;