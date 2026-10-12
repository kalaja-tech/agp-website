"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { startHeroCircuit } from "./hero-circuit";

const services = [
  ["bolt", "Impianti elettrici", "Nuovi impianti o ristrutturazioni complete: quadri elettrici, messa a terra, prese e illuminazione, con materiali certificati."],
  ["camera", "Telecamere di sicurezza", "Sistemi CCTV e IP per interni ed esterni, con registrazione, visione dal vivo sul telefono e avvisi di movimento."],
  ["shield", "Sistemi di allarme", "Sensori per porte, finestre e movimento, sirena e controllo tramite app, integrati con le telecamere."],
  ["home", "Casa smart", "Luci, tende, riscaldamento e dispositivi gestibili con la voce o dal telefono, con scenari automatici."],
];

const layers = [
  ["Impianto elettrico", "Tutto parte da una rete sicura: quadro elettrico, cavi, prese e illuminazione, installati secondo gli standard."],
  ["Telecamere di sicurezza", "Immagini nitide giorno e notte, registrate e visibili dal telefono, ovunque tu sia."],
  ["Sistema di allarme", "Sensori su porte e finestre che ti avvisano subito, anche quando sei lontano da casa."],
  ["Casa smart", "Colleghiamo tutto in un’unica app: luci, allarme, telecamere e riscaldamento, con scenari automatici."],
];

function Bolt() { return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M18.5 2 6 18h8l-2.5 12L26 12h-8z" fill="currentColor" /></svg>; }
function Arrow() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>; }
function ServiceIcon({ type }) {
  if (type === "bolt") return <svg viewBox="0 0 48 48"><path d="M27 4 10 26h12l-3 18 19-24H26z" /></svg>;
  if (type === "camera") return <svg viewBox="0 0 48 48"><rect x="5" y="14" width="26" height="20" rx="4"/><path d="m31 21 12-6v18l-12-6"/><circle cx="14" cy="24" r="3"/></svg>;
  if (type === "shield") return <svg viewBox="0 0 48 48"><path d="M24 5 8 11v12c0 10 7 17 16 20 9-3 16-10 16-20V11z"/><path d="m17 24 5 5 9-10"/></svg>;
  return <svg viewBox="0 0 48 48"><path d="m6 22 18-15 18 15"/><path d="M10 20v21h28V20"/><path d="M18 30a8 8 0 0 1 12 0M14 26a13 13 0 0 1 20 0"/><circle cx="24" cy="35" r="1.4"/></svg>;
}

function CircuitCanvas() {
  const canvas = useRef(null);
  useEffect(() => startHeroCircuit(canvas.current), []);
  return <canvas id="net" className="network" ref={canvas} aria-hidden="true" style={{ width: "100%", height: "100%", opacity: 1 }} />;
}

