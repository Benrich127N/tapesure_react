import test from 'node:test';
import assert from 'node:assert/strict';
import { selectOrders } from './orders.js';
import { summarizeDashboard } from './dashboard.js';
const now = new Date(2026, 10, 6, 14, 30);
const records = [
  { id: 'pending', clientName: 'Ada', outfitType: 'Dress', status: 'Pending', dueDate: '2026-11-10', createdAt: { seconds: 1 } },
  { id: 'ready', clientName: 'Bayo', outfitType: 'Suit', status: 'Ready', dueDate: '2026-11-05', createdAt: { seconds: 3 } },
  { id: 'delivered', clientName: 'Ada', outfitType: 'Blouse', status: 'Delivered', dueDate: '2026-11-01', createdAt: { seconds: 4 } },
  { id: 'cancelled', status: 'Cancelled', dueDate: '2026-11-01' },
  { id: 'delayed', status: 'Delayed' },
  { id: 'today', status: 'Sewing', dueDate: '2026-11-06', createdAt: { seconds: 2 } },
];
test('active counts include Pending and Ready, excluding delivered and cancelled', () => {
  const result = selectOrders(records, '', 'active', now);
  assert.equal(result.stats.active, 4);
  assert.deepEqual(new Set(result.orders.map(o => o.id)), new Set(['pending', 'ready', 'delayed', 'today']));
});
test('overdue filter agrees with the dashboard and excludes deliveries due today', () => {
  const result = selectOrders(records, '', 'overdue', now);
  assert.deepEqual(result.orders.map(o => o.id).sort(), summarizeDashboard(records, [], now).overdue.map(o => o.id).sort());
  assert.equal(result.stats.overdue, 2);
});
test('search combines with status without changing global totals', () => {
  const result = selectOrders(records, '  ADA  ', 'delivered', now);
  assert.deepEqual(result.orders.map(o => o.id), ['delivered']);
  assert.equal(result.stats.all, 6);
  assert.equal(result.stats.active, 4);
});
test('search matches outfit type and status with no assumption about optional fields', () => {
  assert.deepEqual(selectOrders(records, 'suit', 'all', now).orders.map(o => o.id), ['ready']);
  assert.deepEqual(selectOrders(records, 'sewing', 'all', now).orders.map(o => o.id), ['today']);
  assert.deepEqual(selectOrders([{ id: 'missing' }], '', 'all', now).orders.map(o => o.id), ['missing']);
});
test('no results, empty data and invalid filters are handled safely', () => {
  assert.equal(selectOrders(records, 'no such customer', 'active', now).orders.length, 0);
  assert.equal(selectOrders([], '', 'all', now).stats.all, 0);
  assert.equal(selectOrders(records, '', 'invalid', now).orders.length, 6);
});
test('newest records come first, without excluding or mutating undated orders', () => {
  const result = selectOrders(records, '', 'all', now);
  assert.deepEqual(result.orders.slice(0, 4).map(o => o.id), ['delivered', 'ready', 'today', 'pending']);
  assert.equal(result.orders.length, records.length);
  assert.equal(records[0].id, 'pending');
});
