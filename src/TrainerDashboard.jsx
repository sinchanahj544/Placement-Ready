
import { useEffect, useState } from 'react';
import './TrainerDashboard.css';
const STORAGE_KEY = 'placementReadyTrainerData';

const emptyData = {
  materials: [],
  questions: [],
  sessions: [],
};

export default function TrainerDashboard({ currentUser, onLogout }) {
  const [data, setData] = useState(() => {
    try {
      return {
        ...emptyData,
        ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'),
      };
    } catch {
      return emptyData;
    }
  });

  const [activeSection, setActiveSection] = useState('materials');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('0');
  const [sessionDate, setSessionDate] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  function addMaterial(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setData(previous => ({
      ...previous,
      materials: [
        ...previous.materials,
        {
          id: crypto.randomUUID(),
          title: title.trim(),
          description: description.trim(),
        },
      ],
    }));

    setTitle('');
    setDescription('');
  }

  function addQuestion(e) {
    e.preventDefault();

    if (!question.trim() || options.some(option => !option.trim())) {
      alert('Enter a question and all four options.');
      return;
    }

    setData(previous => ({
      ...previous,
      questions: [
        ...previous.questions,
        {
          id: crypto.randomUUID(),
          question: question.trim(),
          options: options.map(option => option.trim()),
          correctAnswer: Number(correctAnswer),
        },
      ],
    }));

    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('0');
  }

  function addSession(e) {
    e.preventDefault();
    if (!title.trim() || !sessionDate) return;

    setData(previous => ({
      ...previous,
      sessions: [
        ...previous.sessions,
        {
          id: crypto.randomUUID(),
          title: title.trim(),
          date: sessionDate,
        },
      ],
    }));

    setTitle('');
    setSessionDate('');
  }

  function deleteItem(section, id) {
    setData(previous => ({
      ...previous,
      [section]: previous[section].filter(item => item.id !== id),
    }));
  }

  function resetForms() {
    setTitle('');
    setDescription('');
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('0');
    setSessionDate('');
  }

  const sections = [
    { id: 'materials', label: 'Training Materials' },
    { id: 'questions', label: 'Aptitude Questions' },
    { id: 'sessions', label: 'Practice Sessions' },
  ];

  return (
    <div className="trainer-page">
      <header className="trainer-header">
        <div>
          <h1>PlacementReady</h1>
          <p>Trainer Workspace</p>
        </div>

        <div className="trainer-user">
          <span>Welcome, {currentUser?.name || 'Trainer'}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className="trainer-main">
        <h2>Trainer Dashboard</h2>
        <p>Create and manage placement preparation resources.</p>

        <div className="trainer-stats">
          <div className="trainer-stat">
            <span>Training Materials</span>
            <strong>{data.materials.length}</strong>
          </div>
          <div className="trainer-stat">
            <span>Aptitude Questions</span>
            <strong>{data.questions.length}</strong>
          </div>
          <div className="trainer-stat">
            <span>Practice Sessions</span>
            <strong>{data.sessions.length}</strong>
          </div>
        </div>

        <nav className="trainer-tabs">
          {sections.map(section => (
            <button
              key={section.id}
              className={activeSection === section.id ? 'active' : ''}
              onClick={() => {
                setActiveSection(section.id);
                resetForms();
              }}
            >
              {section.label}
            </button>
          ))}
        </nav>

        {activeSection === 'materials' && (
          <section className="trainer-panel">
            <h3>Add Training Material</h3>
            <form onSubmit={addMaterial}>
              <label>Title
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Java Basics"
                  required
                />
              </label>
              <label>Description or resource link
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Enter notes, a topic summary, or a URL"
                  required
                />
              </label>
              <button type="submit">Save Material</button>
            </form>

            <h3>Saved Materials</h3>
            {data.materials.length === 0 && <p>No materials added yet.</p>}
            {data.materials.map(item => (
              <article className="trainer-item" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                  {/^https?:\/\//i.test(item.description) && (
                    <a href={item.description} target="_blank" rel="noreferrer">
                      Open resource
                    </a>
                  )}
                </div>
                <button onClick={() => deleteItem('materials', item.id)}>
                  Delete
                </button>
              </article>
            ))}
          </section>
        )}

        {activeSection === 'questions' && (
          <section className="trainer-panel">
            <h3>Create an Aptitude Question</h3>
            <form onSubmit={addQuestion}>
              <label>Question
                <textarea
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="Enter your question"
                  required
                />
              </label>

              {options.map((option, index) => (
                <label key={index}>
                  Option {index + 1}
                  <input
                    value={option}
                    onChange={e => setOptions(previous =>
                      previous.map((value, i) => i === index ? e.target.value : value)
                    )}
                    placeholder={`Enter option ${index + 1}`}
                    required
                  />
                </label>
              ))}

              <label>Correct answer
                <select
                  value={correctAnswer}
                  onChange={e => setCorrectAnswer(e.target.value)}
                >
                  {options.map((_, index) => (
                    <option key={index} value={String(index)}>
                      Option {index + 1}
                    </option>
                  ))}
                </select>
              </label>

              <button type="submit">Save Question</button>
            </form>

            <h3>Saved Questions</h3>
            {data.questions.length === 0 && <p>No questions added yet.</p>}
            {data.questions.map(item => (
              <article className="trainer-item" key={item.id}>
                <div>
                  <strong>{item.question}</strong>
                  <p>{item.options.map((option, i) =>
                    `${i + 1}. ${option}`
                  ).join(' | ')}</p>
                  <p>Correct answer: {item.options[item.correctAnswer]}</p>
                </div>
                <button onClick={() => deleteItem('questions', item.id)}>
                  Delete
                </button>
              </article>
            ))}
          </section>
        )}

        {activeSection === 'sessions' && (
          <section className="trainer-panel">
            <h3>Create a Practice Session</h3>
            <form onSubmit={addSession}>
              <label>Session title
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Mock Interview Practice"
                  required
                />
              </label>
              <label>Session date
                <input
                  type="date"
                  value={sessionDate}
                  onChange={e => setSessionDate(e.target.value)}
                  required
                />
              </label>
              <button type="submit">Create Session</button>
            </form>

            <h3>Scheduled Sessions</h3>
            {data.sessions.length === 0 && <p>No sessions scheduled yet.</p>}
            {data.sessions.map(item => (
              <article className="trainer-item" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.date}</p>
                </div>
                <button onClick={() => deleteItem('sessions', item.id)}>
                  Delete
                </button>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
