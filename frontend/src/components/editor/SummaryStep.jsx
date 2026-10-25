export default function SummaryStep({ data, onChange, onAiGenerate, aiLoading }) {
  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Professional Summary</h2>
          <p className="text-slate-400 text-sm mt-1">A compelling 3-5 sentence pitch about yourself</p>
        </div>
        <button
          id="ai-summary-btn"
          onClick={onAiGenerate}
          disabled={aiLoading}
          className="btn btn-ai btn-sm shrink-0"
        >
          {aiLoading ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : '✨ AI Generate'}
        </button>
      </div>

      <textarea
        id="summary-textarea"
        value={data || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="Results-driven Software Engineer with 3+ years of experience building scalable web applications..."
        className="input min-h-[160px]"
        rows={6}
      />
      <p className="text-xs text-slate-500 mt-2">
        {data?.length || 0} characters • Recommended: 300-600 characters
      </p>
    </div>
  )
}
