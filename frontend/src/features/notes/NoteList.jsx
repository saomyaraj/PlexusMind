//----------------------------------------------------
// src/features/notes/NoteList.js
//----------------------------------------------------
import React, { useState, useEffect } from 'react';
import { TagIcon, CalendarIcon, LinkIcon } from '@heroicons/react/24/outline';
import useStore from '../../store/useStore';
import ReactMarkdown from 'react-markdown';

const NoteList = () => {
  const { notes, fetchNotes, selectNote, selectedNote } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'connections', 'title'

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Get unique tags from all notes
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  // Filter and sort notes
  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = searchTerm === '' || 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = !selectedTag || note.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'connections':
          return (b.relationships?.length || 0) - (a.relationships?.length || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="date">Sort by Date</option>
            <option value="connections">Sort by Connections</option>
            <option value="title">Sort by Title</option>
          </select>
          
          <select
            value={selectedTag || ''}
            onChange={(e) => setSelectedTag(e.target.value || null)}
            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.map(note => (
          <div
            key={note._id}
            className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-colors ${
              selectedNote?._id === note._id ? 'ring-2 ring-indigo-500' : 'hover:bg-gray-50'
            }`}
            onClick={() => selectNote(note._id)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-gray-900">{note.title}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <CalendarIcon className="h-4 w-4" />
                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="prose prose-sm max-w-none mb-3 line-clamp-2">
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TagIcon className="h-4 w-4 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {note.relationships?.length > 0 && (
                <div className="flex items-center text-sm text-gray-500">
                  <LinkIcon className="h-4 w-4 mr-1" />
                  <span>{note.relationships.length} connections</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No notes found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteList;