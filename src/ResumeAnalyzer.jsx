import { useMemo, useState } from 'react';
import './ResumeAnalyzer.css';

const resumeSections = [
  { key: 'name', label: 'Full name', weight: 8 },
  { key: 'email', label: 'Email address', weight: 7 },
  { key: 'phone', label: 'Phone number', weight: 5 },
  { key: 'role', label: 'Target job role', weight: 10 },
  { key: 'summary', label: 'Professional summary', weight: 15 },
  { key: 'education', label: 'Education', weight: 12 },
  { key: 'skills', label: 'Technical skills', weight: 15 },
  { key: 'projects', label: 'Projects', weight: 15 },
  { key: 'experience', label: 'Internship / experience', weight: 8 },
  { key: 'links', label: 'LinkedIn / GitHub links', weight: 5 },
];

const commonKeywords = [
  'communication', 'teamwork', 'problem solving', 'leadership',
  'python', 'java', 'javascript', 'react', 'sql', 'html', 'css',
  'git', 'api', 'testing', 'data structures', 'algorithms',
];

function normalize(value) {
  return String(value || '').toLowerCase();
}

export default function ResumeAnalyzer({ resume = {} }) {
  const [jobDescription, setJobDescription] = useState('');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const analysis = useMemo(() => {
    const completed = resumeSections.filter(section =>
      String(resume[section.key] || '').trim().length > 0
    );
    const score = Math.round(
      completed.reduce((sum, section) => sum + section.weight, 0)
    );
    const missing = resumeSections.filter(section =>
      !String(resume[section.key] || '').trim()
    );

    const resumeText = normalize(
      resumeSections.map(section => resume[section.key] || '').join(' ')
    );
    const jobText = normalize(jobDescription);
    const keywordsToCheck = jobDescription.trim()
      ? [...new Set(jobText.match(/[a-z][a-z+#.-]{2,}/g) || [])]
          .filter(word => !['the', 'and', 'for', 'with', 'you', 'our', 'are', 'will', 'this', 'that', 'from', 'have', 'your', 'job', 'role', 'work', 'team'].includes(word))
          .slice(0, 80)
      : commonKeywords;
    const matchedKeywords = keywordsToCheck.filter(keyword =>
      resumeText.includes(keyword)
    );
    const missingKeywords = keywordsToCheck.filter(keyword =>
      !resumeText.includes(keyword)
    ).slice(0, 12);
    const matchPercent = keywordsToCheck.length
      ? Math.round((matchedKeywords.length / keywordsToCheck.length) * 100)
      : 0;

    const suggestions = [];
    if (!String(resume.summary || '').trim()) suggestions.push('Add a short professional summary tailored to the role you want.');
    else if (String(resume.summary).trim().split(/\s+/).length < 20) suggestions.push('Expand your summary with your strengths, relevant skills, and career goal.');
    if (!String(resume.skills || '').trim()) suggestions.push('List relevant technical and soft skills using clear, specific terms.');
    if (!String(resume.projects || '').trim()) suggestions.push('Add 1–3 projects and describe your contribution, tools, and outcome.');
    if (!String(resume.education || '').trim()) suggestions.push('Include your degree, college, expected graduation year, and CGPA/percentage if appropriate.');
    if (!String(resume.experience || '').trim()) suggestions.push('If you have no work experience yet, include internships, volunteering, coursework, or relevant achievements.');
    if (!String(resume.links || '').trim()) suggestions.push('Consider adding relevant LinkedIn, GitHub, or portfolio links.');
    if (jobDescription.trim() && missingKeywords.length) suggestions.push('Review the job-description terms below and include only the ones that honestly match your skills or experience.');
    if (!suggestions.length) suggestions.push('Your main resume sections are filled. Review wording, spelling, formatting, and whether each claim is specific and accurate.');

    return { score, completed, missing, matchedKeywords, missingKeywords, matchPercent, suggestions };
  }, [resume, jobDescription]);

  return (
    <section className="ra-page">
      <div className="ra-heading">
        <div>
          <p className="eyebrow">RESUME REVIEW</p>
          <h2>Resume Analyzer</h2>
          <p>Check your resume sections and compare your skills with a target job description.</p>
        </div>
        <div className="ra-heading-icon" aria-hidden="true">⌕</div>
      </div>

      <div className="ra-note">
        <strong>Frontend demo:</strong> this checklist score is based on which resume fields are filled.
        It is not an ATS guarantee or an AI-powered evaluation.
      </div>

      <div className="ra-grid">
        <section className="ra-card ra-score-card">
          <div className="ra-card-title">
            <div><p className="eyebrow">COMPLETENESS SCORE</p><h3>Your resume snapshot</h3></div>
            <span className="ra-score-mark">✓</span>
          </div>
          <div className="ra-score" aria-label={`Resume completeness score ${analysis.score} out of 100`}>
            <strong>{analysis.score}</strong><span>/100</span>
          </div>
          <div className="ra-progress"><div style={{ width: `${analysis.score}%` }} /></div>
          <p className="ra-muted">{analysis.completed.length} of {resumeSections.length} key sections completed.</p>
          <button className="primary-solid" onClick={() => setHasAnalyzed(true)}>Analyze Resume</button>
          {hasAnalyzed && <p className="ra-success" role="status">Analysis updated using your latest Resume Builder details.</p>}
        </section>

        <section className="ra-card">
          <p className="eyebrow">SECTION CHECKLIST</p>
          <h3>What’s included?</h3>
          <div className="ra-checklist">
            {resumeSections.map(section => {
              const filled = String(resume[section.key] || '').trim().length > 0;
              return (
                <div className="ra-check-row" key={section.key}>
                  <span className={filled ? 'ra-check-icon is-filled' : 'ra-check-icon'}>{filled ? '✓' : '!'}</span>
                  <span>{section.label}</span>
                  <strong className={filled ? 'ra-status-good' : 'ra-status-missing'}>{filled ? 'Added' : 'Missing'}</strong>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="ra-grid ra-grid-lower">
        <section className="ra-card">
          <p className="eyebrow">NEXT STEPS</p>
          <h3>Suggestions to improve</h3>
          {analysis.suggestions.length ? (
            <ul className="ra-suggestions">
              {analysis.suggestions.map((suggestion, index) => <li key={index}>{suggestion}</li>)}
            </ul>
          ) : <p className="ra-muted">Your resume is looking complete.</p>}
        </section>

        <section className="ra-card">
          <p className="eyebrow">JOB DESCRIPTION MATCH</p>
          <h3>Compare with a target role</h3>
          <label className="ra-label" htmlFor="ra-job-description">Paste the job description</label>
          <textarea
            id="ra-job-description"
            className="ra-job-input"
            rows={5}
            value={jobDescription}
            onChange={event => setJobDescription(event.target.value)}
            placeholder="Paste the responsibilities and skills from a job or internship posting..."
          />
          {jobDescription.trim() ? (
            <div className="ra-match-area">
              <div className="ra-match-head"><span>Keyword overlap</span><strong>{analysis.matchPercent}%</strong></div>
              <div className="ra-progress"><div style={{ width: `${analysis.matchPercent}%` }} /></div>
              <p className="ra-muted">This is a simple text-match estimate, not a hiring or ATS prediction.</p>
              <div className="ra-keyword-group">
                <strong>Found in your resume</strong>
                <div className="ra-tags">
                  {analysis.matchedKeywords.length
                    ? analysis.matchedKeywords.slice(0, 12).map(word => <span className="ra-tag ra-tag-good" key={word}>{word}</span>)
                    : <span className="ra-muted">No matching terms found yet.</span>}
                </div>
              </div>
              <div className="ra-keyword-group">
                <strong>Not found in your resume</strong>
                <div className="ra-tags">
                  {analysis.missingKeywords.length
                    ? analysis.missingKeywords.map(word => <span className="ra-tag" key={word}>{word}</span>)
                    : <span className="ra-muted">No missing terms from the checked list.</span>}
                </div>
              </div>
              <p className="ra-muted">Only add terms that truthfully reflect your abilities and experience.</p>
            </div>
          ) : (
            <p className="ra-muted ra-empty-match">Paste a job description to see which terms also appear in your resume.</p>
          )}
        </section>
      </div>

      <div className="ra-footer">
        <span>Tip: update your details in Resume Builder, then return here to re-check your resume.</span>
      </div>
    </section>
  );
}