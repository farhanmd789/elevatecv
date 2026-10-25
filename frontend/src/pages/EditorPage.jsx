import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resumeService, aiService } from '../services/services'
import toast from 'react-hot-toast'
import ResumePreview from '../components/ResumePreview'
import PersonalInfoStep from '../components/editor/PersonalInfoStep'
import SummaryStep from '../components/editor/SummaryStep'
import EducationStep from '../components/editor/EducationStep'
import SkillsStep from '../components/editor/SkillsStep'
import ProjectsStep from '../components/editor/ProjectsStep'
import ExperienceStep from '../components/editor/ExperienceStep'
import CertificationsStep from '../components/editor/CertificationsStep'

const STEPS = [
  { id: 'personalInfo', label: 'Personal', icon: '👤' },
  { id: 'summary', label: 'Summary', icon: '📝' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'skills', label: 'Skills', icon: '💡' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'certifications', label: 'Extra', icon: '🏆' },
]

const TEMPLATES = ['Classic', 'Modern', 'Minimal']
const FONTS = ['Inter', 'Georgia', 'Roboto']
const ACCENT_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6']

const defaultContent = {
  personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '' },
  summary: '',
  education: [],
  skills: { technical: [], soft: [] },
  projects: [],
  experience: [],
  certifications: [],
  languages: ['English'],
}

