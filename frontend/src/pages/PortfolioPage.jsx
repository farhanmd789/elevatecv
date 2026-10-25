import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { portfolioService } from '../services/services'
import ResumePreview from '../components/ResumePreview'
import toast from 'react-hot-toast'

export default function PortfolioPage() {
  const { username } = useParams()
  const [resumes, setResumes] = useState([])
  const [selectedResume, setSelectedResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    loadPortfolio()
  }, [username])

  const loadPortfolio = async () => {
    setLoading(true)
    try {
      const res = await portfolioService.getPublic(username)
      const data = res.data.data || []
      setResumes(data)
      if (data.length > 0) {
        setSelectedResume(data[0])
      }
    } catch {
      toast.error('Failed to load portfolio')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!selectedResume) return
    setDownloading(true)
    try {
      const { default: html2pdf } = await import('html2pdf.js')
      const element = document.getElementById('resume-preview-content')
      if (!element) {
        toast.error('Preview element not found')
        return
      }
      const opt = {
        margin: 0,
        filename: `${selectedResume.title || `${username}-resume`}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }
      toast.loading('Preparing PDF download...')
      await html2pdf().set(opt).from(element).save()
      toast.dismiss()
      toast.success('Downloaded successfully!')
    } catch {
      toast.dismiss()
      toast.error('Failed to generate PDF')
    } finally {
      setDownloading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Portfolio link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="card mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg glow-sm">
                {username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-display font-bold text-white">@{username}</h1>
                  <span className="badge badge-success text-xs">Public Portfolio</span>
                </div>
                <p className="text-slate-400 text-sm mt-1">
                  {resumes.length} published resume{resumes.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="share-portfolio-btn"
                onClick={handleCopyLink}
                className="btn btn-secondary btn-sm"
              >
                🔗 Share Link
              </button>
              {selectedResume && (
                <button
                  id="download-portfolio-pdf-btn"
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="btn btn-primary btn-sm"
                >
                  📥 Download PDF
                </button>
              )}
            </div>
          </div>
        </div>

        {resumes.length === 0 ? (
          <div className="card text-center py-16 animate-fade-in">
            <div className="text-5xl mb-4">📂</div>
            <h2 className="text-xl font-bold text-white mb-2">No public resumes found</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
              This user hasn't published any resumes yet or the profile might be private.
            </p>
            <Link to="/" className="btn btn-primary">
              Build Your Own Resume
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in">
            {/* Resume selector sidebar */}
            <div className="lg:col-span-1 space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                Published Resumes
              </h3>
              {resumes.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedResume(r)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedResume?.id === r.id
                      ? 'bg-primary-500/15 border-primary-500/40 text-white shadow-lg'
                      : 'glass border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="font-semibold text-sm truncate">{r.title}</div>
                  <div className="text-xs text-slate-400 mt-1 truncate">{r.targetRole || 'General'}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge badge-primary text-[10px] py-0.5">{r.templateName || 'Classic'}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Preview Area */}
            <div className="lg:col-span-3 flex justify-center">
              {selectedResume && (
                <div className="overflow-x-auto w-full flex justify-center bg-surface-900/50 p-6 rounded-2xl border border-white/5">
                  <div className="shadow-2xl rounded-sm scale-90 sm:scale-100 origin-top">
                    <ResumePreview
                      content={selectedResume.content}
                      settings={{
                        templateName: selectedResume.templateName,
                        accentColor: selectedResume.accentColor,
                        fontFamily: selectedResume.fontFamily,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
