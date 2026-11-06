import test from 'node:test';
import assert from 'node:assert/strict';
import { addedThisMonth, customerDate, customerFormError, customerInitials, customerOrderSummary, joinedDate, ordersForCustomer, phoneHref, searchCustomers } from './customers.js';
const now = new Date(2026, 10, 6, 14);
const customers = [
 { id:'ada', name:'Ada Okafor', phone:'+234 801 234 5678', email:'ada@example.com', createdAt:{toDate:()=>now,toMillis:()=>now.getTime()} },
 { id:'bayo', name:'Bayo Adewale', phone:'0802-111-2222', createdAt:{seconds:new Date(2025,10,6).getTime()/1000} },
 { id:'missing' },
];
const orders = [
 { id:'linked', clientId:'ada', clientName:'Previous name', status:'Delivered', amount:'1000', createdAt:{seconds:10} },
 { id:'other', clientId:'bayo', clientName:'Ada Okafor', status:'Sewing', amount:9000 },
 { id:'legacy', clientName:'  Ada   Okafor ', status:'Ready', amount:2000 },
 { id:'cancelled', clientId:'ada', status:'Cancelled', amount:5000 },
];
test('customer ID keeps renamed customers linked and takes precedence over matching names', () => {
 assert.deepEqual(ordersForCustomer(customers[0], orders).map(o=>o.id), ['linked','legacy','cancelled']);
 assert.deepEqual(ordersForCustomer({...customers[0],name:'New name'},orders).map(o=>o.id), ['linked','cancelled']);
});
test('active work excludes delivered and cancelled orders without removing their history', () => {
 const summary=customerOrderSummary(customers[0],orders);
 assert.equal(summary.total,3);assert.equal(summary.active,1);assert.equal(summary.delivered,1);assert.equal(summary.value,3000);
 assert.equal(customerOrderSummary(customers[0],orders.filter(o=>o.id==='linked')).active,0);
});
test('name, email and formatted phone searches ignore case and surrounding whitespace', () => {
 assert.deepEqual(searchCustomers(customers,'  ADA  ').map(c=>c.id),['ada']);
 assert.deepEqual(searchCustomers(customers,'ADA@EXAMPLE').map(c=>c.id),['ada']);
 assert.deepEqual(searchCustomers(customers,'8012345678').map(c=>c.id),['ada']);
 assert.deepEqual(searchCustomers(customers,'0802 111 2222').map(c=>c.id),['bayo']);
 assert.equal(searchCustomers(customers,'Ada2').length,0);
});
test('missing optional fields and unmatched searches are safe', () => {
 assert.equal(searchCustomers(customers,'').length,3);assert.equal(searchCustomers(customers,'missing-person').length,0);
 assert.equal(ordersForCustomer(customers[2],[{id:'empty'}]).length,0);
});
test('added-this-month handles Firestore timestamps, plain dates, invalid values and different years', () => {
 assert.equal(addedThisMonth([...customers,{createdAt:now},{createdAt:'invalid'}],now),2);
 assert.equal(customerDate({seconds:now.getTime()/1000}).getTime(),now.getTime());
 for(const value of [undefined,null,'invalid',''])assert.equal(customerDate(value),null);
 assert.equal(joinedDate(undefined),'Date unavailable');
});
test('customer initials handle blank names and repeated whitespace', () => {
 assert.equal(customerInitials('  Ada   Okafor '),'AO');assert.equal(customerInitials('Bayo'),'B');assert.equal(customerInitials(''),'?' );
});
test('contact links remove phone formatting without generating empty telephone links', () => {
 assert.equal(phoneHref('+234 (801) 234-5678'),'tel:+2348012345678');assert.equal(phoneHref(''),null);assert.equal(phoneHref('No phone'),null);
});
test('form validation catches names and phone numbers made only of spaces', () => {
 assert.match(customerFormError({name:' ',phone:'080123'}),/name/);assert.match(customerFormError({name:'Ada',phone:' '}),/phone/);
 assert.equal(customerFormError({name:'Ada',phone:'080123'}),'');
});
