import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSettings, settingsChanged, saveSettings } from "./settings.js";

const saved = { shopName: "Ada Tailoring", fullName: "Ada", phone: "08012345678" };
test("settings trim optional values without requiring a name or phone", () => {
  assert.deepEqual(normalizeSettings({ shopName: " Shop ", fullName: " ", phone: null }), { shopName: "Shop", fullName: "", phone: "" });
  assert.equal(settingsChanged({ ...saved, shopName: " Ada Tailoring " }, saved), false);
  assert.equal(settingsChanged({ ...saved, phone: "" }, saved), true);
});
test("blank shop names never reach either save service", async () => {
  let calls = 0;
  await assert.rejects(saveSettings({ values: { ...saved, shopName: "  " }, saved, saveShop: () => calls++, syncName: () => calls++ }), /Shop name/);
  assert.equal(calls, 0);
});
test("a failed shop save leaves the account name untouched", async () => {
  let synced = false;
  await assert.rejects(saveSettings({ values: { ...saved, fullName: "Ada Obi" }, saved, saveShop: async () => { throw new Error("offline"); }, syncName: async () => { synced = true; } }), /offline/);
  assert.equal(synced, false);
});
test("successful shop save followed by name failure reports a partial success", async () => {
  const calls = [];
  const values = { ...saved, fullName: " Ada Obi " };
  const result = await saveSettings({ values, saved, saveShop: async values => { calls.push(["shop", values]); }, syncName: async () => { calls.push(["name"]); throw new Error("offline"); } });
  assert.equal(result.needsNameSync, true);
  assert.equal(result.values.fullName, "Ada Obi");
  assert.deepEqual(calls.map(call => call[0]), ["shop", "name"]);
});
test("retrying the account name sync does not rewrite saved shop data", async () => {
  let writes = 0;
  const names = [];
  const result = await saveSettings({ values: saved, saved, needsNameSync: true, saveShop: async () => writes++, syncName: async name => names.push(name) });
  assert.equal(writes, 0);
  assert.deepEqual(names, ["Ada"]);
  assert.equal(result.needsNameSync, false);
});
test("changing only shop details does not unnecessarily update the account name", async () => {
  let writes = 0;
  let syncs = 0;
  const result = await saveSettings({ values: { ...saved, shopName: "Ada Couture" }, saved, saveShop: async () => writes++, syncName: async () => syncs++ });
  assert.equal(writes, 1);
  assert.equal(syncs, 0);
  assert.equal(result.needsNameSync, false);
});
test("clearing an optional name updates both sources to an empty name", async () => {
  const writes = [];
  const result = await saveSettings({ values: { ...saved, fullName: "" }, saved, saveShop: async values => writes.push(values.fullName), syncName: async name => writes.push(name) });
  assert.deepEqual(writes, ["", ""]);
  assert.equal(result.needsNameSync, false);
});
