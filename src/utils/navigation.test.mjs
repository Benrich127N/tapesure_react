import test from "node:test";
import assert from "node:assert/strict";
import { accountInitial, orderSearchDestination } from "./navigation.js";
test("order search keeps order-page filters while encoding a submitted query",()=>{
 assert.equal(orderSearchDestination("/outfits","?status=active&q=old"," Ada & Obi "),"/outfits?status=active&q=Ada+%26+Obi");
});
test("clearing a submitted order search keeps the remaining filters",()=>{
 assert.equal(orderSearchDestination("/outfits","?q=old&status=active","  "),"/outfits?status=active");
});
test("searching from another page does not carry unrelated query parameters",()=>{
 assert.equal(orderSearchDestination("/calendar","?month=2026-11&edit=true","suit"),"/outfits?q=suit");
 assert.equal(orderSearchDestination("/settings","",""),"/outfits");
});
test("account initials use the saved name consistently with sensible fallbacks",()=>{
 assert.equal(accountInitial("Oluwaseun",{displayName:"Ada",email:"ada@example.com"}),"O");
 assert.equal(accountInitial(undefined,{displayName:"Ada",email:"other@example.com"}),"A");
 assert.equal(accountInitial(" ",{email:"ada@example.com"}),"A");
 assert.equal(accountInitial(null,null),"T");
});
