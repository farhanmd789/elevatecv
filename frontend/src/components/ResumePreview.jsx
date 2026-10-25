import ClassicTemplate from './templates/ClassicTemplate'
import ModernTemplate from './templates/ModernTemplate'
import MinimalTemplate from './templates/MinimalTemplate'

export default function ResumePreview({ content, settings }) {
  const props = { content, accentColor: settings?.accentColor || '#6366f1', fontFamily: settings?.fontFamily || 'Inter' }

  return (
    <div id="resume-preview-content" className="resume-paper w-[794px] min-h-[1123px]" style={{ fontFamily: props.fontFamily }}>
      {settings?.templateName === 'Modern' && <ModernTemplate {...props} />}
      {settings?.templateName === 'Minimal' && <MinimalTemplate {...props} />}
      {(!settings?.templateName || settings?.templateName === 'Classic') && <ClassicTemplate {...props} />}
    </div>
  )
}
