"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronIcon } from "./Icons";

type Slide = { title: string; text: string; bg: string; fg: string };

const slides: Slide[] = [
  { title: "Shortnotes, half the price", text: "Buy from seniors who just finished the course.", bg: "#c8102e", fg: "#fff" },
  { title: "Moving out of the dorm?", text: "List your stationary, desk and lamp in two minutes.", bg: "#f5b800", fg: "#1d1d1b" },
  { title: "Meet on campus, pay in person", text: "Chat with sellers and pick a spot you both know.", bg: "#5e145a", fg: "#fff" },
];

export default function Banner() {
  const [i, setI] = useState(0);
  const startX = useRef<number | null>(null);
  const go = (n: number) => setI((n + slides.length) % slides.length);

  // Auto-advance; restarts whenever the slide changes
  useEffect(() => {
    const t = setTimeout(() => setI((p) => (p + 1) % slides.length), 5000);
    return () => clearTimeout(t);
  }, [i]);

  return (
    <section
      className="banner"
      aria-roledescription="carousel"
      aria-label="Highlights"
      onPointerDown={(e) => (startX.current = e.clientX)}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
        startX.current = null;
      }}
    >
      <div className="banner__track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((s) => (
          <article key={s.title} className="banner__slide" style={{ background: s.bg, color: s.fg }}>
            <h2>{s.title}</h2>
            <p>{s.text}</p>
          </article>
        ))}
      </div>

      <button className="banner__arrow banner__arrow--prev" onClick={() => go(i - 1)} aria-label="Previous slide">
        <ChevronIcon dir="left" />
      </button>
      <button className="banner__arrow banner__arrow--next" onClick={() => go(i + 1)} aria-label="Next slide">
        <ChevronIcon dir="right" />
      </button>

      <div className="banner__dots">
        {slides.map((s, n) => (
          <button
            key={s.title}
            onClick={() => setI(n)}
            aria-label={`Go to slide ${n + 1}`}
            aria-current={n === i}
            className={n === i ? "is-active" : ""}
          />
        ))}
      </div>
    </section>
  );
}
