export const SHOP_PROFILE_KEY = "tapesure.shopProfile";
export const MEASUREMENT_SUBMISSIONS_KEY = "tapesure.measurementSubmissions";

export const defaultShopProfile = {
  shopName: "John's Tailoring Studio",
  shareSlug: "johns-tailoring-studio",
  ownerName: "John Doe",
  email: "john.doe@example.com",
};

export const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const readJson = (key, fallback) => {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

export const getShopProfile = () =>
  readJson(SHOP_PROFILE_KEY, defaultShopProfile);

export const saveShopProfile = (profile) => {
  window.localStorage.setItem(SHOP_PROFILE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event("tapesure:profile-updated"));
};

export const getMeasurementSubmissions = () =>
  readJson(MEASUREMENT_SUBMISSIONS_KEY, []);

export const saveMeasurementSubmission = (submission) => {
  const submissions = getMeasurementSubmissions();
  window.localStorage.setItem(
    MEASUREMENT_SUBMISSIONS_KEY,
    JSON.stringify([submission, ...submissions]),
  );
  window.dispatchEvent(new Event("tapesure:measurements-updated"));
};

export const getShareUrl = (slug) =>
  `${window.location.origin}/measurements/${slug}`;
