import { useApiData } from '../hooks/useApiData.js';
import { getJson } from '../api/client.js';

type Workout = { title: string; focus?: string; minutes?: number; difficulty?: string; reason?: string };
type WorkoutsResponse = { suggestions: Workout[] };

export default function Workouts() {
  const userEmail = 'mona@example.com';
  const { data, error, loading } = useApiData(
    `/api/workouts/suggestions/${encodeURIComponent(userEmail)}`,
    getJson<WorkoutsResponse>,
  );

  return (
    <section className="card">
      <div className="card-body">
        <h2 className="h4">Workout suggestions</h2>
        <p>Recommend workouts from activity patterns.</p>
        {loading ? <p role="status">Loading workout suggestions...</p> : error ? <p role="alert">Unable to load workout suggestions: {error}</p> : data?.suggestions.length ? (
          <ul className="list-group">
            {data.suggestions.map((workout, index) => (
              <li className="list-group-item" key={`${workout.title}-${index}`}>
                <h3 className="h5">{workout.title}</h3>
                {workout.focus && <p>Focus: {workout.focus}</p>}
                {workout.minutes !== undefined && <p>Duration: {workout.minutes} minutes</p>}
                {workout.difficulty && <p>Difficulty: {workout.difficulty}</p>}
                {workout.reason && <p>{workout.reason}</p>}
              </li>
            ))}
          </ul>
        ) : <p>No workout suggestions available.</p>}
      </div>
    </section>
  );
}
