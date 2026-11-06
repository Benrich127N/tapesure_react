export function onboardingUpdate(profile, user, rawName, timestamp) {
  const shopName = String(rawName || "").trim();
  if (!shopName) throw new Error("Enter a shop name to continue.");
  if (profile?.onboardingCompleted && String(profile.shopName || "").trim()) return null;
  const changes = { shopName, onboardingCompleted: true, onboardingCompletedAt: profile?.onboardingCompletedAt ?? timestamp };
  if (!profile) {
    const creation = user.metadata?.creationTime ? new Date(user.metadata.creationTime) : null;
    Object.assign(changes, { uid: user.uid, email: user.email || "", fullName: user.displayName || "", role: "tailor", subscriptionPlan: "free", createdAt: creation && !Number.isNaN(creation.getTime()) ? creation : timestamp });
  }
  return changes;
}
