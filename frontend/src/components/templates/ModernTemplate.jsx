export default function ModernTemplate({ content, accentColor, fontFamily }) {
  const { personalInfo = {}, summary, education = [], skills = {}, projects = [], experience = [], certifications = [], languages = [] } = content || {}

  return (
    <div style={{ display: 'flex', minHeight: '1123px', fontFamily, fontSize: '13px', color: '#1e293b' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', background: accentColor, padding: '32px 20px', color: 'white', flexShrink: 0 }}>
        {/* Initials Avatar */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', fontWeight: '800', margin: '0 auto 20px',
          border: '3px solid rgba(255,255,255,0.5)'
        }}>
          {(personalInfo.fullName || 'U').charAt(0).toUpperCase()}
        </div>

        {/* Contact */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px', opacity: 0.7 }}>Contact</div>
          {[
            { icon: '✉', val: personalInfo.email },
            { icon: '📞', val: personalInfo.phone },
            { icon: '📍', val: personalInfo.location },
            { icon: '🔗', val: personalInfo.linkedin },
            { icon: '⌂', val: personalInfo.github },
          ].filter(f => f.val).map((f, i) => (
            <div key={i} style={{ fontSize: '11px', marginBottom: '6px', opacity: 0.9, wordBreak: 'break-all' }}>
              <span style={{ marginRight: '6px' }}>{f.icon}</span>{f.val}
            </div>
          ))}
        </div>

        {/* Skills */}
        {skills.technical?.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px', opacity: 0.7 }}>Technical Skills</div>
            {skills.technical.map((s, i) => (
              <div key={i} style={{ marginBottom: '5px' }}>
                <div style={{ fontSize: '11px', marginBottom: '2px' }}>{s}</div>
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}>
                  <div style={{ height: '100%', width: '80%', background: 'rgba(255,255,255,0.7)', borderRadius: '2px' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px', opacity: 0.7 }}>Languages</div>
            {languages.map((l, i) => (
              <div key={i} style={{ fontSize: '11px', marginBottom: '4px', opacity: 0.9 }}>• {l}</div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '32px 28px' }}>
        {/* Name & Role */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <div style={{ width: '48px', height: '4px', background: accentColor, borderRadius: '2px', marginBottom: '8px' }} />
        </div>

        {/* Summary */}
        {summary && (
          <div style={{ marginBottom: '20px' }}>
            <SectionHeader color={accentColor} title="About Me" />
            <p style={{ margin: 0, color: '#334155', lineHeight: '1.6' }}>{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <SectionHeader color={accentColor} title="Experience" />
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '14px', paddingLeft: '12px', borderLeft: `3px solid ${accentColor}` }}>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{exp.role}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ color: accentColor, fontSize: '12px', fontWeight: '600' }}>{exp.company}</div>
                  <div style={{ color: '#94a3b8', fontSize: '11px' }}>{exp.duration}</div>
                </div>
                {exp.description && <div style={{ color: '#475569', marginTop: '4px', fontSize: '12px' }}>{exp.description}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <SectionHeader color={accentColor} title="Education" />
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{edu.degree}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>{edu.institution}</div>
                  <div style={{ color: '#94a3b8', fontSize: '11px' }}>{edu.year} {edu.grade && `| ${edu.grade}`}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <SectionHeader color={accentColor} title="Projects" />
            {projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{proj.title}
                  {proj.link && <a href={proj.link} style={{ color: accentColor, fontSize: '11px', fontWeight: '400', marginLeft: '8px' }}>↗ Link</a>}
                </div>
                {proj.techStack && <div style={{ color: accentColor, fontSize: '11px', fontWeight: '600' }}>{proj.techStack}</div>}
                {proj.description && <div style={{ color: '#475569', fontSize: '12px', marginTop: '3px' }}>{proj.description}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <SectionHeader color={accentColor} title="Certifications" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {certifications.map((cert, i) => (
                <span key={i} style={{ padding: '3px 10px', background: `${accentColor}15`, border: `1px solid ${accentColor}40`, borderRadius: '99px', fontSize: '11px', color: accentColor }}>
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ color, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
      <span style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color }}>
        {title}
      </span>
      <div style={{ flex: 1, height: '1px', background: `${color}30` }} />
    </div>
  )
}
