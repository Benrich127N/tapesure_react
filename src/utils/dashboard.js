const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
export const isActiveOrder = (order) => !["Delivered", "Cancelled"].includes(order.status);

// Date inputs are calendar dates. Parse locally to avoid UTC shifting the day.
function calendarDate(value) {
  if (!value) return null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

export function summarizeDashboard(orders, invoices, now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setDate(end.getDate() + 7);
  const active = orders.filter(isActiveOrder).map((order) => {
    const due = calendarDate(order.dueDate);
    return { ...order, due, isDueToday: due?.getTime() === today.getTime() };
  });
  const overdue = active.filter((order) => !order.isDueToday && (order.status === "Delayed" || (order.due && order.due < today)));
  const dueToday = active.filter((order) => order.isDueToday);
  const urgent = [...overdue.sort((a, b) => (a.due?.getTime() ?? 0) - (b.due?.getTime() ?? 0)), ...dueToday];
  const payable = invoices.filter((invoice) => invoice.status !== "Cancelled");
  return {
    overdue,
    dueToday,
    urgent,
    collected: payable.reduce((total, invoice) => total + number(invoice.amountPaid), 0),
    pending: payable.reduce((total, invoice) => total + Math.max(0, number(invoice.balance)), 0),
    expected: payable.reduce((total, invoice) => {
      const due = calendarDate(invoice.dueDate);
      return total + (due && due >= today && due < end ? Math.max(0, number(invoice.balance)) : 0);
    }, 0),
  };
}

export function newestFirst(records) {
  const timestamp = (record) => {
    const value = record.createdAt;
    return (value?.toMillis ? value.toMillis() : value?.seconds != null ? value.seconds * 1000 : new Date(value).getTime()) || 0;
  };
  return [...records].sort((a, b) => timestamp(b) - timestamp(a));
}

export function formatMoney(value, compact = false) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency", currency: "NGN", maximumFractionDigits: compact ? 1 : 2,
    ...(compact && Math.abs(number(value)) >= 100000 ? { notation: "compact" } : {}),
  }).format(number(value));
}

export function formatDueDate(value) {
  return calendarDate(value)?.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) || "Not scheduled";
}
