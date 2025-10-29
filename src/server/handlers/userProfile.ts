import { redis, reddit } from '@devvit/web/server';
import { UserProfile } from '../../shared/types/api';

const AVATAR_CACHE_TTL = 3600;

/**
 * Get Reddit username from user ID (t2_xxxxx format)
 * @param userId - Reddit internal user ID (t2_xxxxx) or username
 * @returns Reddit username
 */
export async function getUsernameFromId(userId: string): Promise<string> {
  if (!userId || userId === 'anonymous') {
    return 'anonymous';
  }

  // If userId starts with t2_, it's an internal ID, fetch username from Reddit
  if (userId.startsWith('t2_')) {
    try {
      const user = await reddit.getUserById(userId as `t2_${string}`);
      if (!user) {
        console.error(`User not found for ${userId}`);
        return 'anonymous';
      }
      return user.username;
    } catch (error) {
      console.error(`Error fetching username for ${userId}:`, error);
      return 'anonymous';
    }
  }

  // Otherwise, it's already a username
  return userId;
}

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
