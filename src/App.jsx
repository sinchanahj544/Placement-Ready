import { useState } from 'react'
import './App.css'
import Auth from './Auth';
import TrainerDashboard from './TrainerDashboard';
import AdminDashboard from './AdminDashboard';
import ResumeAnalyzer from './ResumeAnalyzer';
import AdaptiveMockInterview from './AdaptiveMockInterview';

const defaultQuestions = [
  { q: 'What is 20% of 250?', options: ['25', '40', '50', '60'], answer: 2, topic: 'Quantitative Aptitude' },
  { q: 'Find the next number: 2, 4, 8, 16, __', options: ['18', '24', '32', '36'], answer: 2, topic: 'Logical Reasoning' },
  { q: 'A train travels 120 km in 2 hours. What is its speed?', options: ['40 km/h', '50 km/h', '60 km/h', '80 km/h'], answer: 2, topic: 'Quantitative Aptitude' },
  { q: 'Choose the word closest in meaning to "Rapid".', options: ['Slow', 'Fast', 'Weak', 'Quiet'], answer: 1, topic: 'Verbal Ability' },
  { q: 'If all roses are flowers, which statement must be true?', options: ['All flowers are roses', 'All roses are flowers', 'No roses are flowers', 'All flowers are red'], answer: 1, topic: 'Logical Reasoning' },
  { q: 'A product costs ₹800 after a 20% discount. What was its original price?', options: ['₹900', '₹960', '₹1,000', '₹1,200'], answer: 2, topic: 'Quantitative Aptitude' },
  { q: 'Which one is different from the others?', options: ['Apple', 'Mango', 'Carrot', 'Banana'], answer: 2, topic: 'Logical Reasoning' },
  { q: 'Choose the grammatically correct sentence.', options: ['She go to college', 'She going college', 'She goes to college', 'She gone college'], answer: 2, topic: 'Verbal Ability' },
  { q: 'If 5 workers finish a job in 6 days, how many worker-days are required?', options: ['11', '25', '30', '35'], answer: 2, topic: 'Quantitative Aptitude' },
  { q: 'Which data structure follows FIFO?', options: ['Stack', 'Queue', 'Tree', 'Graph'], answer: 1, topic: 'Computer Fundamentals' },
];

function loadQuestions() {
  let trainerQuestions = [];

  try {
    const saved = JSON.parse(
      localStorage.getItem('placementReadyTrainerData') || '{}'
    );

    trainerQuestions = (saved.questions || [])
      .filter(item =>
        item.question &&
        Array.isArray(item.options) &&
        item.options.length === 4 &&
        Number.isInteger(Number(item.correctAnswer)) &&
        Number(item.correctAnswer) >= 0 &&
        Number(item.correctAnswer) < 4
      )
      .map(item => ({
        q: item.question,
        options: item.options,
        answer: Number(item.correctAnswer),
        topic: 'Trainer Practice',
      }));
  } catch {
    trainerQuestions = [];
  }

  return [...defaultQuestions, ...trainerQuestions];
}


const interviewQuestions = [
  { category: 'Introduction', q: 'Tell me about yourself.', tip: 'Introduce your education, technical skills, one relevant project, and career goal.' },
  { category: 'Behavioural', q: 'What is one challenge you faced in a project, and how did you solve it?', tip: 'Explain the situation, your specific action, and the outcome. Be honest about your contribution.' },
  { category: 'Technical', q: 'Explain one technical project you have built.', tip: 'Describe the problem, technologies used, your role, a challenge, and the result.' },
  { category: 'Problem Solving', q: 'What would you do if your program produced an unexpected result?', tip: 'Explain how you reproduce the issue, inspect inputs, debug step by step, and test the fix.' },
  { category: 'Career Goals', q: 'Why should we select you for this internship or role?', tip: 'Connect your skills, willingness to learn, project experience, and the role requirements.' },
]

