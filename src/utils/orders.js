import { isActiveOrder, newestFirst, summarizeDashboard } from "./dashboard.js";

export const orderFilters = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "overdue", label: "Overdue" },
  { value: "delivered", label: "Delivered" },
];

export function selectOrders(records, search = "", filter = "all", now = new Date()) {
  const overdueIds = new Set(summarizeDashboard(records, [], now).overdue.map((order) => order.id));
  const stats = {
    all: records.length,
    active: records.filter(isActiveOrder).length,
    overdue: overdueIds.size,
    delivered: records.filter((order) => order.status === "Delivered").length,
  };
  const term = search.trim().toLocaleLowerCase();
  const orders = newestFirst(records).filter((order) => {
    const matchesSearch = !term || [order.clientName, order.outfitType, order.status]
      .some((value) => String(value || "").toLocaleLowerCase().includes(term));
    const matchesFilter = filter === "active" ? isActiveOrder(order)
      : filter === "overdue" ? overdueIds.has(order.id)
        : filter === "delivered" ? order.status === "Delivered" : true;
    return matchesSearch && matchesFilter;
  });
  return { orders, stats, overdueIds };
}
