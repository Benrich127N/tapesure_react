import test from "node:test";
import assert from "node:assert/strict";
import { onboardingUpdate } from "./onboarding.js";
const user = { uid:"user-1",email:"ada@example.com",displayName:"Ada" };
test("onboarding rejects empty and whitespace-only names",()=>{
 for(const name of ["", "   ", null]) assert.throws(()=>onboardingUpdate(null,user,name,"server-time"),/Enter a shop name/);
});
test("onboarding trims names and changes only setup fields on existing accounts",()=>{
 const profile={shopName:"",onboardingCompleted:false,subscriptionPlan:"pro",createdAt:"original",fullName:"Ada",custom:{keep:true}};
 const changes=onboardingUpdate(profile,user," Ada Couture ","server-time");
 assert.deepEqual(changes,{shopName:"Ada Couture",onboardingCompleted:true,onboardingCompletedAt:"server-time"});
 const saved={...profile,...changes};assert.equal(saved.subscriptionPlan,"pro");assert.equal(saved.createdAt,"original");assert.deepEqual(saved.custom,{keep:true});
});
test("missing profiles receive defaults and an account identity",()=>{
 const changes=onboardingUpdate(null,user,"Ada Couture","server-time");
 assert.equal(changes.uid,user.uid);assert.equal(changes.email,user.email);assert.equal(changes.fullName,"Ada");assert.equal(changes.role,"tailor");assert.equal(changes.subscriptionPlan,"free");assert.equal(changes.createdAt,"server-time");
});
test("a recovered missing profile uses the original auth account creation date when available",()=>{
 const changes=onboardingUpdate(null,{...user,metadata:{creationTime:"Wed, 01 Jan 2025 10:00:00 GMT"}},"Shop","server-time");
 assert.equal(changes.createdAt.toISOString(),"2025-01-01T10:00:00.000Z");
});
test("completed setups are idempotent and cannot rename an already configured shop",()=>{
 assert.equal(onboardingUpdate({shopName:"Existing Shop",onboardingCompleted:true},user,"Replacement","server-time"),null);
});
test("repairing a blank shop name preserves a recorded setup date and account plan",()=>{
 const profile={shopName:"   ",onboardingCompleted:true,onboardingCompletedAt:"original-setup",subscriptionPlan:"enterprise",createdAt:"original"};
 const result={...profile,...onboardingUpdate(profile,user," Shop ","new-time")};
 assert.equal(result.shopName,"Shop");assert.equal(result.onboardingCompletedAt,"original-setup");assert.equal(result.subscriptionPlan,"enterprise");assert.equal(result.createdAt,"original");
});
test("setup does not add plan or creation-date defaults to an existing partial document",()=>{
 const changes=onboardingUpdate({email:user.email},user,"Shop","server-time");
 assert.equal(Object.hasOwn(changes,"subscriptionPlan"),false);assert.equal(Object.hasOwn(changes,"createdAt"),false);
});
