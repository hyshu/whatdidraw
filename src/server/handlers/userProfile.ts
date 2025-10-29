import { redis, reddit } from '@devvit/web/server';
import { UserProfile } from '../../shared/types/api';

const AVATAR_CACHE_TTL = 3600;

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const cacheKey = `cache:avatar:${userId}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error(`Error reading avatar cache for ${userId}:`, error);
  }

  let avatarUrl: string | undefined = undefined;

  try {
    const user = await reddit.getUserByUsername(userId);
    if (user) {
      avatarUrl = await user.getSnoovatarUrl();
    }
  } catch (error) {
    console.error(`Error fetching avatar for ${userId}:`, error);
  }

  const profile: UserProfile = {
    userId,
    displayName: `u/${userId}`,
    ...(avatarUrl ? { avatarUrl } : {}),
  };

  try {
    await redis.set(cacheKey, JSON.stringify(profile), { expiration: new Date(Date.now() + AVATAR_CACHE_TTL * 1000) });
  } catch (error) {
    console.error(`Error caching avatar for ${userId}:`, error);
  }

  return profile;
}

export async function getUserProfiles(userIds: string[]): Promise<Map<string, UserProfile>> {
  const profiles = new Map<string, UserProfile>();

  await Promise.all(
    userIds.map(async (userId) => {
      const profile = await getUserProfile(userId);
      profiles.set(userId, profile);
    })
  );

  return profiles;
}
