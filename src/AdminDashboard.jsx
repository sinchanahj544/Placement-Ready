import { useState } from 'react';
import './AdminDashboard.css';

const USERS_KEY = 'placementReadyUsers';

export default function AdminDashboard({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [filter, setFilter] = useState('All');

  const [users] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const [trainingData] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('placementReadyTrainerData') || '{}'
      );
    } catch {
      return {};
    }
  });

  const [attempts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('placementAttempts') || '[]');
    } catch {
      return [];
    }
  });

  const visibleUsers =
    filter === 'All'
      ? users
      : users.filter(user => user.role === filter);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Placement<span>Ready</span></h2>
        <p className="admin-menu-label">ADMINISTRATION</p>

        {['Overview', 'User Management', 'Training Overview', 'Reports'].map(tab => (
          <button
            key={tab}
            className={`admin-nav-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}

        <div className="admin-sidebar-bottom">
          <strong>{currentUser?.name || 'Admin'}</strong>
          <p>Administrator</p>
          <button onClick={onLogout}>Logout</button>
        </div>
      </aside>

      <main className="admin-content">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">PLACEMENTREADY MANAGEMENT</p>
            <h1>{activeTab}</h1>
          </div>
          <span className="admin-role-badge">Admin</span>
        </header>

        {activeTab === 'Overview' && (
          <>
            <section className="admin-welcome">
              <p>ADMIN WORKSPACE</p>
              <h2>Manage your placement platform.</h2>
              <span>
                Welcome back, {currentUser?.name || 'Admin'}.
                Review users, training resources, and reports.
              </span>
            </section>

            <section className="admin-stats">
              <article className="admin-stat-card">
                <span>Registered Users</span>
                <strong>{users.length}</strong>
              </article>
              <article className="admin-stat-card">
                <span>Training Materials</span>
                <strong>{(trainingData.materials || []).length}</strong>
              </article>
              <article className="admin-stat-card">
                <span>Aptitude Questions</span>
                <strong>{(trainingData.questions || []).length}</strong>
              </article>
              <article className="admin-stat-card">
                <span>Practice Sessions</span>
                <strong>{(trainingData.sessions || []).length}</strong>
              </article>
            </section>

            <section className="admin-panel">
              <h2>Platform Summary</h2>
              <p>Completed test attempts recorded in this browser: <strong>{attempts.length}</strong></p>
              <button onClick={() => setActiveTab('User Management')}>
                Manage Users →
              </button>
            </section>
          </>
        )}

        {activeTab === 'User Management' && (
          <section className="admin-panel">
            <h2>User Management</h2>
            <p>View accounts available in the local demo storage.</p>

            <label className="admin-filter">
              Filter by role
              <select value={filter} onChange={e => setFilter(e.target.value)}>
                <option>All</option>
                <option>Student</option>
                <option>Trainer</option>
                <option>Admin</option>
              </select>
            </label>

            {visibleUsers.length === 0 ? (
              <p>No saved users found. Registration must save users to localStorage before they can appear here.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleUsers.map((user, index) => (
                      <tr key={user.id || user.email || index}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td><span className="admin-user-role">{user.role}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === 'Training Overview' && (
          <section className="admin-panel">
            <h2>Training Overview</h2>
            <div className="admin-stats">
              <article className="admin-stat-card">
                <span>Materials</span>
                <strong>{(trainingData.materials || []).length}</strong>
              </article>
              <article className="admin-stat-card">
                <span>Trainer Questions</span>
                <strong>{(trainingData.questions || []).length}</strong>
              </article>
              <article className="admin-stat-card">
                <span>Practice Sessions</span>
                <strong>{(trainingData.sessions || []).length}</strong>
              </article>
            </div>
          </section>
        )}

        {activeTab === 'Reports' && (
          <section className="admin-panel">
            <h2>Test Reports</h2>
            <p>Total test attempts saved in this browser: <strong>{attempts.length}</strong></p>

            {attempts.length === 0 ? (
              <p>No test attempts recorded yet.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Attempt</th>
                      <th>Date</th>
                      <th>Score</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((attempt, index) => (
                      <tr key={`${attempt.date}-${index}`}>
                        <td>{index + 1}</td>
                        <td>{attempt.date}</td>
                        <td>{attempt.score}/{attempt.total}</td>
                        <td>{attempt.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}