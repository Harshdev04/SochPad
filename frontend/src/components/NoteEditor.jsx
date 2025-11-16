import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function NoteEditor({ note, onSave, onBack, mobileMode=false }) {
  const [title, setTitle] = useState(note?.title || '');
  const [body, setBody] = useState(note?.body || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(note?.title || '');
    setBody(note?.body || '');
  }, [note]);

  useEffect(() => {
    if (!note || typeof note.id === 'undefined') return;
    const t = setTimeout(async () => {
      if (note && (title !== (note.title || '') || body !== (note.body || ''))) {
        setSaving(true);
        try { await onSave(note.id, { title, body }); } catch (e) { console.error(e); }
        setSaving(false);
      }
    }, 700);
    return () => clearTimeout(t);
  }, [title, body, note, onSave]);

  return (
    <motion.div initial={{ x: 8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-4 md:p-8">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {mobileMode && onBack && (
            <button onClick={onBack} className="px-3 py-1 border-2 border-[#0f172a] bg-[#fff] rounded-sm font-bold">BACK</button>
          )}
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            className="text-xl md:text-3xl font-extrabold p-2 outline-none brutal-input-editor w-full"
          />
        </div>
        <div className="text-sm text-[#0f172a]/70 font-semibold">{saving ? 'Saving...' : 'Auto-saved'}</div>
      </div>

      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Write your Soch..."
        className="w-full h-[52vh] md:h-[68vh] p-4 text-base leading-relaxed brutal-textarea"
      />
    </motion.div>
  );
}
