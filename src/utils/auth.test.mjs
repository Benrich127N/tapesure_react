import test from "node:test";
import assert from "node:assert/strict";
import { authErrorMessage, googleCancelled, validateAuth } from "./auth.js";
test("auth validation trims email, rejects invalid addresses, and keeps password whitespace intact",()=>{
 assert.deepEqual(validateAuth("signup"," ada@example.com ","valid-pass"),{});
 assert.ok(validateAuth("login","not-an-email","pass").email);
 assert.ok(validateAuth("login","ada @example.com","pass").email);
 assert.ok(validateAuth("login","","").email);
 assert.ok(validateAuth("login","","").password);
});
test("signup requirements do not block login with a shorter existing password",()=>{
 assert.ok(validateAuth("signup","ada@example.com","12345").password);
 assert.deepEqual(validateAuth("login","ada@example.com","12345"),{});
});
test("provider errors become useful messages without exposing server details",()=>{
 assert.match(authErrorMessage({code:"auth/invalid-credential",message:"private"}),/email or password/);
 assert.match(authErrorMessage({code:"auth/network-request-failed"}),/connection/);
 assert.match(authErrorMessage({code:"auth/popup-blocked"}),/Allow pop-ups/);
 assert.match(authErrorMessage({code:"auth/email-already-in-use"}),/Sign in instead/);
 assert.ok(!authErrorMessage({code:"unknown",message:"sensitive backend error"}).includes("sensitive"));
});
test("popup cancellation is neutral and distinct from a blocked popup",()=>{
 assert.equal(googleCancelled({code:"auth/popup-closed-by-user"}),true);
 assert.equal(googleCancelled({code:"auth/cancelled-popup-request"}),true);
 assert.equal(googleCancelled({code:"auth/popup-blocked"}),false);
});
test("reset errors have reset-specific recovery guidance",()=>{
 assert.match(authErrorMessage({code:"auth/too-many-requests"},"reset"),/Wait/);
 assert.match(authErrorMessage({},"reset"),/reset link/);
});
