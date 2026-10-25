import { useState } from 'react'

const emptyEntry = { degree: '', institution: '', year: '', grade: '' }

export default function EducationStep({ data, onChange }) {
  const entries = Array.isArray(data) ? data : []
  const [editing, setEditing] = useState(entries.length === 0 ? 0 : null)

  const addEntry = () => {
    const newEntries = [...entries, { ...emptyEntry }]
    onChange(newEntries)
    setEditing(newEntries.length - 1)
  }

  const updateEntry = (idx, field, value) => {
    const updated = entries.map((e, i) => i === idx ? { ...e, [field]: value } : e)
    onChange(updated)
  }

  const removeEntry = (idx) => {
    onChange(entries.filter((_, i) => i !== idx))
    setEditing(null)
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Education</h2>
          <p className="text-slate-400 text-sm mt-1">Your academic qualifications</p>
        </div>
        <button id="add-education-btn" onClick={addEntry} className="btn btn-primary btn-sm">
          + Add
        </button>
      </div>

      <div className="space-y-3">
        {entries.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-white/10 rounded-xl">
            No education entries. Click "Add" to start.
          </div>
        )}
        {entries.map((entry, idx) => (
          <div key={idx} className="card !p-4 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-300">{entry.institution || `Education ${idx + 1}`}</span>
              <div className="flex gap-2">
                <button onClick={() => setEditing(editing === idx ? null : idx)} className="btn btn-secondary btn-sm">
                  {editing === idx ? 'Done' : 'Edit'}
                </button>
                <button onClick={() => removeEntry(idx)} className="btn btn-danger btn-sm">✕</button>
              </div>
            </div>
            {editing === idx && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                {[
                  { key: 'degree', label: 'Degree / Qualification', placeholder: 'B.Tech Computer Science' },
                  { key: 'institution', label: 'Institution', placeholder: 'MIT' },
                  { key: 'year', label: 'Year / Duration', placeholder: '2020 - 2024' },
                  { key: 'grade', label: 'CGPA / Percentage', placeholder: '8.5 / 10 or 85%' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
                    <input
                      type="text"
                      value={entry[f.key] || ''}
                      onChange={e => updateEntry(idx, f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="input text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
            {editing !== idx && (
              <div className="text-sm text-slate-400">
                {entry.degree} {entry.year && `• ${entry.year}`} {entry.grade && `• ${entry.grade}`}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
