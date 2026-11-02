import { useApiData } from '../hooks/useApiData.js';
import { getJson } from '../api/client.js';

type Team = { name: string; mascot?: string; members: string[] };
type TeamsResponse = { teams: Team[] };

export default function Teams() {
  const { data, error, loading } = useApiData(
    '/api/teams',
    getJson<TeamsResponse>,
  );

  return (
    <section className="card">
      <div className="card-body">
        <h2 className="h4">Teams</h2>
        <p>Manage teams and members.</p>
        {loading ? <p role="status">Loading teams...</p> : error ? <p role="alert">Unable to load teams: {error}</p> : data?.teams.length ? (
          <ul className="list-group">
            {data.teams.map((team) => (
              <li className="list-group-item" key={team.name}>
                <h3 className="h5">{team.name}</h3>
                {team.mascot && <p>Mascot: {team.mascot}</p>}
                <p>Members: {team.members.join(', ') || 'No members yet'}</p>
              </li>
            ))}
          </ul>
        ) : <p>No teams yet.</p>}
      </div>
    </section>
  );
}