export default function EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resume, setResume] = useState(null)
  const [content, setContent] = useState(defaultContent)
  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [previewTab, setPreviewTab] = useState('form') // 'form' | 'preview' on mobile
  const [settings, setSettings] = useState({ title: '', targetRole: '', templateName: 'Classic', accentColor: '#6366f1', fontFamily: 'Inter' })
  const [showSettings, setShowSettings] = useState(false)
  const [aiLoading, setAiLoading] = useState({})
  const autoSaveTimer = useRef(null)

  useEffect(() => {
    loadResume()
    return () => clearTimeout(autoSaveTimer.current)
  }, [id])

  const loadResume = async () => {
    if (!id || id === 'new') {
      setResume({ id: null, title: 'Untitled Resume' })
      setSettings({
        title: 'Untitled Resume',
        targetRole: '',
        templateName: 'Classic',
        accentColor: '#6366f1',
        fontFamily: 'Inter',
      })
      setContent(defaultContent)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await resumeService.getById(id)
      const data = res.data.data
      setResume(data)
      setSettings({
        title: data.title || 'Untitled Resume',
        targetRole: data.targetRole || '',
        templateName: data.templateName || 'Classic',
        accentColor: data.accentColor || '#6366f1',
        fontFamily: data.fontFamily || 'Inter',
      })
      setContent({
        ...defaultContent,
        ...(data.content || {}),
        personalInfo: {
          ...defaultContent.personalInfo,
          ...(data.content?.personalInfo || {}),
        },
        skills: {
          technical: data.content?.skills?.technical || [],
          soft: data.content?.skills?.soft || [],
        },
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load resume')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const updateContent = useCallback((section, value) => {
    setContent(prev => {
      const updated = { ...prev, [section]: value }
      clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = setTimeout(() => {
        autoSave(updated)
      }, 2000)
      return updated
    })
  }, [id, settings, resume])

  const autoSave = async (contentToSave) => {
    if (!id || id === 'new' || !resume?.id) return
    setSaving(true)
    try {
      const payload = {
        ...settings,
        title: settings.title?.trim() || resume?.title || 'Untitled Resume',
        content: contentToSave,
      }
      await resumeService.update(id, payload)
    } catch {
      // Silent fail for auto-save
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      ...settings,
      title: settings.title?.trim() || resume?.title || 'Untitled Resume',
      content,
    }
    try {
      if (!id || id === 'new' || !resume?.id) {
        const res = await resumeService.create(payload)
        const newResume = res.data.data
        setResume(newResume)
        toast.success('Resume created & saved!')
        navigate(`/editor/${newResume.id}`, { replace: true })
      } else {
        const res = await resumeService.update(id, payload)
        if (res.data?.data) {
          setResume(res.data.data)
        }
        toast.success('Resume saved!')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save resume')
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadPDF = async () => {
    const { default: html2pdf } = await import('html2pdf.js')
    const element = document.getElementById('resume-preview-content')
    if (!element) { toast.error('Preview not found'); return }
    const opt = {
      margin: 0,
      filename: `${settings.title || 'resume'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }
    toast.loading('Generating PDF...')
    html2pdf().set(opt).from(element).save().then(() => {
      toast.dismiss()
      toast.success('PDF downloaded!')
    })
  }

  // AI Handlers
  const handleAiSummary = async () => {
    setAiLoading(p => ({ ...p, summary: true }))
    try {
      const res = await aiService.generateSummary({
        targetRole: settings.targetRole || 'Professional',
        currentSummary: content.summary,
        resumeContent: content,
      })
      const generated = res.data.data
      updateContent('summary', generated)
      toast.success('Summary generated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI failed. Please try again.')
    } finally {
      setAiLoading(p => ({ ...p, summary: false }))
    }
  }

  const handleAiGenerateResume = async () => {
    const targetRole = settings.targetRole || prompt('Enter your target job role:')
    if (!targetRole) return
    setAiLoading(p => ({ ...p, generate: true }))
    try {
      const res = await aiService.generateResume({ targetRole })
      const generated = res.data.data
      setContent(prev => ({ ...prev, ...generated }))
      toast.success('Resume generated by AI! Review and customize.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI failed. Please try again.')
    } finally {
      setAiLoading(p => ({ ...p, generate: false }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentStepId = STEPS[currentStep].id

  return (
    <div className="min-h-screen bg-surface-950 pt-16">
      {/* Top Bar */}
      <div className="glass border-b border-white/5 sticky top-16 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary btn-sm shrink-0">
              ← Dashboard
            </button>
            <div className="hidden sm:flex items-center gap-2 min-w-0">
              <input
                value={settings.title}
                onChange={e => setSettings(p => ({ ...p, title: e.target.value }))}
                className="bg-transparent text-white font-semibold text-sm focus:outline-none border-b border-transparent hover:border-white/20 focus:border-primary-500 transition-all w-48"
                placeholder="Resume Title"
                id="resume-title-input"
              />
              {saving && <span className="text-xs text-slate-500 animate-pulse">Saving...</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Generate Full Resume */}
            <button
              id="ai-generate-resume-btn"
              onClick={handleAiGenerateResume}
              disabled={aiLoading.generate}
              className="btn btn-ai btn-sm"
            >
              {aiLoading.generate ? <span className="animate-spin">⟳</span> : '✨'} AI Generate
            </button>

            <button
              id="settings-btn"
              onClick={() => setShowSettings(!showSettings)}
              className="btn btn-secondary btn-sm"
            >
              ⚙
            </button>

            <button onClick={handleSave} disabled={saving} className="btn btn-secondary btn-sm">
              {saving ? '...' : 'Save'}
            </button>

            <button id="download-pdf-btn" onClick={handleDownloadPDF} className="btn btn-primary btn-sm">
              ⬇ PDF
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-t border-white/5 px-4 py-4 animate-fade-in">
            <div className="max-w-screen-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Target Role</label>
                <input
                  value={settings.targetRole}
                  onChange={e => setSettings(p => ({ ...p, targetRole: e.target.value }))}
                  className="input text-sm"
                  placeholder="e.g. Software Engineer"
                  id="target-role-input"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Template</label>
                <div className="flex gap-2">
                  {TEMPLATES.map(t => (
                    <button
                      key={t}
                      onClick={() => setSettings(p => ({ ...p, templateName: t }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${settings.templateName === t ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Accent Color</label>
                <div className="flex gap-1.5 flex-wrap">
                  {ACCENT_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setSettings(p => ({ ...p, accentColor: c }))}
                      className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${settings.accentColor === c ? 'ring-2 ring-white ring-offset-1 ring-offset-surface-900 scale-110' : ''}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Font</label>
                <div className="flex gap-2">
                  {FONTS.map(f => (
                    <button
                      key={f}
                      onClick={() => setSettings(p => ({ ...p, fontFamily: f }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${settings.fontFamily === f ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b border-white/5 sticky top-[calc(4rem+57px)] z-30 glass">
        <button
          onClick={() => setPreviewTab('form')}
          className={`flex-1 py-2.5 text-sm font-medium transition-all ${previewTab === 'form' ? 'text-primary-400 border-b-2 border-primary-500' : 'text-slate-500'}`}
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => setPreviewTab('preview')}
          className={`flex-1 py-2.5 text-sm font-medium transition-all ${previewTab === 'preview' ? 'text-primary-400 border-b-2 border-primary-500' : 'text-slate-500'}`}
        >
          👁 Preview
        </button>
      </div>

      <div className="max-w-screen-2xl mx-auto flex h-[calc(100vh-130px)]">
        {/* Form Side */}
        <div className={`w-full lg:w-1/2 overflow-y-auto ${previewTab === 'preview' ? 'hidden lg:block' : ''}`}>
          {/* Step Navigation */}
          <div className="flex overflow-x-auto gap-1 p-4 pb-0 no-scrollbar">
            {STEPS.map((step, i) => (
              <button
                key={step.id}
                id={`step-${step.id}`}
                onClick={() => setCurrentStep(i)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  i === currentStep ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' :
                  'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <span>{step.icon}</span>
                {step.label}
              </button>
            ))}
          </div>

          {/* Step Content */}
          <div className="p-4 pt-3">
            {currentStepId === 'personalInfo' && (
              <PersonalInfoStep data={content.personalInfo} onChange={v => updateContent('personalInfo', v)} />
            )}
            {currentStepId === 'summary' && (
              <SummaryStep
                data={content.summary}
                onChange={v => updateContent('summary', v)}
                onAiGenerate={handleAiSummary}
                aiLoading={aiLoading.summary}
              />
            )}
            {currentStepId === 'education' && (
              <EducationStep data={content.education} onChange={v => updateContent('education', v)} />
            )}
            {currentStepId === 'skills' && (
              <SkillsStep data={content.skills} onChange={v => updateContent('skills', v)} content={content} />
            )}
            {currentStepId === 'projects' && (
              <ProjectsStep data={content.projects} onChange={v => updateContent('projects', v)} content={content} />
            )}
            {currentStepId === 'experience' && (
              <ExperienceStep data={content.experience} onChange={v => updateContent('experience', v)} content={content} />
            )}
            {currentStepId === 'certifications' && (
              <CertificationsStep
                certifications={content.certifications}
                languages={content.languages}
                onChangeCerts={v => updateContent('certifications', v)}
                onChangeLangs={v => updateContent('languages', v)}
              />
            )}

            {/* Step Navigation Buttons */}
            <div className="flex justify-between mt-6 pt-4 border-t border-white/5">
              <button
                onClick={() => setCurrentStep(p => Math.max(0, p - 1))}
                disabled={currentStep === 0}
                className="btn btn-secondary btn-sm"
              >
                ← Previous
              </button>
              {currentStep < STEPS.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(p => p + 1)}
                  className="btn btn-primary btn-sm"
                >
                  Next →
                </button>
              ) : (
                <button onClick={handleSave} className="btn btn-primary btn-sm">
                  💾 Save Resume
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-white/5 shrink-0" />

        {/* Preview Side */}
        <div className={`w-full lg:w-1/2 overflow-y-auto bg-surface-950 p-6 ${previewTab === 'form' ? 'hidden lg:block' : ''}`}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-400">Live Preview</h3>
            <button id="download-pdf-btn-preview" onClick={handleDownloadPDF} className="btn btn-secondary btn-sm">
              ⬇ Download PDF
            </button>
          </div>
          <div className="transform origin-top scale-[0.85] lg:scale-90 xl:scale-100">
            <ResumePreview content={content} settings={settings} />
          </div>
        </div>
      </div>
    </div>
  )
}
