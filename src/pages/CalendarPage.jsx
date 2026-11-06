import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { AlertCircle, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { db, auth } from "../../firebase";
import { dateKey, monthKey, scheduleAppearance, scheduleFilters, selectSchedule, shiftMonth } from "../utils/calendar";
import "./CalendarPage.css";

const actionClass = "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition";
const panelClass = "min-w-0 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-6";
const fullDate = (date) => new Date(`${date}T00:00:00`).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

function DeliveryList({ orders }) {
  return <ul className="space-y-3">{orders.map((order) => {
    const appearance = scheduleAppearance(order);
    return <li key={order.id}>
      <Link to={`/outfits/${order.id}`} aria-label={`View order for ${order.clientName || "customer"}, ${order.outfitType || "outfit"}, ${appearance.label}`} className="flex min-h-11 items-center gap-3 rounded-lg border border-gray-700 bg-gray-800/50 p-3 hover:border-indigo-400 hover:bg-gray-800">
        <div className="min-w-0 flex-1 break-words">
          <h3 className="text-sm font-semibold text-gray-100">{order.clientName || "Customer"}</h3>
          <p className="mt-1 text-sm text-gray-300">{order.outfitType || "Order"}</p>
          <span className="mt-2 inline-flex max-w-full break-words rounded-md border px-2 py-1 text-xs font-medium" style={{ backgroundColor: appearance.background, color: appearance.color, borderColor: appearance.border }}>{appearance.label}</span>
        </div>
        <ArrowRight aria-hidden="true" size={18} className="shrink-0 text-indigo-300" />
      </Link>
    </li>;
  })}</ul>;
}

export default function CalendarPage() {
  const [source, setSource] = useState({ orders: [], loading: true, error: false });
  const [attempt, setAttempt] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [month, setMonth] = useState(() => monthKey(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const [filter, setFilter] = useState("all");
  const [wideScreen, setWideScreen] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  const [viewPreference, setViewPreference] = useState(null);
  const [calendarWidth, setCalendarWidth] = useState(0);
  const view = viewPreference || (wideScreen ? "month" : "agenda");
  const calendarRef = useRef(null);
  const calendarHost = useRef(null);
  const dayHeading = useRef(null);
  const result = selectSchedule(source.orders, month, filter, now);
  const selectedOrders = result.scheduled.filter((order) => order.date === selectedDate);
  const monthLabel = new Date(`${month}T00:00:00`).toLocaleDateString("en-NG", { month: "long", year: "numeric" });
  const compactMonth = calendarWidth < 560;
  const counts = new Map();
  for (const order of result.scheduled) counts.set(order.date, (counts.get(order.date) || 0) + 1);

  useEffect(() => {
    if (!auth.currentUser) return;
    setSource({ orders: [], loading: true, error: false });
    return onSnapshot(
      query(collection(db, "outfits"), where("userId", "==", auth.currentUser.uid)),
      (snapshot) => setSource({ orders: snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })), loading: false, error: false }),
      () => setSource({ orders: [], loading: false, error: true }),
    );
  }, [attempt]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setWideScreen(media.matches);
    media.addEventListener("change", update);
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => { media.removeEventListener("change", update); window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    calendarRef.current?.getApi().gotoDate(month);
  }, [month, view, source.loading, source.error]);

  useEffect(() => {
    const host = calendarHost.current;
    if (!host) return;
    let frame;
    let previousWidth = -1;
    const resize = () => {
      const width = Math.round(host.getBoundingClientRect().width);
      if (width === previousWidth) return;
      previousWidth = width;
      setCalendarWidth(width);
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => calendarRef.current?.getApi().updateSize());
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    return () => { observer.disconnect(); window.cancelAnimationFrame(frame); };
  }, [view, source.loading, source.error]);

  const chooseDate = (date) => {
    setSelectedDate(date);
    if (date.slice(0, 7) !== month.slice(0, 7)) setMonth(monthKey(date));
    window.requestAnimationFrame(() => {
      dayHeading.current?.focus({ preventScroll: true });
      dayHeading.current?.scrollIntoView({ block: "nearest", behavior: "auto" });
    });
  };
  const changeMonth = (offset) => {
    const next = shiftMonth(month, offset);
    setMonth(next);
    setSelectedDate(next);
  };
  const goToToday = () => { setMonth(monthKey(now)); setSelectedDate(dateKey(now)); };
  const events = result.scheduled.map((order) => {
    const appearance = scheduleAppearance(order);
    return {
      id: order.id,
      title: `${order.clientName || "Customer"} — ${order.outfitType || "Order"}`,
      start: order.date,
      allDay: true,
      url: "#calendar-day-details",
      display: compactMonth ? "none" : "block",
      backgroundColor: appearance.background,
      borderColor: appearance.border,
      textColor: appearance.color,
      extendedProps: { order, appearance },
    };
  });

  return <div className="delivery-schedule space-y-4 sm:space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white sm:text-3xl"><CalendarDays aria-hidden="true" className="shrink-0 text-indigo-300" size={26} /> Delivery schedule</h1>
        <p className="mt-1 text-sm text-gray-300">Plan deliveries and keep track of upcoming deadlines.</p>
      </div>
      <Link to="/outfits/new" className={`${actionClass} bg-indigo-600 px-4 text-white hover:bg-indigo-500`}><Plus aria-hidden="true" size={18} /> New order</Link>
    </header>

    <section aria-label="Schedule controls" className={panelClass}>
      <div className="schedule-control-layout">
        <div className="schedule-period-controls flex min-w-0 items-center justify-between gap-2">
          <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)} className={`${actionClass} border border-gray-700 text-gray-200 hover:bg-gray-800`}><ChevronLeft aria-hidden="true" size={20} /></button>
          <h2 aria-live="polite" className="min-w-0 text-lg font-bold text-white">{monthLabel}</h2>
          <button type="button" aria-label="Next month" onClick={() => changeMonth(1)} className={`${actionClass} border border-gray-700 text-gray-200 hover:bg-gray-800`}><ChevronRight aria-hidden="true" size={20} /></button>
        </div>
        <div className="schedule-view-controls flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={goToToday} className={`${actionClass} text-indigo-300 hover:bg-indigo-500/10`}>Today</button>
          <div role="group" aria-label="Schedule view" className="flex gap-2">
            {["agenda", "month"].map((item) => <button key={item} type="button" aria-pressed={view === item} onClick={() => setViewPreference(item)} className={`${actionClass} border ${view === item ? "border-indigo-400 bg-indigo-500/15 text-indigo-200" : "border-gray-700 text-gray-300 hover:bg-gray-800"}`}>{item === "agenda" ? "Agenda" : "Month"}</button>)}
          </div>
        </div>
        <div className="schedule-filter-controls min-w-0">
          <label htmlFor="delivery-status" className="mb-2 block text-sm font-medium text-gray-300">Delivery status</label>
          <select id="delivery-status" value={filter} onChange={(event) => setFilter(event.target.value)} className="min-h-11 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-gray-100">
            {scheduleFilters.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
      </div>
      {!source.loading && !source.error && <p role="status" className="mt-3 text-sm text-gray-300">{result.inMonth.length} {result.inMonth.length === 1 ? "delivery" : "deliveries"} this month · {result.overdueCount} overdue</p>}
    </section>

    {source.loading ? <div role="status" className={`${panelClass} py-8 text-center text-sm text-gray-300`}>Loading your schedule…</div>
      : source.error ? <div role="alert" className={`${panelClass} text-center`}>
        <h2 className="text-lg font-bold text-white">We couldn’t load your schedule.</h2>
        <p className="mt-2 text-sm text-gray-300">Check your connection and try again.</p>
        <button type="button" onClick={() => setAttempt((value) => value + 1)} className={`${actionClass} mt-4 bg-indigo-600 text-white hover:bg-indigo-500`}>Try again</button>
      </div> : <>
        {result.unscheduled.length > 0 && <Link to="/outfits" aria-label={`Review ${result.unscheduled.length} ${result.unscheduled.length === 1 ? "order that needs" : "orders that need"} a delivery date`} className="flex min-h-11 items-center gap-2 rounded-lg border border-yellow-800 bg-yellow-900/10 px-3 py-2 text-sm text-yellow-200 hover:bg-yellow-900/20">
          <AlertCircle aria-hidden="true" size={18} className="shrink-0" /><span className="min-w-0 flex-1 break-words">{result.unscheduled.length} {result.unscheduled.length === 1 ? "order needs" : "orders need"} a delivery date.</span><ArrowRight aria-hidden="true" size={16} className="shrink-0" />
        </Link>}
        {view === "agenda" ? <section aria-labelledby="agenda-heading" className={panelClass}>
          <h2 id="agenda-heading" className="mb-4 text-lg font-bold text-white">Deliveries in {monthLabel}</h2>
          {result.groups.length === 0 ? <div className="py-5 text-sm text-gray-300">
            <p className="font-semibold text-gray-100">{source.orders.length === 0 ? "No deliveries scheduled yet" : "No deliveries to show this month"}</p>
            <p className="mt-2">{source.orders.length === 0 ? "Create an order and choose a delivery date to get started." : "Try another month or delivery status."}</p>
            {filter !== "all" && <button type="button" onClick={() => setFilter("all")} className={`${actionClass} mt-3 text-indigo-300 hover:bg-indigo-500/10`}>Clear filter</button>}
          </div> : <div className="grid gap-6 lg:grid-cols-2">{result.groups.map((group) => <section key={group.date} aria-label={fullDate(group.date)} className="min-w-0">
            <h3 className="mb-3 text-sm font-semibold text-gray-200"><time dateTime={group.date}>{fullDate(group.date)}</time>{group.date === dateKey(now) && <span className="ml-2 text-indigo-300">Today</span>}</h3>
            <DeliveryList orders={group.orders} />
          </section>)}</div>}
        </section> : <div className="calendar-month-layout grid min-w-0 gap-4 sm:gap-6">
          <section aria-label={`Delivery calendar for ${monthLabel}`} className={`${panelClass} delivery-calendar`}>
            <p className="mb-4 text-sm text-gray-300">{compactMonth ? "Select a date to read its deliveries below." : "Select a delivery or a date to see the full daily schedule."}</p>
            {result.inMonth.length === 0 && <p role="status" className="mb-4 text-sm text-gray-300">{source.orders.length === 0 ? "No deliveries scheduled yet. Create an order to get started." : "No deliveries match this month and status. Try another month or filter."}</p>}
            <div ref={calendarHost} className="min-w-0">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                initialDate={month}
                headerToolbar={false}
                events={events}
                height="auto"
                fixedWeekCount={false}
                dayMaxEvents={calendarWidth >= 1100 ? 4 : calendarWidth >= 760 ? 3 : 2}
                displayEventTime={false}
                dayCellClassNames={(info) => dateKey(info.date) === selectedDate ? ["selected-delivery-day"] : []}
                dayCellContent={(info) => {
                  const date = dateKey(info.date);
                  const count = counts.get(date) || 0;
                  return <button type="button" className={`calendar-date-button ${compactMonth ? "compact-date" : ""}`} aria-label={`${fullDate(date)}, ${count} ${count === 1 ? "delivery" : "deliveries"}`} aria-pressed={selectedDate === date} onClick={() => chooseDate(date)}>
                    <span>{info.date.getDate()}</span>
                    {compactMonth && count > 0 && <span className="calendar-date-count" aria-hidden="true">{count}</span>}
                  </button>;
                }}
                eventContent={(info) => <div className="calendar-event-content"><span className="calendar-event-name">{info.event.extendedProps.order.clientName || "Customer"}</span><span className="calendar-event-status">{info.event.extendedProps.appearance.label}</span></div>}
                eventDidMount={(info) => {
                  const label = `Show deliveries for ${fullDate(info.event.startStr.slice(0, 10))}: ${info.event.title}, ${info.event.extendedProps.appearance.label}`;
                  info.el.setAttribute("aria-label", label);
                  info.el.setAttribute("title", label);
                }}
                eventClick={(info) => { info.jsEvent.preventDefault(); chooseDate(info.event.startStr.slice(0, 10)); }}
                moreLinkClick={(info) => { chooseDate(dateKey(info.date)); return "dayGridMonth"; }}
              />
            </div>
          </section>
          <section id="calendar-day-details" aria-labelledby="selected-day-heading" className={`${panelClass} self-start`}>
            <h2 id="selected-day-heading" ref={dayHeading} tabIndex={-1} className="mb-2 rounded text-lg font-bold text-white">{fullDate(selectedDate)}</h2>
            <p role="status" className="mb-4 text-sm text-gray-300">{selectedOrders.length} {selectedOrders.length === 1 ? "delivery" : "deliveries"}</p>
            {selectedOrders.length > 0 ? <DeliveryList orders={selectedOrders} /> : <p className="py-3 text-sm text-gray-300">No deliveries match this date and status.</p>}
          </section>
        </div>}
      </>}
  </div>;
}
