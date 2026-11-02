import { useApiData } from '../hooks/useApiData.js';
import { getJson } from '../api/client.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  const { data, error, loading } = useApiData(
    '/api/leaderboard',
    getJson<LeaderboardResponse>,
  );

  return (
    <section className="card">
      <div className="card-body">
        <h2 className="h4">Leaderboard</h2>
        <p>Compare team point totals.</p>
        {loading ? <p role="status">Loading leaderboard...</p> : error ? <p role="alert">Unable to load leaderboard: {error}</p> : data?.leaderboard.length ? (
          <ol className="list-group list-group-numbered">
            {data.leaderboard.map((entry) => (
              <li className="list-group-item" key={entry.rank}>
                {entry.teamName}: {entry.totalPoints} points
              </li>
            ))}
          </ol>
        ) : <p>No leaderboard scores yet.</p>}
      </div>
    </section>
  );
}
