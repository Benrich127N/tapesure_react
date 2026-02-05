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
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2">
            <CalendarIcon className="text-indigo-500 w-6 h-6 sm:w-8 sm:h-8" /> 
            <span>Delivery Schedule</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Track deadlines and production timelines.
          </p>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-2xl custom-calendar">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          contentHeight="auto"
          aspectRatio={1.35}
          headerToolbar={{
            left: 'prev,next',
            center: 'title',
            right: 'today'
          }}
          eventClick={(info) => {
            navigate(`/outfits/${info.event.id}`);
          }}
          eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
          // Make calendar more mobile-friendly
          dayMaxEvents={2}
          moreLinkText="more"
          displayEventTime={false}
        />
      </div>

      {/* Legend */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3 sm:hidden">Status Legend</h3>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4 text-xs font-medium uppercase tracking-wider">
          <span className="flex items-center gap-2 text-gray-400">
            <div className="w-3 h-3 rounded-full bg-gray-400 flex-shrink-0" /> 
            <span className="truncate">Pending</span>
          </span>
          <span className="flex items-center gap-2 text-yellow-500">
            <div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0" /> 
            <span className="truncate">Production</span>
          </span>
          <span className="flex items-center gap-2 text-indigo-500">
            <div className="w-3 h-3 rounded-full bg-indigo-500 flex-shrink-0" /> 
            <span className="truncate">Ready</span>
          </span>
          <span className="flex items-center gap-2 text-green-500">
            <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" /> 
            <span className="truncate">Delivered</span>
          </span>
          <span className="flex items-center gap-2 text-red-500 col-span-2 sm:col-span-1">
            <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" /> 
            <span className="truncate">Delayed</span>
          </span>
        </div>
      </div>

      {/* CSS to fix dark mode styling for FullCalendar */}
      <style>{`
        /* Base Calendar Styles */
        .fc { 
          color: white; 
          --fc-border-color: #1f2937; 
          --fc-today-bg-color: #1e1b4b; 
        }
        
        /* Toolbar */
        .fc .fc-toolbar { 
          flex-wrap: wrap; 
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .fc .fc-toolbar-title { 
          font-size: 1rem;
          font-weight: 700;
          order: 1;
          width: 100%;
          text-align: center;
          margin-bottom: 0.5rem;
        }
        
        .fc .fc-toolbar-chunk {
          display: flex;
          gap: 0.25rem;
        }
        
        /* Buttons - Mobile First */
        .fc .fc-button-primary { 
          background-color: #312e81; 
          border: none; 
          font-size: 0.7rem;
          padding: 0.4rem 0.6rem;
          border-radius: 0.5rem;
        }
        
        .fc .fc-button-primary:hover { 
          background-color: #4338ca; 
        }
        
        .fc .fc-button-active { 
          background-color: #4f46e5 !important; 
        }
        
        /* Calendar Grid */
        .fc-theme-standard td, 
        .fc-theme-standard th { 
          border: 1px solid #1f2937; 
        }
        
        /* Day Headers */
        .fc-col-header-cell { 
          padding: 0.5rem 0.25rem;
          background: #030712; 
          color: #9ca3af; 
          text-transform: uppercase; 
          font-size: 0.6rem;
        }
        
        /* Day Cells */
        .fc-daygrid-day-number {
          padding: 0.25rem;
          font-size: 0.75rem;
        }
        
        /* Events - Mobile First */
        .fc-daygrid-event { 
          border-radius: 4px;
          padding: 1px 3px;
          font-size: 0.65rem;
          margin-bottom: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .fc-event-title {
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        /* More Link */
        .fc-daygrid-more-link {
          font-size: 0.65rem;
          color: #6366f1;
          padding: 1px 3px;
        }
        
        /* Tablet and Up */
        @media (min-width: 640px) {
          .fc .fc-toolbar-title { 
            font-size: 1.25rem;
            width: auto;
            order: 0;
            margin-bottom: 0;
          }
          
          .fc .fc-toolbar {
            flex-wrap: nowrap;
          }
          
          .fc .fc-button-primary { 
            font-size: 0.8rem;
            padding: 0.5rem 0.875rem;
          }
          
          .fc-col-header-cell { 
            padding: 0.625rem 0;
            font-size: 0.7rem;
          }
          
          .fc-daygrid-day-number {
            padding: 0.375rem;
            font-size: 0.875rem;
          }
          
          .fc-daygrid-event { 
            border-radius: 6px;
            padding: 2px 4px;
            font-size: 0.75rem;
          }
          
          .fc-daygrid-more-link {
            font-size: 0.75rem;
          }
        }
        
        /* Desktop */
        @media (min-width: 1024px) {
          .fc .fc-toolbar-title { 
            font-size: 1.5rem;
          }
          
          .fc .fc-button-primary { 
            font-size: 0.875rem;
          }
          
          .fc-daygrid-event { 
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CalendarPage;