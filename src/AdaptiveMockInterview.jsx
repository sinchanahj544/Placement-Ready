import { useEffect, useMemo, useState } from 'react'
import './AdaptiveMockInterview.css'

const questionBank = {
  HR: [
    { id: 'hr1', level: 1, q: 'Tell me about yourself.', tip: 'Connect your education, strongest skills, one project, and the role you want.' },
    { id: 'hr2', level: 2, q: 'What is one strength you would bring to this role? Give a specific example.', tip: 'Use a real example and explain the impact of your contribution.' },
    { id: 'hr3', level: 3, q: 'Tell me about a time you received difficult feedback. What did you do next?', tip: 'Show that you listened, acted on the feedback, and learned from it.' },
    { id: 'hr4', level: 2, q: 'Why are you interested in this role and our team?', tip: 'Link your interests and skills to the responsibilities of the role.' },
    { id: 'hr5', level: 3, q: 'Describe a disagreement in a team and how you handled it.', tip: 'Focus on respectful communication and the outcome, not blaming anyone.' },
  ],
  Technical: [
    { id: 'te1', level: 1, q: 'Explain a technical project you have built and the problem it solves.', tip: 'Mention the problem, technologies, your contribution, and result.' },
    { id: 'te2', level: 2, q: 'How would you debug a feature that works locally but fails for another user?', tip: 'Cover reproduction, logs, environment differences, and testing a fix.' },
    { id: 'te3', level: 2, q: 'What is the difference between an array and a linked list?', tip: 'Compare access, insertion/deletion, and typical trade-offs.' },
    { id: 'te4', level: 3, q: 'How would you investigate a slow API request in a web application?', tip: 'Break the problem down: client, network, server, database, and measurements.' },
    { id: 'te5', level: 3, q: 'How would you test a login form beyond checking the happy path?', tip: 'Consider invalid inputs, edge cases, security, accessibility, and error states.' },
  ],
  Behavioral: [
    { id: 'be1', level: 1, q: 'Describe a challenge you faced while studying or building a project.', tip: 'Use STAR: Situation, Task, Action, Result.' },
    { id: 'be2', level: 2, q: 'Tell me about a time you had to learn something quickly.', tip: 'Explain your learning plan and how you checked your understanding.' },
    { id: 'be3', level: 2, q: 'Describe a mistake you made and how you prevented it from happening again.', tip: 'Be honest and focus on the improvement you made.' },
    { id: 'be4', level: 3, q: 'Your team is behind schedule and a teammate is not responding. What would you do?', tip: 'Balance communication, support, priorities, and escalation when needed.' },
    { id: 'be5', level: 3, q: 'Tell me about a time you had to prioritize competing deadlines.', tip: 'Describe how you assessed urgency, communicated, and followed through.' },
  ],
}

const wordCount = (text) => text.trim() ? text.trim().split(/\s+/).length : 0
const hasAny = (text, words) => words.some((word) => text.toLowerCase().includes(word))

function evaluateAnswer(answer, category) {
  const words = wordCount(answer)
  const lower = answer.toLowerCase()
  const specific = hasAny(lower, ['for example', 'for instance', 'when i', 'i built', 'i created', 'i worked', 'our team', 'the result', 'because'])
  const structured = category === 'Behavioral'
    ? hasAny(lower, ['situation', 'task', 'action', 'result', 'first', 'then', 'finally'])
    : hasAny(lower, ['because', 'therefore', 'for example', 'first', 'then', 'result', 'trade-off', 'test'])
  const clarity = words >= 45 ? 4 : words >= 25 ? 3 : words >= 12 ? 2 : words > 0 ? 1 : 0
  const example = specific ? 2 : 0
  const structure = structured ? 2 : 1
  const score = Math.min(10, clarity + example + structure + (words >= 70 ? 1 : 0))
  const suggestions = []
  if (words < 25) suggestions.push('Add more detail so the interviewer can understand your reasoning.')
  if (!specific) suggestions.push('Include a concrete example from a class, project, internship, or team activity.')
  if (!structured) suggestions.push(category === 'Behavioral' ? 'Try the STAR structure: Situation, Task, Action, Result.' : 'Organize the answer into steps, explain why you chose them, and finish with the result.')
  if (words >= 25 && specific && structured) suggestions.push('Good foundation. Make the impact or result as specific as you can.')
  return { words, score, suggestions, specific, structured }
}

