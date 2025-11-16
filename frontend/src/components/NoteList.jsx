import React from 'react';
import { motion } from 'framer-motion';

export default function NoteList({ note, active, onSelect, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -6 }}
      onClick={onSelect}
      className={`p-4 cursor-pointer flex justify-between items-start gap-4 border-b border-[#0f172a] hover:bg-[#ffe6b3] ${active ? 'bg-[#ffd500]/20' : ''}`}
    >
      <div className="flex-1">
        <div className="font-bold text-[#0f172a] truncate">{note.title || 'Untitled'}</div>
        <div className="text-sm text-[#0f172a]/80 mt-1 line-clamp-2">{(note.body || '').slice(0,120)}</div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="text-xs text-[#0f172a]/60">{new Date(note.updated_at*1000).toLocaleDateString()}</div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="px-2 py-1 text-xs font-bold border-2 border-[#0f172a] bg-[#fff] rounded-sm"
        >
          DELETE
        </button>
      </div>
    </motion.div>
  );
}
