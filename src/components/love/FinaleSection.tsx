import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import confetti from "canvas-confetti";

const COVER = "/images/1_CoverPhoto.png";
// The day it all began — eight months before the monthsary.
const START = new Date("2025-11-07T00:00:00");

type Elapsed = { months: number; days: number; hours: number; minutes: number };

function getElapsed(from: Date, now: Date): Elapsed {
  let months =
    (now.getFullYear() - from.getFullYear()) * 12 +
    (now.getMonth() - from.getMonth());
  const anchor = new Date(from);
  anchor.setMonth(from.getMonth() + months);
  if (anchor > now) {
    months -= 1;
    anchor.setMonth(anchor.getMonth() - 1);
  }
  let diff = Math.max(0, now.getTime() - anchor.getTime());
  const days = Math.floor(diff / 86400000);
  diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000);
  diff -= hours * 3600000;
  const minutes = Math.floor(diff / 60000);
  return { months, days, hours, minutes };
}

const ROSE = ["#FADCD9", "#F8AFA6", "#C98986", "#B76E79", "#EAC7B8", "#FFF9F4"];

function burst() {
  const base = { spread: 90, startVelocity: 42, colors: ROSE, scalar: 1.1 };
  confetti({ ...base, particleCount: 70, origin: { x: 0.5, y: 0.6 } });
  confetti({ ...base, particleCount: 40, angle: 60, origin: { x: 0, y: 0.7 } });
  confetti({ ...base, particleCount: 40, angle: 120, origin: { x: 1, y: 0.7 } });
  confetti({
    particleCount: 20,
    spread: 120,
    colors: ROSE,
    scalar: 1.6,
    shapes: ["circle"],
    origin: { x: 0.5, y: 0.5 },
  });
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-serif text-4xl font-medium tabular-nums text-white sm:text-6xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[0.65rem] uppercase tracking-[0.3em] text-white/70 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export function FinaleSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.5 });
  const firedRef = useRef(false);
  const [elapsed, setElapsed] = useState<Elapsed>({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
  });
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setElapsed(getElapsed(START, new Date()));
    const id = setInterval(() => setElapsed(getElapsed(START, new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (inView && !firedRef.current) {
      firedRef.current = true;
      setTimeout(burst, 400);
    }
  }, [inView]);

  const onLove = useCallback(() => {
    burst();
    setPulse(true);
    setTimeout(() => setPulse(false), 700);
  }, []);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 text-center"
    >
      <motion.img
        src={COVER}
        alt="Bruce and Maxine together"
        loading="lazy"
        initial={{ scale: 1.2 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/75" />

      <div className="relative z-10 mx-auto max-w-2xl">
        <motion.h2
          initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 1.1 }}
          className="font-serif text-4xl font-medium text-white drop-shadow-lg sm:text-6xl"
        >
          Happy 8th Monthsary ❤️
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-10 flex items-stretch justify-center gap-4 sm:gap-8"
        >
          <Unit value={elapsed.months} label="Months" />
          <span className="self-center font-serif text-3xl text-white/40 sm:text-5xl">:</span>
          <Unit value={elapsed.days} label="Days" />
          <span className="self-center font-serif text-3xl text-white/40 sm:text-5xl">:</span>
          <Unit value={elapsed.hours} label="Hours" />
          <span className="self-center font-serif text-3xl text-white/40 sm:text-5xl">:</span>
          <Unit value={elapsed.minutes} label="Minutes" />
        </motion.div>
        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/60">
          together, and counting
        </p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="mx-auto mt-10 max-w-md text-pretty font-serif text-xl italic leading-relaxed text-white/90 sm:text-2xl"
        >
          Every love story is beautiful… but ours will always be my favorite.
        </motion.p>

        <motion.button
          onClick={onLove}
          whileTap={{ scale: 0.94 }}
          animate={pulse ? { scale: [1, 1.18, 1] } : {}}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="btn-glow btn-glow-hover mt-10 inline-flex items-center gap-2 rounded-full px-9 py-4 text-sm font-medium uppercase tracking-[0.2em]"
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            ❤️
          </motion.span>
          I love you.
        </motion.button>
      </div>
    </section>
  );
}
