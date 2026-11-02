import { Activity, Team, User, Workout } from '../models/index.js';
import { Types } from 'mongoose';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const invalidInput = () => Object.assign(new Error('Invalid activity input'), { status: 400 });
  if (typeof input !== 'object' || input === null || Array.isArray(input)) throw invalidInput();

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  const isObjectId = (value: unknown): value is string =>
    typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
  if (
    !isObjectId(userId) ||
    !isObjectId(teamId) ||
    typeof type !== 'string' ||
    !type.trim() ||
    typeof minutes !== 'number' ||
    !Number.isFinite(minutes) ||
    minutes < 1
  ) {
    throw invalidInput();
  }

  const [user, team] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!user || !team) throw Object.assign(new Error('Activity user or team not found'), { status: 404 });

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const invalidInput = () => Object.assign(new Error('Invalid team input'), { status: 400 });
  if (typeof input !== 'object' || input === null || Array.isArray(input)) throw invalidInput();

  const { name, mascot, members = [] } = input as Record<string, unknown>;
  const isObjectId = (value: unknown): value is string =>
    typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof mascot !== 'string' ||
    !mascot.trim() ||
    !Array.isArray(members) ||
    !members.every(isObjectId)
  ) {
    throw invalidInput();
  }

  if (members.length > 0) {
    const existingMembers = await User.countDocuments({ _id: { $in: members } });
    if (existingMembers !== new Set(members).size) {
      throw Object.assign(new Error('One or more team members were not found'), { status: 404 });
    }
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate<{ _id: Types.ObjectId; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));
  return teams
    .map(({ _id, name }) => ({
      teamName: name,
      totalPoints: pointsByTeam.get(_id.toString()) ?? 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints || a.teamName.localeCompare(b.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).select('_id fitnessGoal').lean();
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).select('type').lean();
  const recentActivityType = recentActivity?.type.toLowerCase() ?? '';
  const recentFocus = /run|cycle|bike|cardio|endurance/.test(recentActivityType)
    ? 'endurance'
    : /strength|weight|resistance/.test(recentActivityType)
      ? 'strength'
      : /mobility|stretch|flexibility/.test(recentActivityType)
        ? 'mobility'
        : recentActivityType;
  const goal = user.fitnessGoal.toLowerCase();
  const workouts = await Workout.find().lean();

  return workouts
    .map((workout, index) => {
      const focus = workout.focus.toLowerCase();
      const matchesGoal = focus === goal;
      const matchesRecentActivity = focus === recentFocus;
      return {
        ...workout,
        reason: matchesGoal
          ? `Recommended to support your ${user.fitnessGoal} goal.`
          : matchesRecentActivity
            ? `Recommended based on your recent ${recentActivityType} activity.`
            : 'Suggested as a complementary workout.',
        relevance: matchesGoal ? 2 : matchesRecentActivity ? 1 : 0,
        index,
      };
    })
    .sort((a, b) => b.relevance - a.relevance || a.index - b.index)
    .map(({ relevance: _relevance, index: _index, ...workout }) => workout);
}

export { User };