const emptyResume = { name: '', email: '', phone: '', location: '', role: '', summary: '', education: '', skills: '', projects: '', experience: '', links: '' }

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [questions, setQuestions] = useState(loadQuestions);
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [trainerData, setTrainerData] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem('placementReadyTrainerData') || '{}'
    );
  } catch {
    return {};
  }
});
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [attempts, setAttempts] = useState(() =>
     {
    try { return JSON.parse(localStorage.getItem('placementAttempts') || '[]') } catch { return [] }
  })
  const [resume, setResume] = useState(() => {
    try { return { ...emptyResume, ...JSON.parse(localStorage.getItem('placementResume') || '{}') } } catch { return emptyResume }
  })
  const [interviewIndex, setInterviewIndex] = useState(0)
  const [interviewAnswer, setInterviewAnswer] = useState('')
  const [interviewFeedback, setInterviewFeedback] = useState(null)
  const [interviewHistory, setInterviewHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('placementInterviewHistory') || '[]') } catch { return [] }
  })

  function finishTest() {
    const score = questions.filter((q, i) => answers[i] === q.answer).length
    const attempt = { date: new Date().toLocaleString(), score, total: questions.length, percentage: Math.round(score / questions.length * 100) }
    const updated = [...attempts, attempt]
    setAttempts(updated)
    localStorage.setItem('placementAttempts', JSON.stringify(updated))
    setResult(attempt)
  }

 function startTest() {
  setQuestions(loadQuestions());
  setCurrent(0);
  setAnswers({});
  setResult(null);
  setActiveTab('Aptitude Test');
}

  function updateResume(field, value) {
    const updated = { ...resume, [field]: value }
    setResume(updated)
    localStorage.setItem('placementResume', JSON.stringify(updated))
  }

  function submitInterview() {
    const text = interviewAnswer.trim()
    if (text.length < 15) {
      setInterviewFeedback({ short: true, message: 'Please write a little more detail before submitting. Aim for at least 15 characters.' })
      return
    }
    const words = text.split(/\s+/).filter(Boolean).length
    const feedback = {
      short: false,
      words,
      message: words < 30
        ? 'Good start. Try adding a specific example and explaining your own contribution.'
        : 'Answer recorded. Review whether you explained the situation, your actions, and the result clearly.',
    }
    const entry = {
      question: interviewQuestions[interviewIndex].q,
      answer: text,
      words,
      date: new Date().toLocaleString(),
    }
    const updated = [...interviewHistory, entry]
    setInterviewHistory(updated)
    localStorage.setItem('placementInterviewHistory', JSON.stringify(updated))
    setInterviewFeedback(feedback)
  }

  function nextInterviewQuestion() {
    setInterviewIndex((interviewIndex + 1) % interviewQuestions.length)
    setInterviewAnswer('')
    setInterviewFeedback(null)
  }

  function goTo(tab) {
  setActiveTab(tab);

  if (tab === 'Aptitude Test') {
    setQuestions(loadQuestions());
    setCurrent(0);
    setAnswers({});
    setResult(null);
  }

  if (tab === 'Training Materials' || tab === 'Practice Sessions') {
    try {
      const saved = JSON.parse(
        localStorage.getItem('placementReadyTrainerData') || '{}'
      );

      setTrainerData(saved);
    } catch {
      setTrainerData({});
    }
  }
}

  const fields = [
    ['name', 'Full name', 'Your full name'],
    ['email', 'Email address', 'you@example.com'],
    ['phone', 'Phone number', '+91 ...'],
    ['location', 'Location', 'City, State'],
    ['role', 'Target job role', 'Software Developer'],
    ['links', 'LinkedIn / GitHub', 'Your profile links'],
    ['summary', 'Professional summary', 'Write 2–3 sentences about your career goal.'],
    ['education', 'Education', 'Degree, college, graduation year, CGPA'],
    ['skills', 'Technical skills', 'Java, Python, SQL, React...'],
    ['projects', 'Projects', 'Project name and what you built.'],
    ['experience', 'Internship / Experience', 'Relevant experience or achievements, if any.'],
  ]

    
  if (!currentUser) {
    return <Auth onLogin={setCurrentUser} />;
  }
  
if (currentUser.role === 'Trainer') {
  return (
    <TrainerDashboard
      currentUser={currentUser}
      onLogout={() => setCurrentUser(null)}
    />
  );
}

