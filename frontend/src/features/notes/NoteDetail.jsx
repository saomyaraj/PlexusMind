import React from 'react';
import ReactMarkdown from 'react-markdown';
import { XMarkIcon } from '@heroicons/react/24/outline';
import useStore from '../../store/useStore';

const NoteDetail = ({ note }) => {
  const clearSelection = useStore(state => state.clearSelection);

  if (!note) return null;

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Note Details</h2>
        <button
          onClick={clearSelection}
          className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {note.title || 'Untitled'}
        </h3>
        
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>

        {/* Entities Section */}
        {note.entities && note.entities.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Recognized Entities</h4>
            <div className="flex flex-wrap gap-2">
              {note.entities.map((entity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {entity.text}
                  <span className="ml-1 text-xs text-blue-600">({entity.label})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags Section */}
        {note.tags && note.tags.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Created: {new Date(note.createdAt).toLocaleString()}
          </p>
          {note.updatedAt && (
            <p className="text-xs text-gray-500">
              Last updated: {new Date(note.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteDetail;