// Shared in-memory candidate profile store for local development and offline fallback
export const userProfilesMap = new Map<string, any>();

export function getProfileMemory(userId: string): any | null {
  return userProfilesMap.get(userId) || null;
}

export function setProfileMemory(userId: string, data: any): void {
  userProfilesMap.set(userId, data);
}

export function deleteUserProfileMemory(userId: string): boolean {
  return userProfilesMap.delete(userId);
}
