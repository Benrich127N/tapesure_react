import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeDashboard, newestFirst, formatDueDate, formatMoney } from './dashboard.js';

const now = new Date(2026, 10, 6, 14, 30);
test('older overdue orders are included beyond the recent ten', () => {
  const orders = Array.from({ length: 12 }, (_, i) => ({ id: String(i), status: 'Sewing', dueDate: '2026-11-20' }));
  orders.push({ id: 'old', status: 'Received', dueDate: '2026-11-05' });
  assert.deepEqual(summarizeDashboard(orders, [], now).overdue.map(o => o.id), ['old']);
});
test('today is a calendar day, excludes completed/cancelled work, and orders oldest first', () => {
  const result = summarizeDashboard([
    { id: 'today', status: 'Fitting', dueDate: '2026-11-06' },
    { id: 'newer', status: 'Sewing', dueDate: '2026-11-05' },
    { id: 'older', status: 'Cutting', dueDate: '2026-11-02' },
    { id: 'delivered', status: 'Delivered', dueDate: '2026-11-01' },
    { id: 'cancelled', status: 'Cancelled', dueDate: '2026-11-01' },
  ], [], now);
  assert.deepEqual(result.urgent.map(o => o.id), ['older', 'newer', 'today']);
  assert.equal(result.dueToday.length, 1);
  assert.equal(result.overdue.length, 2);
});
test('explicitly delayed work remains visible even without a valid date', () => {
  const result = summarizeDashboard([{ id: 'delayed', status: 'Delayed', dueDate: '' }, { status: 'Received', dueDate: 'invalid' }], [], now);
  assert.deepEqual(result.urgent.map(o => o.id), ['delayed']);
});
test('payment totals use actual payments and balances independently of delivery state', () => {
  const result = summarizeDashboard([{ status: 'Delivered', amount: 999999 }], [
    { amountPaid: 3000, balance: 7000, dueDate: '2026-11-06' },
    { amountPaid: '2000', balance: '8000', dueDate: '2026-11-12' },
    { amountPaid: 5000, balance: 0, dueDate: '2026-11-07' },
    { amountPaid: 9999, balance: 9999, status: 'Cancelled' },
  ], now);
  assert.equal(result.collected, 10000);
  assert.equal(result.pending, 15000);
  assert.equal(result.expected, 15000);
});
test('seven-day window includes today and day six, excludes overdue and day seven', () => {
  const invoices = ['2026-11-05', '2026-11-06', '2026-11-12', '2026-11-13'].map(dueDate => ({ dueDate, balance: 100 }));
  assert.equal(summarizeDashboard([], invoices, now).expected, 200);
});
test('invalid money and negative balances cannot corrupt totals', () => {
  const result = summarizeDashboard([], [{ amountPaid: 'invalid', balance: -10 }, { amountPaid: Infinity, balance: 'invalid' }], now);
  assert.equal(result.collected, 0);
  assert.equal(result.pending, 0);
});
test('recent records handle Firestore timestamps and missing creation dates without mutation', () => {
  const records = [{ id: 'missing' }, { id: 'old', createdAt: { seconds: 1 } }, { id: 'new', createdAt: { toMillis: () => 3000 } }];
  assert.deepEqual(newestFirst(records).map(r => r.id), ['new', 'old', 'missing']);
  assert.equal(records[0].id, 'missing');
});
test('formatting handles missing dates and compact large currency values', () => {
  assert.equal(formatDueDate('bad'), 'Not scheduled');
  assert.match(formatDueDate('2026-11-06'), /6 Nov 2026/);
  assert.match(formatMoney(1250000, true), /1\.3M/);
  assert.match(formatMoney(1250000), /1,250,000/);
});
