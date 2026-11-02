# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep page components focused on rendering and user interaction. Use the shared API client for relative `/api` requests, and give each data-driven page explicit loading, empty, and accessible error states. Do not duplicate business rules in the browser.
- Logic tier decision: Keep HTTP concerns and business orchestration in the Express routes/services. Validate request shape and referenced IDs before persistence, return deliberate 4xx responses for invalid or missing resources, and avoid exposing database cast errors as 500 responses.
- Data tier decision: Express persistence constraints in Mongoose schemas and keep seed data representative and idempotent. Store references as ObjectIds and keep persisted fields aligned with the API contract. Do not add authentication as part of this exercise.
- Activity tracking approach: Validate the user and team references, activity type, and minutes before creating an activity. Persist the references, submitted activity details, computed points, and occurrence time together; list activities through the API. Keep the points calculation in the logic tier rather than the UI.
- Team management approach: Require a non-empty name, preserve the submitted name and mascot, and persist the supplied member references. Return teams with member data suitable for presentation.
- Leaderboard approach: Aggregate persisted activity points by team, sort totals descending, then assign 1-based ranks. Return only the contract fields (`teamName`, `totalPoints`, and `rank`) for each entry.
- Workout suggestions approach: Find the user by email, consider their fitness goal and recent activity when selecting suggestions, and include a concise reason for the first recommendation. Return a deliberate 4xx response when no user matches.

## Test plan

Run contract tests from the data tier outward, then verify both builds. A failure in a lower tier should be resolved before treating dependent-tier failures as independent defects.

- Data tier — `npm run test:data --prefix octofit-tracker/backend`: **4 failed, 1 passed** on 2026-11-02. Failures indicate missing required Mongoose validation for user identity/goals, team name/mascot, activity fields, and workout fields. The idempotent seed test passed.
- API — `npm run test:api --prefix octofit-tracker/backend`: **4 failed** on 2026-11-02. Invalid activity and team requests returned `501` instead of `400`, the leaderboard returned no entries, and the first workout suggestion lacked the expected explanatory reason. These indicate missing or incomplete route/service behavior against the API contract.
- Frontend — `npm test --prefix octofit-tracker/frontend`: **15 failed** on 2026-11-02. Failures cover rendering activity/team data, requesting user-specific suggestions, and page loading, empty, and accessible error states. These indicate incomplete presentation behavior and/or API integration.
- Backend build — `npm run build --prefix octofit-tracker/backend`: **passed** on 2026-11-02. A failure indicates backend TypeScript type-check/build errors.
- Frontend build — `npm run build --prefix octofit-tracker/frontend`: **passed** on 2026-11-02. A failure indicates frontend TypeScript or Vite production-build errors.
