import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Activities from './components/Activities.js';
import Teams from './components/Teams.js';
import Leaderboard from './components/Leaderboard.js';
import Workouts from './components/Workouts.js';

export default function App() {
  const navItems = [
    { to: '/activities', label: 'Activities' },
    { to: '/teams', label: 'Teams' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/workouts', label: 'Workout suggestions' },
  ];

  return (
    <div className="container py-4 py-md-5">
      <header className="mb-4">
        <div className="rounded-4 bg-body-tertiary border p-4 p-md-5 mb-4">
          <span className="badge text-bg-primary rounded-pill mb-3">SCHOOL FITNESS • TEAM CHALLENGE</span>
          <h1 className="display-5 fw-bold mb-2">OctoFit Tracker</h1>
          <p className="lead text-secondary mb-0">
            Build healthy habits, celebrate your team, and keep moving forward.
          </p>
        </div>
        <nav aria-label="OctoFit sections" className="d-flex gap-2 flex-wrap">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link px-3 py-2 rounded-pill border ${
                  isActive ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-secondary'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/activities" replace />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/workouts" element={<Workouts />} />
        </Routes>
      </main>
    </div>
  );
}
