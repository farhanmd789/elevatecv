import { useState } from 'react'
import { aiService } from '../../services/services'
import toast from 'react-hot-toast'

const emptyProject = { title: '', techStack: '', description: '', link: '' }

export default function ProjectsStep({ data, onChange, content }) {
  const projects = Array.isArray(data) ? data : []
  const [editing, setEditing] = useState(null)
  const [aiLoading, setAiLoading] = useState({})

  const addProject = () => {
    const updated = [...projects, { ...emptyProject }]
    onChange(updated)
    setEditing(updated.length - 1)
  }

  const updateProject = (idx, field, value) => {
    onChange(projects.map((p, i) => i === idx ? { ...p, [field]: value } : p))
  }

  const removeProject = (idx) => {
    onChange(projects.filter((_, i) => i !== idx))
    setEditing(null)
  }

  const handleImprove = async (idx) => {
    const project = projects[idx]
    if (!project.description) { toast.error('Add a description first'); return }
    setAiLoading(p => ({ ...p, [idx]: true }))
    try {
      const res = await aiService.improveText({
        text: project.description,
        context: `Project: ${project.title}`,
        role: 'Developer',
      })
      updateProject(idx, 'description', res.data.data)
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
          <h2 className="text-xl font-semibold text-white">Projects</h2>
          <p className="text-slate-400 text-sm mt-1">Showcase your best work</p>
        </div>
        <button id="add-project-btn" onClick={addProject} className="btn btn-primary btn-sm">+ Add</button>
      </div>

      <div className="space-y-3">
        {projects.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-white/10 rounded-xl">
            No projects yet. Click "Add" to start.
          </div>
        )}
        {projects.map((proj, idx) => (
          <div key={idx} className="card !p-4 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-300 truncate">{proj.title || `Project ${idx + 1}`}</span>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleImprove(idx)} disabled={aiLoading[idx]} className="btn btn-ai btn-sm">
                  {aiLoading[idx] ? '...' : '✨ AI'}
                </button>
                <button onClick={() => setEditing(editing === idx ? null : idx)} className="btn btn-secondary btn-sm">
                  {editing === idx ? 'Done' : 'Edit'}
                </button>
                <button onClick={() => removeProject(idx)} className="btn btn-danger btn-sm">✕</button>
              </div>
            </div>
            {editing === idx && (
              <div className="space-y-3 animate-fade-in">
                {[
                  { key: 'title', label: 'Project Title', placeholder: 'E-Commerce Platform' },
                  { key: 'techStack', label: 'Tech Stack', placeholder: 'React, Node.js, MongoDB' },
                  { key: 'link', label: 'Project URL', placeholder: 'https://github.com/...' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
                    <input type="text" value={proj[f.key] || ''} onChange={e => updateProject(idx, f.key, e.target.value)} placeholder={f.placeholder} className="input text-sm" />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Description</label>
                  <textarea
                    value={proj.description || ''}
                    onChange={e => updateProject(idx, 'description', e.target.value)}
                    placeholder="Developed a full-stack e-commerce platform with 1000+ products..."
                    className="input text-sm min-h-[100px]"
                  />
                </div>
              </div>
            )}
            {editing !== idx && proj.title && (
              <p className="text-xs text-slate-500 truncate">{proj.techStack} {proj.description && `• ${proj.description.slice(0, 60)}...`}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
