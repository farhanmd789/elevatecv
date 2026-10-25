import { useState } from 'react'

function ListEditor({ items, onChange, placeholder, id }) {
  const [input, setInput] = useState('')

  const add = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      if (!items.includes(input.trim())) onChange([...items, input.trim()])
      setInput('')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item, i) => (
          <span key={i} className="tag-pill">
            {item}
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-primary-400 hover:text-red-400 ml-1 text-xs">✕</button>
          </span>
        ))}
      </div>
      <input id={id} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={add} placeholder={placeholder} className="input text-sm" />
      <p className="text-xs text-slate-500 mt-1">Press Enter to add</p>
    </div>
  )
}

export default function CertificationsStep({ certifications, languages, onChangeCerts, onChangeLangs }) {
  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">Certifications & Extras</h2>
        <p className="text-slate-400 text-sm mt-1">Achievements, certifications, and languages</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">🏆 Certifications & Achievements</label>
          <ListEditor
            id="certifications-input"
            items={certifications || []}
            onChange={onChangeCerts}
            placeholder="e.g. AWS Certified Solutions Architect"
          />
        </div>

        <div className="section-divider" />

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">🌍 Languages</label>
          <ListEditor
            id="languages-input"
            items={languages || []}
            onChange={onChangeLangs}
            placeholder="e.g. English, Spanish, French"
          />
        </div>
      </div>
    </div>
  )
}
