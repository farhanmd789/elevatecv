export default function MinimalTemplate({ content, accentColor, fontFamily }) {
  const { personalInfo = {}, summary, education = [], skills = {}, projects = [], experience = [], certifications = [], languages = [] } = content || {}

  return (
    <div style={{ padding: '48px 56px', fontFamily, fontSize: '13px', color: '#1e293b', lineHeight: '1.6' }}>
      {/* Minimal Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '300', color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <div style={{ width: '32px', height: '2px', background: accentColor, marginBottom: '12px' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo.github && <span>{personalInfo.github}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <MinSection title="Profile">
          <p style={{ margin: 0, color: '#475569', lineHeight: '1.7' }}>{summary}</p>
        </MinSection>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <MinSection title="Experience">
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>{exp.role}</span>
                  <span style={{ color: '#94a3b8', margin: '0 8px' }}>·</span>
                  <span style={{ color: accentColor }}>{exp.company}</span>
                </div>
                <span style={{ color: '#94a3b8', fontSize: '11px' }}>{exp.duration}</span>
              </div>
              {exp.description && (
                <div style={{ marginTop: '6px', color: '#475569', fontSize: '12px', paddingLeft: '12px' }}>
                  {exp.description.split('\n').map((line, j) => (
                    <div key={j} style={{ marginBottom: '2px' }}>{line}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </MinSection>
      )}

      {/* Education */}
      {education.length > 0 && (
        <MinSection title="Education">
          {education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{edu.degree}</span>
                {edu.institution && <span style={{ color: '#94a3b8' }}>, {edu.institution}</span>}
              </div>
              <span style={{ color: '#94a3b8', fontSize: '11px' }}>{edu.year}{edu.grade && ` · ${edu.grade}`}</span>
            </div>
          ))}
        </MinSection>
      )}

      {/* Skills */}
      {(skills.technical?.length > 0 || skills.soft?.length > 0) && (
        <MinSection title="Skills">
          {skills.technical?.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>Technical — </span>
              <span style={{ color: '#475569' }}>{skills.technical.join(', ')}</span>
            </div>
          )}
          {skills.soft?.length > 0 && (
            <div>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>Soft — </span>
              <span style={{ color: '#475569' }}>{skills.soft.join(', ')}</span>
            </div>
          )}
        </MinSection>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <MinSection title="Projects">
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{proj.title}</span>
                {proj.techStack && <span style={{ color: '#94a3b8', fontSize: '11px', marginLeft: '8px' }}>{proj.techStack}</span>}
                {proj.link && <a href={proj.link} style={{ color: accentColor, fontSize: '11px', marginLeft: '8px' }}>↗</a>}
              </div>
              {proj.description && <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '12px' }}>{proj.description}</p>}
            </div>
          ))}
        </MinSection>
      )}

      {/* Certs + Languages */}
      {(certifications.length > 0 || languages.length > 0) && (
        <MinSection title="Other">
          {certifications.length > 0 && (
            <div style={{ marginBottom: '6px' }}>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>Certifications — </span>
              <span style={{ color: '#475569' }}>{certifications.join(', ')}</span>
            </div>
          )}
          {languages.length > 0 && (
            <div>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>Languages — </span>
              <span style={{ color: '#475569' }}>{languages.join(', ')}</span>
            </div>
          )}
        </MinSection>
      )}
    </div>
  )
}

function MinSection({ title, children }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '12px' }}>
        {title}
      </div>
      {children}
    </div>
  )
}
