import test from 'node:test';
import assert from 'node:assert/strict';
import { dateKey, monthKey, selectSchedule, shiftMonth, scheduleAppearance } from './calendar.js';
import { summarizeDashboard } from './dashboard.js';
const now = new Date(2026, 10, 6, 14, 30);
const orders = [
  { id: 'overdue', clientName: 'Ada', status: 'Sewing', dueDate: '2026-11-05' },
  { id: 'today', clientName: 'Bayo', status: 'Ready', dueDate: '2026-11-06' },
  { id: 'later', clientName: 'Chioma', status: 'Received', dueDate: '2026-11-07' },
  { id: 'delivered', clientName: 'Emeka', status: 'Delivered', dueDate: '2026-11-03' },
  { id: 'cancelled', status: 'Cancelled', dueDate: '2026-11-06' },
  { id: 'next', status: 'Pending', dueDate: '2026-12-01' },
  { id: 'missing', status: 'Received' },
  { id: 'invalid', status: 'Received', dueDate: '2026-02-30' },
];
test('default schedule excludes cancelled work but includes delivered history', () => {
  const result = selectSchedule(orders, '2026-11-01', 'all', now);
  assert.deepEqual(result.inMonth.map(o => o.id), ['delivered','overdue','today','later']);
  assert.equal(result.scheduled.length, 5);
  assert.equal(result.unscheduled.length, 2);
});
test('overdue schedule agrees with Dashboard and Orders calendar-day rules', () => {
  const result = selectSchedule(orders, '2026-11-01', 'overdue', now);
  assert.deepEqual(result.inMonth.map(o => o.id), summarizeDashboard(orders, [], now).overdue.filter(o => o.dueDate.startsWith('2026-11')).map(o => o.id));
  assert.equal(result.overdueCount, 1);
});
test('filters distinguish active, ready, delivered and cancelled', () => {
  assert.equal(selectSchedule(orders, '2026-11-01', 'active', now).inMonth.length, 3);
  assert.deepEqual(selectSchedule(orders, '2026-11-01', 'ready', now).inMonth.map(o => o.id), ['today']);
  assert.deepEqual(selectSchedule(orders, '2026-11-01', 'delivered', now).inMonth.map(o => o.id), ['delivered']);
  assert.deepEqual(selectSchedule(orders, '2026-11-01', 'cancelled', now).inMonth.map(o => o.id), ['cancelled']);
});
test('agenda groups dates chronologically and sorts customers without changing source records', () => {
  const source = [{ id: 'z', clientName: 'Zara', dueDate: '2026-11-06' }, { id: 'a', clientName: 'Ada', dueDate: '2026-11-06' }, { id: 'past', dueDate: '2026-11-01' }];
  const groups = selectSchedule(source, '2026-11-01', 'all', now).groups;
  assert.deepEqual(groups.map(g => g.date), ['2026-11-01', '2026-11-06']);
  assert.deepEqual(groups[1].orders.map(o => o.id), ['a', 'z']);
  assert.equal(source[0].id, 'z');
});
test('month navigation handles December, leap years and long-month dates', () => {
  assert.equal(monthKey(new Date(2026, 10, 30)), '2026-11-01');
  assert.equal(shiftMonth('2026-12-31', 1), '2027-01-01');
  assert.equal(shiftMonth('2026-01-31', -1), '2025-12-01');
  assert.equal(shiftMonth('2024-01-31', 1), '2024-02-01');
});
test('date normalization preserves local days and rejects missing and impossible dates', () => {
  assert.equal(dateKey(now), '2026-11-06');
  assert.equal(dateKey({ toDate: () => new Date(2026, 10, 6) }), '2026-11-06');
  assert.equal(dateKey('2024-02-29'), '2024-02-29');
  for (const value of [null, '', 'bad', '2026-02-30', '2026-13-01', '2026-02-29']) assert.equal(dateKey(value), null);
});
test('all event backgrounds provide strong contrast and explicit status text', () => {
  const luminance = hex => {
    const rgb = hex.slice(1).match(/../g).map(v => parseInt(v,16)/255).map(v => v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
    return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;
  };
  for (const status of ['Received','Sewing','Ready','Delivered','Pending','Delayed','Cancelled']) {
    const appearance = scheduleAppearance({ status });
    assert.equal(appearance.label, status);
    const a=luminance(appearance.color),b=luminance(appearance.background);
    assert.ok((Math.max(a,b)+0.05)/(Math.min(a,b)+0.05)>=4.5);
  }
  assert.equal(scheduleAppearance({status:'Ready',overdue:true}).label, 'Overdue · Ready');
});
test('empty month and empty account are safe', () => {
  assert.deepEqual(selectSchedule([], '2026-11-01', 'all', now).groups, []);
  assert.equal(selectSchedule(orders, '2027-01-01', 'all', now).inMonth.length, 0);
});