/*
function PreviousCircuitCanvas() {
  const canvas = useRef(null);
  useEffect(() => {
    const node = canvas.current;
    const ctx = node.getContext("2d");
    const parent = node.parentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame, width, height, dpr, traces = [], pulses = [], pointer = { x: -999, y: -999 };

    const pointOnTrace = (trace, distance) => {
      let remaining = distance % trace.length;
      for (let index = 1; index < trace.points.length; index += 1) {
        const start = trace.points[index - 1];
        const end = trace.points[index];
        const segment = Math.hypot(end[0] - start[0], end[1] - start[1]);
        if (remaining <= segment) {
          const position = remaining / segment;
          return [start[0] + (end[0] - start[0]) * position, start[1] + (end[1] - start[1]) * position];
        }
        remaining -= segment;
      }
      return trace.points[trace.points.length - 1];
    };

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth; height = parent.clientHeight;
      node.width = width * dpr; node.height = height * dpr;
      node.style.width = `${width}px`; node.style.height = `${height}px`;
      const gap = width < 700 ? 54 : 72;
      const columns = Math.ceil(width / gap);
      const rows = Math.ceil(height / gap);
      traces = Array.from({ length: Math.max(16, Math.round(width / 56)) }, () => {
        let x = Math.floor(Math.random() * columns) * gap;
        let y = Math.floor(Math.random() * rows) * gap;
        const points = [[x, y]];
        for (let step = 0; step < 3 + Math.floor(Math.random() * 5); step += 1) {
          if (Math.random() > 0.5) x = Math.max(0, Math.min(width, x + (Math.random() > 0.5 ? 1 : -1) * gap * (1 + Math.floor(Math.random() * 2))));
          else y = Math.max(0, Math.min(height, y + (Math.random() > 0.5 ? 1 : -1) * gap * (1 + Math.floor(Math.random() * 2))));
          points.push([x, y]);
        }
        const length = points.slice(1).reduce((total, point, index) => total + Math.hypot(point[0] - points[index][0], point[1] - points[index][1]), 0);
        return { points, length };
      });
      pulses = Array.from({ length: Math.min(24, traces.length) }, (_, index) => ({ trace: index, distance: Math.random() * traces[index].length, speed: 38 + Math.random() * 72, warm: Math.random() > 0.78 }));
    };
    let lastTime = 0;
    const draw = (time) => {
      const delta = Math.min((time - lastTime) / 1000 || 0, 0.05); lastTime = time;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
      traces.forEach((trace) => {
        ctx.strokeStyle = "rgba(120, 151, 255, .25)"; ctx.lineWidth = 1;
        ctx.beginPath(); trace.points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
        trace.points.forEach(([x, y]) => { ctx.fillStyle = "rgba(160, 190, 255, .45)"; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill(); });
      });
      if (pointer.x > -900) { const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 220); glow.addColorStop(0, "rgba(92,225,255,.18)"); glow.addColorStop(1, "rgba(92,225,255,0)"); ctx.fillStyle = glow; ctx.fillRect(pointer.x - 220, pointer.y - 220, 440, 440); }
      pulses.forEach((pulse) => { const trace = traces[pulse.trace]; pulse.distance = (pulse.distance + pulse.speed * delta) % trace.length; const [x, y] = pointOnTrace(trace, pulse.distance); const color = pulse.warm ? "255,180,0" : "92,225,255"; const glow = ctx.createRadialGradient(x, y, 0, x, y, 15); glow.addColorStop(0, `rgba(${color},.98)`); glow.addColorStop(1, `rgba(${color},0)`); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill(); });
      if (!reducedMotion) frame = requestAnimationFrame(draw);
    };
    const movePointer = (event) => { const bounds = node.getBoundingClientRect(); pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }; };
    const leavePointer = () => { pointer = { x: -999, y: -999 }; };
    build(); draw(0); window.addEventListener("resize", build); parent.addEventListener("pointermove", movePointer); parent.addEventListener("pointerleave", leavePointer);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", build); parent.removeEventListener("pointermove", movePointer); parent.removeEventListener("pointerleave", leavePointer); };
  }, []);
  return <canvas className="network" ref={canvas} aria-hidden="true" />;
}
*/

function HouseGraphic({ stage }) {
  return <svg className={`house stage-${stage}`} viewBox="0 0 600 480" role="img" aria-label="Schema di una casa smart e sicura">
    <defs><linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#5CE1FF" stopOpacity=".55"/><stop offset="1" stopColor="#5CE1FF" stopOpacity="0"/></linearGradient></defs>
    <g className="blueprint"><path d="M70 250 300 70 530 250M110 220v210h380V220M40 430h520M270 430v-90h60v90M130 270h90v80h-90zM380 270h90v80h-90z" /></g>
    <g className="electric"><rect x="130" y="270" width="90" height="80"/><rect x="380" y="270" width="90" height="80"/><path className="wire" d="M145 402h105V300h-28m28 102h100V300h26m-26 102h102"/><circle cx="222" cy="300" r="5"/><circle cx="378" cy="300" r="5"/></g>
    <g className="camera"><polygon className="beam" points="300,262 232,430 368,430"/><rect x="286" y="250" width="28" height="14" rx="3"/><path d="M300 250v-12"/><circle cx="308" cy="257" r="2.4"/></g>
    <g className="alarm"><circle cx="320" cy="392" r="5"/><circle className="ring" cx="320" cy="392" r="6"/><circle cx="175" cy="310" r="5"/><circle className="ring delayed" cx="175" cy="310" r="6"/><path d="M300 130l28 11v25c0 16-12 26-28 32-16-6-28-16-28-32v-25z"/><path d="m288 164 9 9 16-18"/></g>
    <g className="smart"><path className="arc" d="M286 52a14 14 0 0 1 28 0m-40 0a26 26 0 0 1 52 0m-64 0a38 38 0 0 1 76 0"/><circle cx="300" cy="58" r="3"/><path className="link" d="M175 310 300 262l125 48m-125-48v-64m0 64 20 130m-145-82 125-48"/></g>
  </svg>;
}