if (currentUser.role === 'Admin') {
  return (
    <AdminDashboard
      currentUser={currentUser}
      onLogout={() => setCurrentUser(null)}
    />
  );
}

  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="logo">Placement<span>Ready</span></h2>
        <p className="sidebar-label">LEARNING MENU</p>
       {['Dashboard', 'Aptitude Test', 'Training Materials', 'Resume Builder', 'Resume Analyzer', 'Mock Interview', 'Practice Sessions'].map(item => (
          <button key={item} className={`menu-item ${activeTab === item ? 'active' : ''}`} onClick={() => goTo(item)}>
            <span>{item === 'Dashboard' ? '▦' : item === 'Aptitude Test' ? '◈' : item === 'Resume Builder' ? '▤' : '◉'}</span>{item}
          </button>
        ))}
        <div className="sidebar-bottom"><div className="avatar">S</div><div>
<strong>{currentUser?.name || 'User'}</strong>
<p>
  {currentUser?.role === 'Student'
    ? 'Placement Candidate'
    : currentUser?.role}
</p>
</div></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><p className="eyebrow">YOUR CAREER JOURNEY</p><h1>{activeTab}</h1></div>
          <div className="top-profile"><span className="status-dot" /> Demo Workspace <div className="avatar">S</div></div>
        </header>

        {activeTab === 'Dashboard' && <>
          <section className="welcome"><div><p className="welcome-tag">YOUR FUTURE STARTS HERE</p><h2>Get placement ready.<br />One skill at a time.</h2><p>Practice, improve, and prepare for your dream job.</p><button className="primary-btn" onClick={startTest}>Start Aptitude Test →</button></div><div className="welcome-art">🚀</div></section>
          <section className="stats">
            <div className="stat-card"><span className="stat-icon purple">◈</span><p>Tests Completed</p><h2>{attempts.length}</h2><small>Your completed attempts</small></div>
            <div className="stat-card"><span className="stat-icon blue">◎</span><p>Average Score</p><h2>{attempts.length ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length) + '%' : '—'}</h2><small>Based on saved attempts</small></div>
            <div className="stat-card"><span className="stat-icon orange">▤</span><p>Resume Status</p><h2>{resume.name ? 'In progress' : 'Not started'}</h2><small>Saved in this browser</small></div>
          </section>
          <section className="section"><div className="section-heading"><h2>Placement Preparation</h2><p>Choose a module and start learning.</p></div><div className="module-grid">
            <button className="module-card" onClick={startTest}><span className="module-icon purple">◈</span><h3>Aptitude Practice</h3><p>Practice 10 questions and get your score.</p><span className="module-link">Take a test →</span></button>
            <button className="module-card" onClick={() => setActiveTab('Resume Builder')}><span className="module-icon blue">▤</span><h3>Resume Builder</h3><p>Build and print a professional resume.</p><span className="module-link">Build resume →</span></button>
            <button className="module-card" onClick={() => setActiveTab('Mock Interview')}><span className="module-icon orange">◉</span><h3>Mock Interview</h3><p>Practise common interview questions and record answers.</p><span className="module-link">Start practice →</span></button>
          </div></section>
          {attempts.length > 0 && (
  <section className="section">
    <div className="section-heading">
      <h2>Recent Test Attempts</h2>
      <p>Your saved results.</p>
    </div>
    <div className="stat-card">
      {attempts.slice(-5).reverse().map((a, i) => (
        <div key={i} className="attempt-row">
          <span>{a.date}</span>
          <strong>{a.score}/{a.total} ({a.percentage}%)</strong>
        </div>
      ))}
    </div>
  </section>
)}
        </>}

        {activeTab === 'Aptitude Test' && <section className="test-panel">
          {!result ? <>
            <div className="test-top"><div><p className="eyebrow">APTITUDE ASSESSMENT</p><h2>Test your skills</h2></div><span className="question-count">Question {current + 1} of {questions.length}</span></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${(current + 1) / questions.length * 100}%` }} /></div>
            <p className="topic-label">{questions[current].topic}</p><h3 className="question-text">{questions[current].q}</h3>
            <div className="options">{questions[current].options.map((option, i) => <button key={option} className={`option ${answers[current] === i ? 'selected' : ''}`} onClick={() => setAnswers({ ...answers, [current]: i })}><span className="option-letter">{String.fromCharCode(65 + i)}</span>{option}</button>)}</div>
            <div className="test-actions"><button className="secondary-btn" disabled={current === 0} onClick={() => setCurrent(current - 1)}>← Previous</button>{current < questions.length - 1 ? <button className="primary-solid" disabled={answers[current] === undefined} onClick={() => setCurrent(current + 1)}>Next Question →</button> : <button className="primary-solid" disabled={answers[current] === undefined} onClick={finishTest}>Submit Test ✓</button>}</div>
            <p className="test-note">Your score is calculated when you submit.</p>
          </> : <div className="result-view"><div className="result-icon">{result.percentage >= 70 ? '🎉' : '📘'}</div><p className="eyebrow">ASSESSMENT COMPLETE</p><h2>Your result</h2><div className="score-circle"><strong>{result.percentage}%</strong><span>{result.score} out of {result.total}</span></div><p>{result.percentage >= 70 ? 'Great work! Keep practising.' : 'Good start! Review and try again.'}</p><div className="result-actions"><button className="primary-solid" onClick={startTest}>Try Again</button><button className="secondary-btn" onClick={() => setActiveTab('Dashboard')}>Back to Dashboard</button></div></div>}
        </section>}
        {activeTab === 'Training Materials' && (
  <section className="section">
    <div className="section-heading">
      <h2>Training Materials</h2>
      <p>Resources shared by your trainer.</p>
    </div>

    {(trainerData.materials || []).length === 0 ? (
      <p>No training materials available yet.</p>
    ) : (
      <div className="module-grid">
        {trainerData.materials.map(item => (
          <div className="module-card" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>

            {/^https?:\/\//i.test(item.description) && (
              <a
                href={item.description}
                target="_blank"
                rel="noreferrer"
              >
                Open resource →
              </a>
            )}
          </div>
        ))}
      </div>
    )}
  </section>
)}
{activeTab === 'Practice Sessions' && (
  <section className="section">
    <div className="section-heading">
      <h2>Practice Sessions</h2>
      <p>Upcoming sessions scheduled by your trainer.</p>
    </div>

    {(trainerData.sessions || []).length === 0 ? (
      <p>No practice sessions scheduled yet.</p>
    ) : (
      <div className="module-grid">
        {trainerData.sessions.map(item => (
          <div className="module-card" key={item.id}>
            <h3>{item.title}</h3>
            <p>Session Date: {item.date}</p>
          </div>
        ))}
      </div>
    )}
  </section>
)}

        {activeTab === 'Resume Builder' && <div className="resume-layout">
          <section className="resume-form"><p className="eyebrow">YOUR PROFESSIONAL PROFILE</p><h2>Build your resume</h2><p className="form-hint">Your details are saved in this browser.</p>
            {fields.map(([field, label, placeholder]) => <label className="resume-field" key={field}>{label}{['summary', 'education', 'skills', 'projects', 'experience'].includes(field) ? <textarea rows={field === 'summary' ? 3 : 4} value={resume[field]} placeholder={placeholder} onChange={e => updateResume(field, e.target.value)} /> : <input value={resume[field]} placeholder={placeholder} onChange={e => updateResume(field, e.target.value)} />}</label>)}
            <button
  className="primary-solid print-btn"
  onClick={() => window.print()}
>
  Print / Save as PDF
</button>
          </section>
          <section className="resume-preview" id="resume-preview"><div className="resume-name">{resume.name || 'Your Name'}</div><div className="resume-role">{resume.role || 'Target Job Role'}</div><div className="resume-contact">{[resume.email, resume.phone, resume.location, resume.links].filter(Boolean).join(' • ') || 'Email • Phone • Location • LinkedIn / GitHub'}</div>
            {[['PROFESSIONAL SUMMARY', resume.summary], ['EDUCATION', resume.education], ['TECHNICAL SKILLS', resume.skills], ['PROJECTS', resume.projects], ['EXPERIENCE', resume.experience]].map(([heading, content]) => <div className="resume-section" key={heading}><h3>{heading}</h3><p>{content || 'Add your details in the form to complete this section.'}</p></div>)}
          </section>
        </div>}

        {activeTab === 'Resume Analyzer' && <ResumeAnalyzer resume={resume} />}

        {activeTab === 'Mock Interview' && <AdaptiveMockInterview />}
      </main>
    </div>
  )
}

export default App