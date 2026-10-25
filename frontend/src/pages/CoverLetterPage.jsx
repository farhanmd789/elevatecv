import { useState, useEffect } from 'react'
import { aiService, resumeService } from '../services/services'
import toast from 'react-hot-toast'

export default function CoverLetterPage() {
  const [resumes, setResumes] = useState([])
  const [loadingResumes, setLoadingResumes] = useState(false)
  const [resumeSource, setResumeSource] = useState('saved') // 'saved' | 'upload' | 'paste'
  const [resumeId, setResumeId] = useState('')
  const [resumeContent, setResumeContent] = useState(null)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [uploadedResumeText, setUploadedResumeText] = useState('')
  const [pastedResumeText, setPastedResumeText] = useState('')
  const [extracting, setExtracting] = useState(false)

  const [form, setForm] = useState({ companyName: '', hiringManagerName: '', jobDescription: '' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

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
    if (!id) {
      setResumeContent(null)
      return
    }
    try {
      const res = await resumeService.getById(id)
      setResumeContent(res.data.data.content)
      toast.success(`Selected "${res.data.data.title}"`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load resume details')
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFileName(file.name)
    setExtracting(true)

    // For plain text files, read on client
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

    // For PDF and other documents, extract on backend via Apache PDFBox
    const formData = new FormData()
    formData.append('file', file)

    try {
      toast.loading('Extracting text from resume...', { id: 'extract-toast' })
      const res = await aiService.extractText(formData)
      const text = res.data.data || ''
      setUploadedResumeText(text)
      toast.success(`Extracted text from ${file.name}`, { id: 'extract-toast' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to extract text from file', { id: 'extract-toast' })
    } finally {
      setExtracting(false)
    }
  }

  const handleGenerate = async () => {
    if (!form.companyName.trim()) {
      toast.error('Company name is required')
      return
    }
    if (!form.jobDescription.trim()) {
      toast.error('Job description is required')
      return
    }

    let payload = {
      companyName: form.companyName.trim(),
      hiringManagerName: form.hiringManagerName.trim() || undefined,
      jobDescription: form.jobDescription.trim(),
    }

    if (resumeSource === 'saved') {
      if (resumeContent) {
        payload.resumeContent = resumeContent
      }
    } else if (resumeSource === 'upload') {
      if (uploadedResumeText) {
        payload.resumeText = uploadedResumeText
      }
    } else if (resumeSource === 'paste') {
      if (pastedResumeText.trim()) {
        payload.resumeText = pastedResumeText.trim()
      }
    }

    setLoading(true)
    setResult('')
    try {
      const res = await aiService.generateCoverLetter(payload)
      setResult(res.data.data)
      toast.success('Cover letter generated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="text-5xl mb-4">✉️</div>
          <h1 className="text-4xl font-display font-bold text-white mb-3">
            Cover Letter <span className="gradient-text">Generator</span>
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Generate a targeted, high-impact cover letter tailored to your resume and the target company.
          </p>
        </div>

        {/* 1. Resume Source Card */}
        <div className="card mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 mb-4 gap-3">
            <div>
              <h3 className="font-semibold text-white">1. Your Resume (Optional)</h3>
              <p className="text-xs text-slate-400">Select a saved resume, upload a PDF/TXT, or paste text</p>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-surface-900 rounded-lg border border-white/5 text-xs self-start sm:self-auto">
              <button
                type="button"
                id="tab-cover-saved"
                onClick={() => setResumeSource('saved')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  resumeSource === 'saved' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Saved Resumes
              </button>
              <button
                type="button"
                id="tab-cover-upload"
                onClick={() => setResumeSource('upload')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  resumeSource === 'upload' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                📁 Upload from PC
              </button>
              <button
                type="button"
                id="tab-cover-paste"
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
                Choose from your resumes
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
                    id="cover-letter-resume-select"
                    value={resumeId}
                    onChange={e => handleSelectResume(e.target.value)}
                    className="input font-medium"
                  >
                    <option value="">— No resume selected (Generic cover letter) —</option>
                    {resumes.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.title} {r.targetRole ? `(${r.targetRole})` : ''}
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
                  ✓ Resume loaded and ready to personalize your cover letter
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
                  id="cover-resume-file-input"
                  accept=".pdf,.txt,.json,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="cover-resume-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center text-2xl">
                    📄
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white hover:text-primary-400 underline">
                      Click to choose file
                    </span>
                    <span className="text-xs text-slate-400"> or drag and drop</span>
                  </div>
                  <span className="text-xs text-slate-500">Supports PDF, TXT files</span>
                </label>
              </div>

              {extracting && (
                <div className="mt-3 flex items-center gap-2 text-xs text-primary-400 animate-pulse">
                  <span className="w-3.5 h-3.5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                  Extracting text from resume...
                </div>
              )}

              {uploadedFileName && !extracting && (
                <div className="mt-3 p-3 bg-white/5 rounded-lg flex items-center justify-between border border-white/10">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-green-400">✓</span>
                    <span className="text-white font-medium">{uploadedFileName}</span>
                    <span className="text-slate-400">({uploadedResumeText.length} characters extracted)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setUploadedFileName(''); setUploadedResumeText('') }}
                    className="text-xs text-slate-400 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Paste Text */}
          {resumeSource === 'paste' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Paste your resume text
              </label>
              <textarea
                id="cover-pasted-resume-text"
                rows={6}
                value={pastedResumeText}
                onChange={e => setPastedResumeText(e.target.value)}
                placeholder="Paste your resume experience, skills, and summary here..."
                className="input font-mono text-xs leading-relaxed"
              />
              {pastedResumeText && (
                <p className="text-xs text-slate-400 mt-1">
                  {pastedResumeText.trim().split(/\s+/).length} words ready for cover letter
                </p>
              )}
            </div>
          )}
        </div>

        {/* 2. Company & Job Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="card">
            <h3 className="font-semibold text-white mb-3">2. Company Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Company Name *</label>
                <input
                  id="company-name-input"
                  type="text"
                  value={form.companyName}
                  onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
                  placeholder="e.g. Google, Stripe, Microsoft"
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Hiring Manager Name (Optional)</label>
                <input
                  id="hiring-manager-input"
                  type="text"
                  value={form.hiringManagerName}
                  onChange={e => setForm(p => ({ ...p, hiringManagerName: e.target.value }))}
                  placeholder="e.g. Sarah Jenkins (leave blank if unknown)"
                  className="input text-sm"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-white mb-3">3. Job Description *</h3>
            <textarea
              id="cover-letter-job-desc"
              value={form.jobDescription}
              onChange={e => setForm(p => ({ ...p, jobDescription: e.target.value }))}
              placeholder="Paste the full job description or key responsibilities here..."
              className="input text-sm min-h-[140px]"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-8">
          <button
            id="generate-cover-letter-btn"
            onClick={handleGenerate}
            disabled={loading || extracting}
            className="btn btn-ai btn-lg"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Crafting Cover Letter with AI...
              </>
            ) : '✨ Generate Cover Letter'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="card animate-fade-in">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div>
                <h3 className="font-semibold text-white">Your Tailored Cover Letter</h3>
                <p className="text-xs text-slate-400">Generated for {form.companyName}</p>
              </div>
              <button id="copy-cover-letter-btn" onClick={handleCopy} className="btn btn-secondary btn-sm">
                📋 Copy to Clipboard
              </button>
            </div>
            <div
              id="cover-letter-result"
              className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap bg-white/[0.03] rounded-xl p-6 border border-white/10 font-sans shadow-inner"
            >
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