export default function Home() {
  const [stage, setStage] = useState(0);
  const house = useRef(null);
  useEffect(() => {
    const scroll = () => {
      const rect = house.current?.getBoundingClientRect(); if (!rect) return;
      const progress = Math.max(0, Math.min(0.999, -rect.top / (house.current.offsetHeight - window.innerHeight)));
      setStage(Math.min(3, Math.floor(progress * 4)));
    };
    scroll(); window.addEventListener("scroll", scroll, { passive: true }); return () => window.removeEventListener("scroll", scroll);
  }, []);
  return <>
    <header className="top"><div className="wrap"><a className="logo" href="#top" aria-label="AGP Service"><Image src="/logo/agp-mark-white.svg" alt="" width={34} height={31} priority />AGP <span>SERVICE</span></a><nav><a href="#sherbimet">Servizi</a><a href="#puna">Come lavoriamo</a><a href="#kontakt">Contatti</a><a className="call" href="tel:+393703119562">Chiama</a></nav></div></header>
    <main>
      <section className="hero" id="top"><CircuitCanvas /><div className="hero-shade"/><div className="hero-content"><p className="eyebrow">Elettricità e sicurezza per la tua casa</p><h1><span>AGP</span><span>SERVICE</span></h1><p className="subhead">Impianti elettrici, telecamere di sicurezza, allarmi e sistemi smart per case, appartamenti e aziende a La Spezia e in tutta la Liguria.</p><div className="actions"><a className="button filled" href="#kontakt">Richiedi un preventivo gratuito</a><a className="button outlined" href="#sherbimet">Scopri i servizi</a></div></div><a className="scroll-cue" href="#sherbimet">Scorri <i/></a></section>
      <section className="marquee" aria-label="Servizi"><div>{[...services, ...services].map((service, i) => <span key={i}>{service[1]} <Bolt /></span>)}</div></section>
      <section className="paper statement"><div className="wrap"><h2>L’elettricità non si vede, ma la senti ogni giorno. Quando la luce si accende al momento giusto, la porta è protetta e la casa sa cosa fare.</h2><div className="two-columns"><p>Partiamo dallo spazio: dove passano i cavi, dove servono le telecamere e quali sono i punti deboli della casa o del locale.</p><p>Poi costruiamo tutto come un unico sistema, che lavora silenziosamente e ti dà tranquillità ogni giorno.</p></div></div></section>
      <section className="house-section" ref={house}><div className="house-sticky wrap"><div className="house-copy"><h2>Una casa, strato dopo strato</h2><article><h3>{layers[stage][0]}</h3><p>{layers[stage][1]}</p></article><div className="dots">{layers.map((_, i) => <i className={i <= stage ? "active" : ""} key={i}/>)}</div></div><HouseGraphic stage={stage}/></div></section>
      <section className="paper services" id="sherbimet"><div className="wrap"><h2>Tutto l’elettrico,<br/>con un solo team.</h2>{services.map(([icon, title, text]) => <a href="#kontakt" className="service-row" key={title}><ServiceIcon type={icon}/><h3>{title}</h3><p>{text}</p><Arrow /></a>)}</div></section>
      <section className="process" id="puna"><div className="wrap"><h2>Quattro passaggi,<br/>un prezzo chiaro.</h2><div className="process-grid">{[["Sopralluogo","Veniamo sul posto e ascoltiamo ciò di cui hai bisogno."],["Preventivo","Ricevi il prezzo per iscritto, con materiali e tempistiche."],["Installazione","Lavoriamo in modo pulito, puntuale e secondo gli standard di sicurezza."],["Test e spiegazione","Proviamo tutto insieme e ti mostriamo come utilizzarlo."]].map(([title, text], i) => <article key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
      <section className="contact" id="kontakt"><div className="wrap"><p className="eyebrow">AGP SERVICE</p><h2>Raccontaci<br/>di cosa hai bisogno.</h2><p className="contact-copy">Scrivici o chiamaci. Ti rispondiamo in giornata e fissiamo un sopralluogo gratuito.</p><a className="phone" href="tel:+393703119562">+39 370 311 9562</a><div className="actions"><a className="button filled" href="tel:+393703119562">Chiama ora</a><a className="button outlined" href="https://wa.me/393703119562?text=Ciao%2C%20vorrei%20un%20preventivo%20da%20AGP%20Service." target="_blank" rel="noreferrer">Scrivi su WhatsApp</a></div><dl><div><dt>Email</dt><dd><a href="mailto:pali.armando@gmail.com">pali.armando@gmail.com</a></dd></div><div><dt>Zona</dt><dd>La Spezia e Liguria</dd></div><div><dt>Orari</dt><dd>Lunedì – Sabato, 08:00 – 19:00</dd></div></dl></div></section>
    </main><footer className="wrap"><span>© 2026 AGP Service di Pali Armando · P.IVA 0161440114</span><span>Elettricità, telecamere, allarmi, casa smart</span></footer>
  </>;
}
