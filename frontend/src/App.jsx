import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listNotes, createNote, updateNote, deleteNote } from './api';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';

function BrutalLogoMini() {
  return (
    <motion.div
      initial={{ rotate: -6, scale: 0.95, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      className="flex items-center gap-3"
    >
      <div className="brutal-logo p-2 rounded-sm">
        <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="60" height="60" rx="6" fill="#FF6B00" stroke="#0F172A" strokeWidth="4"/>
          <path d="M20 36h24" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
          <path d="M20 28h16" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>

      <div className="leading-tight">
        <div className="text-white text-lg md:text-2xl font-extrabold tracking-tight">SochPad</div>
        <motion.div
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="soch-quote hidden sm:inline-block"
        >
          Soch that stands out.
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function App(){
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // UI state for responsiveness
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile: show list
  const [mobileMode, setMobileMode] = useState(false);

  async function loadNotes(q='') {
    setLoading(true);
    try {
      const data = await listNotes(q);
      setNotes(data);
    } catch (e) {
      console.error(e);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
    const onResize = () => setMobileMode(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  async function handleCreate() {
    const newNote = await createNote({ title: 'Soch', body: '' });
    await loadNotes(query);
    setActiveId(newNote.id);
    if (mobileMode) {
      setIsSidebarOpen(false); // open editor
    }
  }

  async function handleDelete(id) {
    await deleteNote(id);
    if (activeId === id) setActiveId(null);
    await loadNotes(query);
  }

  async function handleSave(id, payload) {
    await updateNote(id, payload);
    await loadNotes(query);
  }

  const activeNote = notes.find(n => n.id === activeId) || null;

  return (
    <div className="h-screen flex flex-col bg-[#0f172a]">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-4 md:px-6 py-3 border-b-4 border-[#FFD500]"
      >
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-sm border-2 border-[#ffd500] bg-[#fff0d6]"
            onClick={() => setIsSidebarOpen(v => !v)}
            aria-label="Toggle notes list"
          >
            {/* hamburger */}
            <svg width="20" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <BrutalLogoMini />
        </div>

        <div className="flex items-center gap-3">
          {/* Search: show full input on md+, compact icon on mobile */}
          <div className="hidden md:block">
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); loadNotes(e.target.value); }}
              placeholder="Search notes..."
              className="px-3 py-2 rounded-sm text-sm font-semibold outline-none brutal-input"
            />
          </div>

          <button
            onClick={handleCreate}
            className="px-3 py-2 font-bold rounded-sm brutal-btn"
          >
            New
          </button>
        </div>
      </motion.header>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar: desktop always visible; mobile shows as overlay when toggled */}
        <AnimatePresence>
          {(!mobileMode || isSidebarOpen) && (
            <motion.aside
              initial={{ x: mobileMode ? -260 : 0, opacity: mobileMode ? 0 : 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: mobileMode ? -260 : 0, opacity: mobileMode ? 0 : 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className={`z-20 ${mobileMode ? 'fixed left-0 top-16 bottom-0 w-[85%] max-w-xs' : 'w-full md:w-1/3 lg:w-1/4'} border-r border-[#ffd500] bg-[#fff0d6] overflow-auto`}
            >
              <div className="p-3 border-b border-[#0f172a] flex items-center justify-between">
                <div className="text-[#0f172a] font-extrabold">Notes</div>
                <div className="text-sm text-[#0f172a]/80">{notes.length}</div>
              </div>

              <div>
                {loading && <div className="p-4 text-[#0f172a]">Loading…</div>}
                {!loading && notes.length === 0 && <div className="p-6 text-[#0f172a]/70">No notes yet</div>}
                {notes.map(n => (
                  <NoteList
                    key={n.id}
                    note={n}
                    active={n.id === activeId}
                    onSelect={() => { setActiveId(n.id); if (mobileMode) setIsSidebarOpen(false); }}
                    onDelete={() => handleDelete(n.id)}
                  />
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile dim backdrop when sidebar open */}
        {mobileMode && isSidebarOpen && (
          <div
            className="fixed inset-0 z-10 bg-black/30"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden
          />
        )}

        {/* Editor / Main content */}
        <main className={`flex-1 overflow-auto ${mobileMode ? 'pt-2 pb-16' : ''} bg-[#f3f6f9]`}>
          <AnimatePresence mode="wait">
            {activeNote ? (
              <motion.div key={activeNote.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <NoteEditor
                  note={activeNote}
                  onSave={handleSave}
                  onBack={() => {
                    // mobile back to list
                    if (mobileMode) {
                      setActiveId(null);
                      setIsSidebarOpen(true);
                    } else {
                      setActiveId(null);
                    }
                  }}
                  mobileMode={mobileMode}
                />
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-[#0f172a]/60">
                Select or create a note to begin
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* footer */}
      <footer className="py-2 text-center text-xs text-[#ffd500] border-t border-[#0f172a]">
        Built with boldness — SochPad
      </footer>
    </div>
  );
}
