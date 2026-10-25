import { useState, useEffect } from 'react'
import { aiService, resumeService } from '../services/services'
import toast from 'react-hot-toast'

export default function AtsCheckerPage() {
  const [jobDescription, setJobDescription] = useState('')
  const [resumeSource, setResumeSource] = useState('saved') // 'saved' | 'upload' | 'paste'
  const [resumeId, setResumeId] = useState('')
  const [resumes, setResumes] = useState([])
  const [resumeContent, setResumeContent] = useState(null)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [uploadedResumeText, setUploadedResumeText] = useState('')
  const [pastedResumeText, setPastedResumeText] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingResumes, setLoadingResumes] = useState(false)

  useEffect(() => {
    loadResumes()
  }, [])

  const loadResumes = async () => {
    setLoadingResumes(true)
    try {
      const res = await resumeService.getAll()
      setResumes(res.data.data || [])
    } catch {
      toast.error('Failed to load resumes')
    } finally {
      setLoadingResumes(false)
    }
  }

  const handleSelectResume = async (id) => {
    setResumeId(id)
    if (!id) { setResumeContent(null); return }
    try {
      const res = await resumeService.getById(id)
      setResumeContent(res.data.data.content)
    } catch {
      toast.error('Failed to load resume details')
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFileName(file.name)
    setExtracting(true)

    // If it's plain text or json, read client side immediately
    if (file.name.endsWith('.txt') || file.name.endsWith('.json') || file.name.endsWith('.md')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedResumeText(event.target.result)
        setExtracting(false)
        toast.success(`Loaded text from ${file.name}`)
      }
      reader.onerror = () => {
        setExtracting(false)
        toast.error('Failed to read file')
      }
      reader.readAsText(file)
      return
    }

    // For PDF and other formats, extract on backend via PDFBox
    const formData = new FormData()
    formData.append('file', file)

    try {
      toast.loading('Extracting text from PDF...', { id: 'extract-toast' })
      const res = await aiService.extractText(formData)
      const text = res.data.data || ''
      setUploadedResumeText(text)
      toast.success(`Successfully extracted ${text.length} characters from ${file.name}`, { id: 'extract-toast' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to extract text from PDF', { id: 'extract-toast' })
    } finally {
      setExtracting(false)
    }
  }

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please paste a job description')
      return
    }

    let payload = { jobDescription }

    if (resumeSource === 'saved') {
      if (!resumeContent && !resumeId) {
        toast.error('Please select a resume or choose another input option')
        return
      }
      payload.resumeContent = resumeContent || {}
    } else if (resumeSource === 'upload') {
      if (!uploadedResumeText.trim()) {
        toast.error('Please upload a resume file from your PC first')
        return
      }
      payload.resumeText = uploadedResumeText
    } else if (resumeSource === 'paste') {
      if (!pastedResumeText.trim()) {
        toast.error('Please paste your resume text')
        return
      }
      payload.resumeText = pastedResumeText
    }

    setLoading(true)
    setResult(null)
    try {
      const res = await aiService.getAtsScore(payload)
      setResult(res.data.data)
      toast.success('ATS analysis complete!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = (score) => {
    if (score >= 75) return '#22c55e'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="text-5xl mb-4">📊</div>
          <h1 className="text-4xl font-display font-bold text-white mb-3">
            ATS Score <span className="gradient-text">Checker</span>
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Compare your resume against any job description to get your match score, keyword audit, and tailored improvement advice.
          </p>
        </div>

        {/* Source Tabs */}
        <div className="card mb-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <h3 className="font-semibold text-white">1. Choose Resume Source</h3>
            <div className="flex items-center gap-1.5 p-1 bg-surface-900 rounded-lg border border-white/5 text-xs">
              <button
                type="button"
                onClick={() => setResumeSource('saved')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  resumeSource === 'saved' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Saved Resumes
              </button>
              <button
                type="button"
                id="tab-upload-from-pc"
                onClick={() => setResumeSource('upload')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  resumeSource === 'upload' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                📁 Upload from PC
              </button>
              <button
                type="button"
                onClick={() => setResumeSource('paste')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  resumeSource === 'paste' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                📋 Paste Text
              </button>
            </div>
          </div>

          {/* Tab 1: Saved Resumes */}
          {resumeSource === 'saved' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Select from your built resumes
              </label>
              {loadingResumes ? (
                <div className="skeleton h-12 w-full" />
              ) : resumes.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-white/15 text-center text-sm text-slate-400 bg-white/[0.02]">
                  No resumes found. Please create one on the Dashboard or choose "Upload from PC".
                </div>
              ) : (
                <div className="space-y-3">
                  <select
                    id="ats-resume-select"
                    value={resumeId}
                    onChange={e => handleSelectResume(e.target.value)}
                    className="input font-medium"
                  >
                    <option value="">— Choose a resume —</option>
                    {resumes.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.targetRole || 'General'})
                      </option>
                    ))}
                  </select>

                  {/* Visual Clickable Field Boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {resumes.map(r => {
                      const isSelected = String(resumeId) === String(r.id)
                      return (
                        <div
                          key={r.id}
                          onClick={() => handleSelectResume(r.id)}
                          className={`cursor-pointer rounded-xl p-3.5 border-2 transition-all flex items-center justify-between gap-3 shadow-md ${
                            isSelected
                              ? 'bg-primary-600/25 border-primary-500 ring-2 ring-primary-500/40 scale-[1.01]'
                              : 'bg-surface-900/90 border-white/15 hover:border-primary-400/50 hover:bg-surface-800'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📄</span>
                              <p className="font-semibold text-white text-sm truncate">{r.title}</p>
                            </div>
                            <p className="text-xs text-slate-300 mt-1 truncate">
                              {r.targetRole ? `Role: ${r.targetRole}` : 'General Role'}
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-primary-400 bg-primary-500 text-white text-xs font-bold' : 'border-white/30 bg-white/5'
                          }`}>
                            {isSelected ? '✓' : ''}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {resumeContent && (
                <p className="text-xs text-green-400 mt-3 flex items-center gap-1.5 font-medium bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20 w-fit">
                  ✓ Resume content loaded ({Object.keys(resumeContent).length} sections ready)
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Upload from PC */}
          {resumeSource === 'upload' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Upload resume file from your computer (PDF or TXT)
              </label>
              <div className="border-2 border-dashed border-white/10 hover:border-primary-500/50 rounded-xl p-6 text-center transition-all bg-white/[0.02]">
                <input
                  type="file"
                  id="resume-file-input"
                  accept=".pdf,.txt,.json,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="resume-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 text-2xl">
                    📤
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-primary-400 hover:underline">
                      Click to choose a file
                    </span>
                    <span className="text-sm text-slate-400"> or drag and drop</span>
                  </div>
                  <p className="text-xs text-slate-500">PDF, TXT, MD, or JSON (max 10MB)</p>
                </label>
              </div>

              {extracting && (
                <div className="mt-3 flex items-center gap-2 text-xs text-primary-400">
                  <span className="w-3.5 h-3.5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                  Extracting text from {uploadedFileName}...
                </div>
              )}

              {uploadedResumeText && (
                <div className="mt-4 p-3.5 bg-surface-900 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-green-400 flex items-center gap-1">
                      ✓ {uploadedFileName} ready for ATS analysis ({uploadedResumeText.length} chars)
                    </span>
                    <button
                      type="button"
                      onClick={() => { setUploadedFileName(''); setUploadedResumeText('') }}
                      className="text-xs text-slate-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 font-mono line-clamp-3 bg-black/20 p-2 rounded">
                    {uploadedResumeText}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Paste Text */}
          {resumeSource === 'paste' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Paste your current resume content
              </label>
              <textarea
                id="paste-resume-textarea"
                value={pastedResumeText}
                onChange={e => setPastedResumeText(e.target.value)}
                placeholder="Paste the full text of your resume here (experience, skills, education, etc.)..."
                className="input min-h-[140px]"
              />
            </div>
          )}
        </div>

        {/* Job Description Input & Action */}
        <div className="card mb-6 animate-fade-in">
          <h3 className="font-semibold text-white mb-3">2. Paste Target Job Description</h3>
          <textarea
            id="job-description-textarea"
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste the target job description or requirements here..."
            className="input min-h-[160px] mb-4"
          />

          <div className="flex justify-end">
            <button
              id="ats-analyze-btn"
              onClick={handleAnalyze}
              disabled={loading || extracting || !jobDescription.trim()}
              className="btn btn-ai btn-lg"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing ATS Compatibility...
                </>
              ) : '🔍 Analyze Resume & Match Score'}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="animate-fade-in space-y-5">
            {/* Score Circle Card */}
            <div className="card text-center p-8 glow-sm">
              <div
                style={{
                  width: '130px',
                  height: '130px',
                  borderRadius: '50%',
                  border: `8px solid ${scoreColor(result.score)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  margin: '0 auto 16px',
                  boxShadow: `0 0 35px ${scoreColor(result.score)}40`,
                }}
              >
                <span className="text-4xl font-extrabold text-white">{result.score}</span>
                <span className="text-xs text-slate-400 font-semibold tracking-wide">/ 100</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {result.score >= 75 ? '🎉 Outstanding Match!' : result.score >= 50 ? '⚡ Good Potential' : '⚠️ Low ATS Match'}
              </h3>
              <p className="text-slate-300 text-sm max-w-lg mx-auto leading-relaxed">{result.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Strengths */}
              <div className="card">
                <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                  ✅ Matching Strengths
                </h4>
                <ul className="space-y-2">
                  {result.strengths?.map((s, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                  {(!result.strengths || result.strengths.length === 0) && (
                    <li className="text-xs text-slate-500 italic">No specific strengths identified.</li>
                  )}
                </ul>
              </div>

              {/* Missing Keywords */}
              <div className="card">
                <h4 className="font-semibold text-yellow-400 mb-3 text-sm uppercase tracking-wider">
                  🔑 Missing Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords?.map((kw, i) => (
                    <span
                      key={i}
                      className="tag-pill bg-yellow-500/10 border-yellow-500/30 text-yellow-300 text-xs py-1"
                    >
                      {kw}
                    </span>
                  ))}
                  {(!result.missingKeywords || result.missingKeywords.length === 0) && (
                    <span className="text-xs text-slate-500 italic">No missing keywords!</span>
                  )}
                </div>
              </div>

              {/* Actionable Improvements */}
              <div className="card">
                <h4 className="font-semibold text-primary-400 mb-3 text-sm uppercase tracking-wider">
                  💡 Actionable Tips
                </h4>
                <ul className="space-y-2">
                  {result.improvements?.map((tip, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-primary-400 mt-0.5">→</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                  {(!result.improvements || result.improvements.length === 0) && (
                    <li className="text-xs text-slate-500 italic">Resume looks well aligned.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
