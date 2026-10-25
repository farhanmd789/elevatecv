import { useState } from 'react'

function TagInput({ tags, onChange, placeholder, id }) {
  const [input, setInput] = useState('')

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      const tag = input.trim().replace(/,$/, '')
      if (tag && !tags.includes(tag)) {
        onChange([...tags, tag])
      }
      setInput('')
    }
  }

  const removeTag = (tag) => onChange(tags.filter(t => t !== tag))

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span key={tag} className="tag-pill">
            {tag}
            <button onClick={() => removeTag(tag)} className="text-primary-400 hover:text-red-400 ml-1 text-xs">✕</button>
          </span>
        ))}
      </div>
      <input
        id={id}
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={addTag}
        placeholder={placeholder || 'Type and press Enter'}
        className="input text-sm"
      />
      <p className="text-xs text-slate-500 mt-1">Press Enter or comma to add</p>
    </div>
  )
}

export default function SkillsStep({ data, onChange }) {
  const skills = data || { technical: [], soft: [] }
  const update = (type, value) => onChange({ ...skills, [type]: value })

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">Skills</h2>
        <p className="text-slate-400 text-sm mt-1">Your technical expertise and soft skills</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            💻 Technical Skills
          </label>
          <TagInput
            id="technical-skills-input"
            tags={skills.technical || []}
            onChange={v => update('technical', v)}
            placeholder="e.g. React, Python, Docker..."
          />
        </div>

        <div className="section-divider" />

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            🤝 Soft Skills
          </label>
          <TagInput
            id="soft-skills-input"
            tags={skills.soft || []}
            onChange={v => update('soft', v)}
            placeholder="e.g. Leadership, Communication..."
          />
        </div>
      </div>
    </div>
  )
}
