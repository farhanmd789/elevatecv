import { useState } from 'react'
import { aiService } from '../../services/services'
import toast from 'react-hot-toast'

const emptyExp = { company: '', role: '', duration: '', description: '' }

export default function ExperienceStep({ data, onChange, content }) {
  const experience = Array.isArray(data) ? data : []
  const [editing, setEditing] = useState(null)
  const [aiLoading, setAiLoading] = useState({})

  const addEntry = () => {
    const updated = [...experience, { ...emptyExp }]
    onChange(updated)
    setEditing(updated.length - 1)
  }

  const updateEntry = (idx, field, value) => {
    onChange(experience.map((e, i) => i === idx ? { ...e, [field]: value } : e))
  }

  const removeEntry = (idx) => {
    onChange(experience.filter((_, i) => i !== idx))
    setEditing(null)
  }

  const handleImprove = async (idx) => {
    const exp = experience[idx]
    if (!exp.description) { toast.error('Add a description first'); return }
    setAiLoading(p => ({ ...p, [idx]: true }))
    try {
      const res = await aiService.improveText({
        text: exp.description,
        context: `Role: ${exp.role} at ${exp.company}`,
        role: exp.role,
      })
      updateEntry(idx, 'description', res.data.data)
      toast.success('Description improved!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI failed')
    } finally {
      setAiLoading(p => ({ ...p, [idx]: false }))
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Work Experience</h2>
          <p className="text-slate-400 text-sm mt-1">Your professional history and internships</p>
        </div>
        <button id="add-experience-btn" onClick={addEntry} className="btn btn-primary btn-sm">+ Add</button>
      </div>

      <div className="space-y-3">
        {experience.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-white/10 rounded-xl">
            No experience entries. Click "Add" to start.
          </div>
        )}
        {experience.map((exp, idx) => (
          <div key={idx} className="card !p-4 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-300 truncate">{exp.role || `Experience ${idx + 1}`} {exp.company && `@ ${exp.company}`}</span>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleImprove(idx)} disabled={aiLoading[idx]} className="btn btn-ai btn-sm">
                  {aiLoading[idx] ? '...' : '✨ AI'}
                </button>
                <button onClick={() => setEditing(editing === idx ? null : idx)} className="btn btn-secondary btn-sm">
                  {editing === idx ? 'Done' : 'Edit'}
                </button>
                <button onClick={() => removeEntry(idx)} className="btn btn-danger btn-sm">✕</button>
              </div>
            </div>
            {editing === idx && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                {[
                  { key: 'company', label: 'Company', placeholder: 'Google' },
                  { key: 'role', label: 'Role / Title', placeholder: 'Software Engineer' },
                  { key: 'duration', label: 'Duration', placeholder: 'Jan 2022 – Present' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
                    <input type="text" value={exp[f.key] || ''} onChange={e => updateEntry(idx, f.key, e.target.value)} placeholder={f.placeholder} className="input text-sm" />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">Description / Responsibilities</label>
                  <textarea
                    value={exp.description || ''}
                    onChange={e => updateEntry(idx, 'description', e.target.value)}
                    placeholder="Led development of microservices architecture serving 10M+ daily users..."
                    className="input text-sm min-h-[100px]"
                  />
                </div>
              </div>
            )}
            {editing !== idx && exp.company && (
              <p className="text-xs text-slate-500">{exp.duration} {exp.description && `• ${exp.description.slice(0, 80)}...`}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
