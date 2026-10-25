export default function ClassicTemplate({ content, accentColor, fontFamily }) {
  const { personalInfo = {}, summary, education = [], skills = {}, projects = [], experience = [], certifications = [], languages = [] } = content || {}

  const sectionStyle = {
    borderBottom: `2px solid ${accentColor}`,
    color: accentColor,
    marginBottom: '8px',
    paddingBottom: '4px',
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  }

  return (
    <div style={{ padding: '40px 48px', fontFamily, fontSize: '13px', color: '#1e293b', lineHeight: '1.5' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', fontSize: '12px', color: '#64748b' }}>
          {personalInfo.email && <span>✉ {personalInfo.email}</span>}
          {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
          {personalInfo.location && <span>📍 {personalInfo.location}</span>}
          {personalInfo.linkedin && <span>🔗 {personalInfo.linkedin}</span>}
          {personalInfo.github && <span>⌂ {personalInfo.github}</span>}
          {personalInfo.portfolio && <span>🌐 {personalInfo.portfolio}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: '20px' }}>
          <div style={sectionStyle}>Professional Summary</div>
          <p style={{ margin: 0, color: '#334155', textAlign: 'justify' }}>{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={sectionStyle}>Work Experience</div>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{exp.role}</div>
                  <div style={{ color: accentColor, fontWeight: '600', fontSize: '13px' }}>{exp.company}</div>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '12px', whiteSpace: 'nowrap' }}>{exp.duration}</div>
              </div>
              {exp.description && (
                <div style={{ marginTop: '6px', color: '#334155' }}>
                  {exp.description.split('\n').map((line, j) => (
                    <div key={j} style={{ marginBottom: '2px' }}>{line}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={sectionStyle}>Education</div>
          {education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{edu.degree}</div>
                <div style={{ color: '#64748b' }}>{edu.institution}</div>
              </div>
              <div style={{ textAlign: 'right', color: '#94a3b8', fontSize: '12px' }}>
                <div>{edu.year}</div>
                {edu.grade && <div>{edu.grade}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {(skills.technical?.length > 0 || skills.soft?.length > 0) && (
        <div style={{ marginBottom: '20px' }}>
          <div style={sectionStyle}>Skills</div>
          {skills.technical?.length > 0 && (
            <div style={{ marginBottom: '6px' }}>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>Technical: </span>
              <span style={{ color: '#334155' }}>{skills.technical.join(' • ')}</span>
            </div>
          )}
          {skills.soft?.length > 0 && (
            <div>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>Soft Skills: </span>
              <span style={{ color: '#334155' }}>{skills.soft.join(' • ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={sectionStyle}>Projects</div>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{proj.title}</div>
                {proj.link && <a href={proj.link} style={{ color: accentColor, fontSize: '11px' }}>View Project →</a>}
              </div>
              {proj.techStack && <div style={{ color: accentColor, fontSize: '12px', fontWeight: '600' }}>{proj.techStack}</div>}
              {proj.description && <div style={{ color: '#334155', marginTop: '4px' }}>{proj.description}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Certifications & Languages */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {certifications.length > 0 && (
          <div>
            <div style={sectionStyle}>Certifications</div>
            {certifications.map((cert, i) => (
              <div key={i} style={{ color: '#334155', marginBottom: '4px' }}>• {cert}</div>
            ))}
          </div>
        )}
        {languages.length > 0 && (
          <div>
            <div style={sectionStyle}>Languages</div>
            {languages.map((lang, i) => (
              <div key={i} style={{ color: '#334155', marginBottom: '4px' }}>• {lang}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
