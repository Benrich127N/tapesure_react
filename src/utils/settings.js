export function normalizeSettings(values) {
  return {
    shopName: String(values.shopName || "").trim(),
    fullName: String(values.fullName || "").trim(),
    phone: String(values.phone || "").trim(),
  };
}

export function settingsChanged(values, saved) {
  const current = normalizeSettings(values);
  const previous = normalizeSettings(saved);
  return Object.keys(current).some(key => current[key] !== previous[key]);
}

// Shop data is authoritative. A failed account-name sync can be retried without
// writing the shop data again or describing a successful shop save as a failure.
export async function saveSettings({ values, saved, needsNameSync, saveShop, syncName }) {
  const normalized = normalizeSettings(values);
  if (!normalized.shopName) throw new Error("Shop name is required.");
  if (settingsChanged(normalized, saved)) await saveShop(normalized);
  if (needsNameSync || normalized.fullName !== normalizeSettings(saved).fullName) {
    try { await syncName(normalized.fullName); }
    catch { return { values: normalized, needsNameSync: true }; }
  }
  return { values: normalized, needsNameSync: false };
}
