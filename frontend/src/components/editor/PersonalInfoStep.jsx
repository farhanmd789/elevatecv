export default function PersonalInfoStep({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value })

  const fields = [
    { key: 'fullName', label: 'Full Name', placeholder: 'John Doe', type: 'text', required: true },
    { key: 'email', label: 'Email', placeholder: 'john@example.com', type: 'email' },
    { key: 'phone', label: 'Phone', placeholder: '+1 (555) 000-0000', type: 'tel' },
    { key: 'location', label: 'Location', placeholder: 'San Francisco, CA', type: 'text' },
    { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'linkedin.com/in/johndoe', type: 'url' },
    { key: 'github', label: 'GitHub URL', placeholder: 'github.com/johndoe', type: 'url' },
    { key: 'portfolio', label: 'Portfolio URL', placeholder: 'johndoe.dev', type: 'url' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">Personal Information</h2>
        <p className="text-slate-400 text-sm mt-1">Your contact details and online presence</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key} className={f.key === 'fullName' ? 'sm:col-span-2' : ''}>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {f.label} {f.required && <span className="text-red-400">*</span>}
            </label>
            <input
              id={`personal-${f.key}`}
              type={f.type}
              value={data?.[f.key] || ''}
              onChange={e => update(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="input text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
