import test from "node:test";
import assert from "node:assert/strict";
import { filterMeasurements, hasMeasurements, latestMeasurements, measurementDate, measurementDraft, measurementPayload, measurementsChanged, measurementsCSV } from "./measurements.js";
const nested = { clientGender:"male", top:{shoulder:18,chest:42,neck:16,sleeve:25,sleeveCircumference:14,length:32,custom:7},trouser:{waist:34,hip:40,lap:24,crotch:12,knee:18,boot:16,length:42},notes:" note ",customMetadata:{source:"tape"} };
test("unchanged measurement drafts do not request a measurement overwrite",()=>{
  assert.equal(measurementsChanged(measurementDraft(nested),nested),false);
  assert.equal(measurementsChanged(measurementDraft(null),null),false);
  const draft=measurementDraft(nested);draft.top.neck=17;
  assert.equal(measurementsChanged(draft,nested),true);
  const saved=measurementPayload(draft,nested);
  assert.equal(saved.top.neck,17);assert.equal(saved.top.chest,42);assert.equal(saved.trouser.length,42);assert.equal(saved.top.custom,7);assert.deepEqual(saved.customMetadata,{source:"tape"});
});
test("legacy measurements keep ambiguous length separate and synchronize updated legacy fields",()=>{
  const raw={chest:38,waist:30,hip:40,sleeve:24,length:55,notes:"legacy",custom:123};
  const draft=measurementDraft(raw);assert.equal(draft.top.chest,38);assert.equal(draft.trouser.waist,30);assert.equal(draft.top.length,"");assert.equal(draft.legacyLength,55);
  assert.equal(measurementsChanged(draft,raw),false);draft.top.chest=39;
  const saved=measurementPayload(draft,raw);assert.equal(saved.chest,39);assert.equal(saved.top.chest,39);assert.equal(saved.length,55);assert.equal(saved.custom,123);
});
test("empty, zero-only and notes-only objects are excluded; any recorded positive field qualifies",()=>{
  for(const raw of [null,{}, {top:{},trouser:{}}, {top:{chest:0}}, {notes:"notes"}, {top:{chest:Infinity}}])assert.equal(hasMeasurements(raw),false);
  assert.equal(hasMeasurements({top:{neck:15}}),true);assert.equal(hasMeasurements({chest:38}),true);
});
test("dates accept Firestore timestamps, serialized timestamps and strings safely",()=>{
  assert.equal(measurementDate({createdAt:"2026-11-06"}).getDate(),6);
  assert.equal(measurementDate({createdAt:{toDate:()=>new Date(2026,10,6)}}).getDate(),6);
  assert.equal(measurementDate({createdAt:{seconds:1793923200}}).getFullYear(),2026);
  for(const createdAt of [undefined,"bad","2026-02-30",{toDate:()=>{throw new Error();}}])assert.equal(measurementDate({createdAt}),null);
});
test("same-name customers stay distinct and renamed customers retain one latest record",()=>{
  const records=[{id:"old",clientId:"1",clientName:"Old name",createdAt:"2026-10-01",measurements:nested},{id:"new",clientId:"1",clientName:"Alex",createdAt:"2026-11-01",measurements:nested},{id:"different",clientId:"2",clientName:"Alex",createdAt:"2026-10-20",measurements:nested}];
  assert.deepEqual(latestMeasurements(records).map(r=>r.id),["new","different"]);
  assert.deepEqual(records.map(r=>r.id),["old","new","different"]);
});
test("legacy name matches join only a single known identity and missing dates cannot displace dated records",()=>{
 const records=[{id:"legacy",clientName:" alex ",measurements:nested},{id:"dated",clientId:"1",clientName:"Alex",createdAt:"2026-11-01",measurements:nested}];
 assert.deepEqual(latestMeasurements(records).map(r=>r.id),["dated"]);
 assert.equal(latestMeasurements([...records,{id:"other",clientId:"2",clientName:"Alex",measurements:nested}]).length,3);
});
test("filtering latest records does not change global counts or resurface older orders",()=>{
 const records=latestMeasurements([{id:"old",clientId:"1",clientName:"Ada",outfitType:"Old dress",createdAt:"2026-10-01",measurements:nested},{id:"new",clientId:"1",clientName:"Ada",outfitType:"New suit",createdAt:"2026-11-01",measurements:nested}]);
 assert.equal(filterMeasurements(records," ADA ","male").length,1);assert.equal(filterMeasurements(records,"old dress","all").length,0);assert.equal(records.length,1);
 assert.equal(filterMeasurements([{measurements:{chest:30}}],"","other").length,1);
});
test("CSV quotes delimiters, quotes and newlines, includes units, and preserves displayed row scope",()=>{
 const csv=measurementsCSV([{clientName:'Ada, "Obi"',outfitType:"=formula",createdAt:"2026-11-06",measurements:{...nested,notes:"first\nsecond"}}]);
 assert.ok(csv.startsWith("\uFEFF"));assert.ok(csv.includes('"Ada, ""Obi"""'));assert.ok(csv.includes('"\'=formula"'));assert.ok(csv.includes('"first\nsecond"'));assert.ok(csv.includes('"Shoulder (inches)"'));assert.ok(csv.includes('"2026-11-06"'));
});
test("negative and invalid measurement inputs cannot be saved",()=>{
 for(const value of [-1,"bad",Infinity]){const draft=measurementDraft(nested);draft.top.chest=value;assert.throws(()=>measurementPayload(draft,nested));}
});
