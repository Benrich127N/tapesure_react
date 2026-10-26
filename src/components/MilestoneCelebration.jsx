import { useEffect, useState } from "react";
import { Award, X } from "lucide-react";
import { auth } from "../../firebase";

const confetti = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  left: `${4 + ((index * 17) % 92)}%`,
  delay: `${(index % 5) * 0.12}s`,
  duration: `${1.8 + (index % 4) * 0.25}s`,
  color: ["#818cf8", "#fbbf24", "#34d399", "#f472b6"][index % 4],
}));

const MilestoneCelebration = () => {
  const [queue, setQueue] = useState([]);
  const celebration = queue[0];

  useEffect(() => {
    const handleMilestone = (event) => {
      const milestone = event.detail;
      if (!milestone?.id) return;

      const userId = auth.currentUser?.uid || "guest";
      const storageKey = `tapesure-milestone:${userId}:${milestone.id}`;
      if (localStorage.getItem(storageKey)) return;

      localStorage.setItem(storageKey, new Date().toISOString());
      setQueue((current) => [...current, milestone]);
    };

    window.addEventListener("tapesure:milestone", handleMilestone);
    return () => window.removeEventListener("tapesure:milestone", handleMilestone);
  }, []);

  useEffect(() => {
    if (!celebration) return;
    const timer = window.setTimeout(() => {
      setQueue((current) => current.slice(1));
    }, 6500);
    return () => window.clearTimeout(timer);
  }, [celebration]);

  if (!celebration) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="milestone-title"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none motion-reduce:hidden">
        {confetti.map((piece) => (
          <span
            key={piece.id}
            className="milestone-confetti absolute -top-6 w-2 h-4 rounded-sm"
            style={{
              left: piece.left,
              backgroundColor: piece.color,
              animationDelay: piece.delay,
              animationDuration: piece.duration,
            }}
          />
        ))}
      </div>

      <div className="milestone-card relative w-full max-w-sm overflow-hidden rounded-3xl border border-indigo-500/40 bg-gray-950 p-7 text-center shadow-2xl shadow-indigo-950/60 motion-reduce:animate-none">
        <button
          type="button"
          onClick={() => setQueue((current) => current.slice(1))}
          className="absolute right-4 top-4 text-gray-500 hover:text-white transition"
          aria-label="Close celebration"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/15 ring-1 ring-indigo-400/30">
          <span className="text-4xl" aria-hidden="true">{celebration.emoji}</span>
        </div>
        <div className="mb-3 flex items-center justify-center gap-2 text-indigo-300">
          <Award className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-[0.22em]">Milestone unlocked</span>
        </div>
        <h2 id="milestone-title" className="text-2xl font-bold text-white">
          {celebration.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-400">{celebration.message}</p>
        <button
          type="button"
          onClick={() => setQueue((current) => current.slice(1))}
          className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-500 active:scale-95"
        >
          Keep growing
        </button>
      </div>

      <style>{`
        @keyframes milestone-pop {
          0% { opacity: 0; transform: translateY(16px) scale(.94); }
          70% { transform: translateY(-2px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes milestone-fall {
          0% { opacity: 0; transform: translateY(-5vh) rotate(0deg); }
          15% { opacity: 1; }
          100% { opacity: 0; transform: translateY(105vh) rotate(560deg); }
        }
        .milestone-card { animation: milestone-pop .35s ease-out both; }
        .milestone-confetti { animation-name: milestone-fall; animation-timing-function: ease-in; animation-fill-mode: both; }
        @media (prefers-reduced-motion: reduce) {
          .milestone-card, .milestone-confetti { animation: none; }
        }
      `}</style>
    </div>
  );
};

export default MilestoneCelebration;
