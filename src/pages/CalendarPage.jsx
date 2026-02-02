// src/pages/CalendarPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { db, auth } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Calendar as CalendarIcon, Filter } from "lucide-react";

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  // Helper to determine event colors based on status
  const getEventColor = (status) => {
    switch (status) {
      case "Delivered": return "#10b981"; // Green-500
      case "Ready": return "#6366f1";     // Indigo-500
      case "Delayed": return "#ef4444";   // Red-500
      case "Pending": return "#9ca3af";   // Gray-400
      default: return "#f59e0b";          // Yellow-500 (Cutting, Sewing, etc.)
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "outfits"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const calendarEvents = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: `${data.clientName} - ${data.outfitType}`,
          start: data.dueDate, // Assumes YYYY-MM-DD string from your input
          backgroundColor: getEventColor(data.status),
          borderColor: "transparent",
          extendedProps: { status: data.status }
        };
      });
      setEvents(calendarEvents);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <CalendarIcon className="text-indigo-500" /> Delivery Schedule
          </h1>
          <p className="text-gray-400">Track deadlines and production timelines.</p>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl custom-calendar">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="75vh"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
          eventClick={(info) => {
            navigate(`/outfits/${info.event.id}`);
          }}
          eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs font-medium uppercase tracking-wider">
        <span className="flex items-center gap-2 text-gray-400">
            <div className="w-3 h-3 rounded-full bg-gray-400" /> Pending
        </span>
        <span className="flex items-center gap-2 text-yellow-500">
            <div className="w-3 h-3 rounded-full bg-yellow-500" /> Production
        </span>
        <span className="flex items-center gap-2 text-indigo-500">
            <div className="w-3 h-3 rounded-full bg-indigo-500" /> Ready
        </span>
        <span className="flex items-center gap-2 text-green-500">
            <div className="w-3 h-3 rounded-full bg-green-500" /> Delivered
        </span>
        <span className="flex items-center gap-2 text-red-500">
            <div className="w-3 h-3 rounded-full bg-red-500" /> Delayed
        </span>
      </div>

      {/* CSS to fix dark mode styling for FullCalendar */}
      <style>{`
        .fc { color: white; --fc-border-color: #1f2937; --fc-today-bg-color: #1e1b4b; }
        .fc .fc-toolbar-title { font-size: 1.25rem; font-weight: 700; }
        .fc .fc-button-primary { background-color: #312e81; border: none; font-size: 0.8rem; }
        .fc .fc-button-primary:hover { background-color: #4338ca; }
        .fc .fc-button-active { background-color: #4f46e5 !important; }
        .fc-theme-standard td, .fc-theme-standard th { border: 1px solid #1f2937; }
        .fc-daygrid-event { border-radius: 6px; padding: 2px 4px; font-size: 0.75rem; }
        .fc-col-header-cell { padding: 10px 0; background: #030712; color: #9ca3af; text-transform: uppercase; font-size: 0.7rem; }
      `}</style>
    </div>
  );
};

export default CalendarPage;