import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resumeService } from '../services/services'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [duplicatingId, setDuplicatingId] = useState(null)

  useEffect(() => {
    loadResumes()
  }, [])

  const loadResumes = async () => {
    setLoading(true)
    try {
      const res = await resumeService.getAll()
      setResumes(res.data.data || [])
    } catch {
      toast.error('Failed to load resumes')
    } finally {
      setLoading(false)
    }
  }

  const [importing, setImporting] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setImporting(true)
    toast.loading('Importing and parsing resume with AI...', { id: 'import-toast' })
    try {
      const res = await resumeService.upload(formData)
      const resumeId = res.data.data.id
      toast.success('Resume imported successfully!', { id: 'import-toast' })
      navigate(`/editor/${resumeId}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to import resume', { id: 'import-toast' })
    } finally {
      setImporting(false)
    }
  }

  const handleCreate = async () => {
    try {
      const res = await resumeService.create({
        title: 'Untitled Resume',
        targetRole: '',
        content: {}
      })
      const resumeId = res.data.data.id
      navigate(`/editor/${resumeId}`)
    } catch {
      toast.error('Failed to create resume')
    }
  }

  const handleDuplicate = async (id) => {
    setDuplicatingId(id)
    try {
      const res = await resumeService.duplicate(id)
      toast.success('Resume duplicated!')
      setResumes(prev => [res.data.data, ...prev])
    } catch {
      toast.error('Failed to duplicate resume')
    } finally {
      setDuplicatingId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume? This action cannot be undone.')) return
    setDeletingId(id)
    try {
      await resumeService.delete(id)
      setResumes(prev => prev.filter(r => r.id !== id))
      toast.success('Resume deleted')
    } catch {
      toast.error('Failed to delete resume')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleVisibility = async (id, currentVisibility) => {
    try {
      const res = await resumeService.updateVisibility(id, !currentVisibility)
      setResumes(prev => prev.map(r => r.id === id ? { ...r, isPublic: res.data.data.isPublic } : r))
      toast.success(res.data.data.isPublic ? 'Portfolio made public!' : 'Portfolio set to private')
    } catch {
      toast.error('Failed to update visibility')
    }
  }

  const templateColors = { Classic: '#6366f1', Modern: '#0ea5e9', Minimal: '#10b981' }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 animate-fade-in">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-400 mt-1">
              {resumes.length === 0 ? "You haven't created any resumes yet." : `You have ${resumes.length} resume${resumes.length !== 1 ? 's' : ''}.`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="file"
              id="dashboard-upload-input"
              accept=".pdf,.txt,.json,.md"
              onChange={handleUpload}
              className="hidden"
            />
            <label
              htmlFor="dashboard-upload-input"
              id="upload-resume-pc-btn"
              className={`btn btn-secondary ${importing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {importing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <span>📁</span> Upload from PC
                </>
              )}
            </label>
            <button id="create-resume-btn" onClick={handleCreate} className="btn btn-primary">
              <span>+</span> New Resume
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Resumes', value: resumes.length },
            { label: 'Public Portfolios', value: resumes.filter(r => r.isPublic).length },
            { label: 'Templates Used', value: new Set(resumes.map(r => r.templateName)).size },
            { label: 'Last Updated', value: resumes[0] ? formatDate(resumes[0].updatedAt) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="card text-center">
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Resume Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-48">
                <div className="skeleton h-6 w-3/4 mb-3" />
                <div className="skeleton h-4 w-1/2 mb-2" />
                <div className="skeleton h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-white mb-2">No resumes yet</h3>
            <p className="text-slate-400 mb-6">Create your first AI-powered resume in minutes</p>
            <button id="create-first-resume-btn" onClick={handleCreate} className="btn btn-primary btn-lg">
              Create My First Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onEdit={() => navigate(`/editor/${resume.id}`)}
                onDuplicate={() => handleDuplicate(resume.id)}
                onDelete={() => handleDelete(resume.id)}
                onToggleVisibility={() => handleToggleVisibility(resume.id, resume.isPublic)}
                isDuplicating={duplicatingId === resume.id}
                isDeleting={deletingId === resume.id}
                templateColors={templateColors}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ResumeCard({ resume, onEdit, onDuplicate, onDelete, onToggleVisibility, isDuplicating, isDeleting, templateColors }) {
  const color = templateColors[resume.templateName] || '#6366f1'

  return (
    <div className="card group hover:border-primary-500/40 hover:-translate-y-1 transition-all duration-300">
      {/* Color bar */}
      <div className="h-1.5 -mx-6 -mt-6 mb-4 rounded-t-xl" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{resume.title}</h3>
          <p className="text-sm text-slate-400 truncate">{resume.targetRole || 'No target role'}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {resume.isPublic && <span className="badge badge-success text-xs">Public</span>}
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 mb-4 text-xs text-slate-500">
        <span className="badge badge-primary">{resume.templateName || 'Classic'}</span>
        <span>Updated {formatDate(resume.updatedAt)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
        <button
          id={`edit-resume-${resume.id}`}
          onClick={onEdit}
          className="btn btn-primary btn-sm flex-1"
        >
          Edit
        </button>
        <button
          id={`duplicate-resume-${resume.id}`}
          onClick={onDuplicate}
          disabled={isDuplicating}
          className="btn btn-secondary btn-sm"
          title="Duplicate"
        >
          {isDuplicating ? '...' : '⧉'}
        </button>
        <button
          id={`visibility-resume-${resume.id}`}
          onClick={onToggleVisibility}
          className="btn btn-secondary btn-sm"
          title={resume.isPublic ? 'Make Private' : 'Make Public'}
        >
          {resume.isPublic ? '🔓' : '🔒'}
        </button>
        <button
          id={`delete-resume-${resume.id}`}
          onClick={onDelete}
          disabled={isDeleting}
          className="btn btn-danger btn-sm"
          title="Delete"
        >
          {isDeleting ? '...' : '🗑'}
        </button>
      </div>
    </div>
  )
}