export default function AdaptiveMockInterview() {
  const [category, setCategory] = useState('HR')
  const [role, setRole] = useState('Software Developer Intern')
  const [difficulty, setDifficulty] = useState('Adaptive')
  const [started, setStarted] = useState(false)
  const [sessionQuestions, setSessionQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [report, setReport] = useState(null)
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('placementAdaptiveInterviewHistory') || '[]') } catch { return [] }
  })

  const currentQuestion = sessionQuestions[index]
  const completed = started && index >= sessionQuestions.length
  const average = useMemo(() => report?.answers?.length ? Math.round(report.answers.reduce((sum, item) => sum + item.score, 0) / report.answers.length * 10) / 10 : 0, [report])

  useEffect(() => {
    if (history.length) localStorage.setItem('placementAdaptiveInterviewHistory', JSON.stringify(history.slice(-30)))
  }, [history])

  function startSession() {
    const bank = questionBank[category]
    const initial = difficulty === 'Beginner' ? bank.filter(q => q.level === 1 || q.level === 2) : difficulty === 'Advanced' ? bank.filter(q => q.level >= 2) : bank
    const shuffled = [...initial].sort(() => Math.random() - 0.5)
    setSessionQuestions(shuffled.slice(0, 4))
    setIndex(0); setAnswer(''); setFeedback(null); setReport(null); setStarted(true)
  }

  function submitAnswer() {
    if (!answer.trim()) return
    const result = evaluateAnswer(answer, category)
    setFeedback({ ...result, answer })
  }

  function nextQuestion() {
    const record = {
      question: currentQuestion.q,
      answer: feedback.answer,
      words: feedback.words,
      score: feedback.score,
      category,
      role,
      date: new Date().toLocaleString(),
      suggestions: feedback.suggestions,
    }
    const prior = report?.answers || []
    const updatedAnswers = [...prior, record]
    if (index + 1 < sessionQuestions.length) {
      let nextIndex = index + 1
      let nextList = sessionQuestions
      // Adaptive rule: after a strong response, prefer a harder unused question; after a weaker response, prefer a lower-level one.
      if (difficulty === 'Adaptive' && feedback.score >= 7) {
        const harder = questionBank[category].find(q => q.level > currentQuestion.level && !sessionQuestions.some(existing => existing.id === q.id))
        if (harder) {
          nextList = [...sessionQuestions]
          nextList[nextIndex] = harder
          setSessionQuestions(nextList)
        }
      } else if (difficulty === 'Adaptive' && feedback.score <= 4) {
        const easier = questionBank[category].find(q => q.level < currentQuestion.level && !sessionQuestions.some(existing => existing.id === q.id))
        if (easier) {
          nextList = [...sessionQuestions]
          nextList[nextIndex] = easier
          setSessionQuestions(nextList)
        }
      }
      setReport({ answers: updatedAnswers })
      setIndex(nextIndex); setAnswer(''); setFeedback(null)
    } else {
      const finalReport = { answers: updatedAnswers, category, role, date: new Date().toLocaleString() }
      setReport(finalReport)
      setHistory(prev => [...prev, { category, role, score: Math.round(updatedAnswers.reduce((sum, item) => sum + item.score, 0) / updatedAnswers.length * 10) / 10, count: updatedAnswers.length, date: finalReport.date }].slice(-30))
      setIndex(sessionQuestions.length)
    }
  }

  function resetSession() { setStarted(false); setSessionQuestions([]); setIndex(0); setAnswer(''); setFeedback(null); setReport(null) }

  return <section className="ami-page">
    <div className="ami-heading"><div><p className="ami-eyebrow">PLACEMENTREADY PRACTICE LAB</p><h2>Adaptive Mock Interview</h2><p>Practise HR, technical, and behavioral questions with feedback that adjusts the next question's difficulty.</p></div><div className="ami-head-icon">✦</div></div>

    {!started && <div className="ami-setup">
      <div className="ami-setup-copy"><span className="ami-pill">PERSONALIZED PRACTICE</span><h3>Build confidence one answer at a time</h3><p>Choose an interview type and target role. The practice engine uses your answer length, examples, and structure to give coaching tips and adjust question difficulty.</p></div>
      <div className="ami-controls">
        <label>Interview category<select value={category} onChange={e => setCategory(e.target.value)}><option>HR</option><option>Technical</option><option>Behavioral</option></select></label>
        <label>Target role<input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Frontend Developer Intern" /></label>
        <label>Difficulty<select value={difficulty} onChange={e => setDifficulty(e.target.value)}><option>Adaptive</option><option>Beginner</option><option>Advanced</option></select></label>
        <button className="ami-primary" onClick={startSession}>Start interview <span>→</span></button>
      </div>
      <div className="ami-feature-row"><div><b>01</b><strong>Answer naturally</strong><small>Write an answer in your own words.</small></div><div><b>02</b><strong>Get feedback</strong><small>See a practice score and coaching tips.</small></div><div><b>03</b><strong>Adapt and improve</strong><small>Next questions respond to your result.</small></div></div>
    </div>}

    {started && !completed && currentQuestion && <div className="ami-workspace">
      <div className="ami-main-card"><div className="ami-progress-top"><span>{category.toUpperCase()} INTERVIEW</span><span>QUESTION {index + 1} OF {sessionQuestions.length}</span></div><div className="ami-progress"><span style={{ width: `${((index + 1) / sessionQuestions.length) * 100}%` }} /></div>
        <div className="ami-question-meta"><span className="ami-level">{currentQuestion.level === 1 ? 'FOUNDATION' : currentQuestion.level === 2 ? 'INTERMEDIATE' : 'CHALLENGE'}</span><span>Target: {role || 'General role'}</span></div>
        <h3 className="ami-question">{currentQuestion.q}</h3><p className="ami-prompt">Take a moment to organize your thoughts. Specific examples make answers stronger.</p>
        <label className="ami-answer-label" htmlFor="ami-answer">Your answer</label><textarea id="ami-answer" rows={7} value={answer} disabled={Boolean(feedback)} onChange={e => setAnswer(e.target.value)} placeholder="Type your answer here. Explain what you did and what happened..." />
        <div className="ami-answer-footer"><span>{wordCount(answer)} words</span>{!feedback && <button className="ami-primary" disabled={!answer.trim()} onClick={submitAnswer}>Review my answer</button>}</div>
        {feedback && <div className="ami-feedback"><div className="ami-score"><span>Practice score</span><strong>{feedback.score}<small>/10</small></strong></div><div className="ami-feedback-content"><h4>{feedback.score >= 7 ? 'Good foundation — add precision' : feedback.score >= 5 ? 'You’re on the right track' : 'Let’s strengthen this answer'}</h4><p>This is rule-based practice feedback, not an AI or employer assessment.</p><ul>{feedback.suggestions.map((item, i) => <li key={i}>{item}</li>)}</ul><button className="ami-primary" onClick={nextQuestion}>{index + 1 === sessionQuestions.length ? 'View interview report' : 'Next question'} <span>→</span></button></div></div>}
      </div>
      <aside className="ami-side-card"><div className="ami-side-icon">✎</div><h3>Answer coach</h3><p>Use this quick checklist while practising.</p><div className="ami-check-item"><span>✓</span><div><b>Be specific</b><small>Use an example instead of a general claim.</small></div></div><div className="ami-check-item"><span>✓</span><div><b>Show your thinking</b><small>Explain the steps you took and why.</small></div></div><div className="ami-check-item"><span>✓</span><div><b>End with impact</b><small>Share the result or what you learned.</small></div></div><div className="ami-note"><b>Adaptive mode</b><p>Stronger answers can lead to a harder question. If an answer needs work, the next question may be easier.</p></div><button className="ami-quiet" onClick={resetSession}>End practice</button></aside>
    </div>}

    {completed && report && <div className="ami-report"><div className="ami-report-banner"><span>INTERVIEW COMPLETE</span><h3>Your practice report</h3><p>{role || 'General role'} · {category} · {report.date}</p><div className="ami-big-score">{average}<small>/10 average practice score</small></div></div><div className="ami-report-stats"><div><span>Questions answered</span><strong>{report.answers.length}</strong></div><div><span>Average score</span><strong>{average}/10</strong></div><div><span>Words written</span><strong>{report.answers.reduce((sum, item) => sum + item.words, 0)}</strong></div></div><h3 className="ami-review-title">Answer-by-answer feedback</h3>{report.answers.map((item, i) => <article className="ami-answer-review" key={`${item.date}-${i}`}><div className="ami-review-top"><b>{i + 1}. {item.question}</b><span>{item.score}/10</span></div><p className="ami-review-answer">{item.answer}</p><ul>{item.suggestions.map((tip, j) => <li key={j}>{tip}</li>)}</ul></article>)}<button className="ami-primary" onClick={resetSession}>Start another interview <span>→</span></button></div>}

    <div className="ami-history"><div><h3>Recent practice sessions</h3><p>Saved in this browser on this device.</p></div>{history.length === 0 ? <span className="ami-empty">Your completed sessions will appear here.</span> : <div className="ami-history-list">{history.slice(-3).reverse().map((item, i) => <div className="ami-history-item" key={`${item.date}-${i}`}><div><b>{item.category} · {item.role}</b><small>{item.count} questions · {item.date}</small></div><strong>{item.score}/10</strong></div>)}</div>}</div>
    <p className="ami-disclaimer">Note: This version uses local, rule-based feedback and adaptive question selection. It does not call an AI model or guarantee hiring outcomes.</p>
  </section>
}