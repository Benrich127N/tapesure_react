export const measurementGroups = [
  { key: "top", label: "Top", fields: [["shoulder", "Shoulder"], ["chest", "Chest"], ["neck", "Neck"], ["sleeve", "Sleeve"], ["sleeveCircumference", "Sleeve circumference"], ["length", "Top length"]] },
  { key: "trouser", label: "Trouser", fields: [["waist", "Waist"], ["hip", "Hip"], ["lap", "Lap"], ["crotch", "Crotch"], ["knee", "Knee"], ["boot", "Boot"], ["length", "Trouser length"]] },
];
const positive = value => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : "";
export function measurementDraft(raw = {}) {
  raw ||= {};
  const result = { clientGender: String(raw.clientGender || "").toLowerCase(), notes: String(raw.notes || ""), legacyLength: positive(raw.length) };
  for (const group of measurementGroups) {
    result[group.key] = Object.fromEntries(group.fields.map(([key]) => [key, positive(raw[group.key]?.[key] ?? (key === "length" ? undefined : raw[key]))]));
  }
  return result;
}
export function measurementEntries(raw) {
  const draft = measurementDraft(raw);
  const groups = measurementGroups.map(group => ({ ...group, values: group.fields.filter(([key]) => draft[group.key][key] !== "").map(([key, label]) => ({ key, label, value: draft[group.key][key] })) }));
  if (draft.legacyLength !== "") groups.push({ key: "legacy", label: "Other", values: [{ key: "length", label: "Length (legacy)", value: draft.legacyLength }] });
  return groups;
}
export const hasMeasurements = raw => measurementEntries(raw).some(group => group.values.length > 0);
export function measurementPayload(draft, original = {}) {
  original ||= {};
  const result = { ...original, clientGender: draft.clientGender, notes: draft.notes.trim() };
  for (const group of measurementGroups) {
    result[group.key] = { ...original[group.key] };
    for (const [key] of group.fields) {
      const value = draft[group.key][key];
      if (value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0)) throw new Error("Measurements must be zero or a positive number of inches.");
      result[group.key][key] = Number(value) || 0;
      // Keep legacy flat values in sync for readers of older records.
      if (key !== "length" && Object.hasOwn(original, key)) result[key] = result[group.key][key];
    }
  }
  if (Object.hasOwn(original, "length")) {
    if (draft.legacyLength !== "" && (!Number.isFinite(Number(draft.legacyLength)) || Number(draft.legacyLength) < 0)) throw new Error("Length must be zero or a positive number of inches.");
    result.length = Number(draft.legacyLength) || 0;
  }
  return result;
}
export function measurementsChanged(draft, raw) {
  const comparable = value => { const normalized = measurementDraft(value); normalized.notes = normalized.notes.trim(); return normalized; };
  return JSON.stringify(comparable(measurementPayload(draft, raw))) !== JSON.stringify(comparable(raw));
}

export function measurementDate(record) {
  const value = record.measurementsUpdatedAt ?? record.createdAt;
  if (!value) return null;
  let date;
  try {
    date = value?.toDate ? value.toDate() : value?.seconds != null ? new Date(value.seconds * 1000) : /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  } catch { return null; }
  if (Number.isNaN(date.getTime())) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}` !== value) return null;
  return date;
}
export const measurementDateLabel = record => measurementDate(record)?.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) || "Date not recorded";
export function latestMeasurements(records) {
  const measured = records.filter(record => hasMeasurements(record.measurements));
  const knownIds = new Map();
  const nameKey = record => String(record.clientName || "").trim().toLocaleLowerCase();
  for (const record of measured) {
    if (record.clientId && nameKey(record)) {
      const ids = knownIds.get(nameKey(record)) || new Set();
      ids.add(record.clientId); knownIds.set(nameKey(record), ids);
    }
  }
  const clients = new Map();
  const sorted = [...measured].sort((a,b) => (measurementDate(b)?.getTime() || 0) - (measurementDate(a)?.getTime() || 0) || String(a.id).localeCompare(String(b.id)));
  for (const record of sorted) {
    const name = nameKey(record), ids = knownIds.get(name);
    const key = record.clientId ? `id:${record.clientId}` : ids?.size === 1 ? `id:${[...ids][0]}` : !name || ids?.size > 1 ? `record:${record.id}` : `name:${name}`;
    if (!clients.has(key)) clients.set(key, record);
  }
  return [...clients.values()];
}
export function filterMeasurements(records, search, gender) {
  const term = search.trim().toLocaleLowerCase();
  return records.filter(record => [record.clientName, record.outfitType].some(value => String(value || "").toLocaleLowerCase().includes(term)) && (gender === "all" || (gender === "other" ? !["male", "female"].includes(measurementDraft(record.measurements).clientGender) : measurementDraft(record.measurements).clientGender === gender)));
}
function csvCell(value) {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function measurementsCSV(records) {
  const headers = ["Customer", "Gender", "Outfit", "Measurement date", ...measurementGroups.flatMap(group => group.fields.map(([,label]) => `${label} (inches)`)), "Length (legacy, inches)", "Notes"];
  const rows = records.map(record => {
    const draft = measurementDraft(record.measurements), date = measurementDate(record);
    const day = date ? `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}` : "";
    return [record.clientName, draft.clientGender, record.outfitType, day, ...measurementGroups.flatMap(group => group.fields.map(([key]) => draft[group.key][key])), draft.legacyLength, draft.notes];
  });
  return "\uFEFF" + [headers, ...rows].map(row => row.map(csvCell).join(",")).join("\r\n");
}
