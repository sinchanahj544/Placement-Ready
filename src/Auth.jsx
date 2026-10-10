
import { useState } from 'react';
import './Auth.css';

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('Student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  
function handleSubmit(e) {
  e.preventDefault();
  setError('');

  if (!email.trim() || !password.trim()) {
    setError('Please enter your email and password.');
    return;
  }

  if (mode === 'register' && !name.trim()) {
    setError('Please enter your full name.');
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (mode === 'register') {
    let users = [];

    try {
      users = JSON.parse(
        localStorage.getItem('placementReadyUsers') || '[]'
      );
    } catch {
      users = [];
    }

    const existingUser = users.some(
      user => user.email.toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      setError('An account with this email already exists.');
      return;
    }

    const newUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
    };

    users.push(newUser);

    localStorage.setItem(
      'placementReadyUsers',
      JSON.stringify(users)
    );

    alert('Registration successful! Please log in.');

    setMode('login');
    setPassword('');
    setName('');
    return;
  }

  let users = [];

  try {
    users = JSON.parse(
      localStorage.getItem('placementReadyUsers') || '[]'
    );
  } catch {
    users = [];
  }

  const matchedUser = users.find(
    user =>
      user.email.toLowerCase() === normalizedEmail &&
      user.password === password &&
      user.role === role
  );

  if (!matchedUser) {
    setError('Account not found or credentials are incorrect. Please register first.');
    return;
  }

  onLogin({
    name: matchedUser.name,
    email: matchedUser.email,
    role: matchedUser.role,
  });
}

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">Placement<span>Ready</span></div>
        <p className="auth-eyebrow">YOUR CAREER JOURNEY STARTS HERE</p>

        <h1>{mode === 'login' ? 'Welcome back!' : 'Create your account'}</h1>
        <p className="auth-description">
          Prepare for placements, build skills, and track your progress.
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'selected' : ''}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'selected' : ''}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label className="auth-field">
              Full name
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
              />
            </label>
          )}

          <label className="auth-field">
            Email address
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="auth-field">
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </label>

          
<div className="auth-field">
  <label htmlFor="user-role">Sign in as</label>

  <select
    id="user-role"
    name="role"
    value={role}
    onChange={(e) => setRole(e.target.value)}
  >
    <option value="Student">Student</option>
    <option value="Trainer">Trainer</option>
    <option value="Admin">Admin</option>
  </select>
</div>


          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit">
            {mode === 'login' ? 'Login to PlacementReady →' : 'Create account →'}
          </button>
        </form>

        <p className="auth-footer">
          PlacementReady · Placement preparation platform
        </p>
      </div>
    </div>
  );
}
