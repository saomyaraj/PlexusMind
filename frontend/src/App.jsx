// src/App.js
import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import KnowledgeGraphView from './features/KnowledgeGraphView';
import NoteInput from './features/notes/NoteInput';
import NoteList from './features/notes/NoteList';
import NoteDetail from './features/notes/NoteDetail';
import useStore from './store/useStore';
import { Bars3BottomLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';

function App() {
  const { fetchNotes, refreshGraphData, selectedNote, loading } = useStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  useEffect(() => {
    fetchNotes();
    refreshGraphData();
  }, [fetchNotes, refreshGraphData]);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar for mobile */}
      <div className="lg:hidden">
        <div className="fixed inset-0 flex z-40">
          <div
            className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
              sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setSidebarOpen(false)}
          />

          <div
            className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition ease-in-out duration-300 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 overflow-y-auto">
              <div className="p-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Personal Knowledge Graph</h1>
                <NoteInput />
                <NoteList />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-96">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="p-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Personal Knowledge Graph</h1>
                <NoteInput />
                <NoteList />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="lg:hidden">
          <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-1.5">
            <div>
              <button
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3BottomLeftIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="flex h-full">
            {/* Graph View */}
            <div className={`flex-1 ${selectedNote ? 'lg:w-2/3' : 'w-full'}`}>
              <div className="h-full p-4">
                <div className="bg-white rounded-lg shadow h-full">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                    </div>
                  ) : (
                    <KnowledgeGraphView />
                  )}
                </div>
              </div>
            </div>

            {/* Note Detail View */}
            {selectedNote && (
              <div className="hidden lg:block lg:w-1/3 border-l border-gray-200">
                <NoteDetail note={selectedNote} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
}

export default App;