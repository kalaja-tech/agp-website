export function startHeroCircuit(canvas) {
  const context = canvas.getContext("2d");
  const hero = canvas.parentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const mouse = { x: -999, y: -999, targetX: -999, targetY: -999 };
  let offscreen; let offscreenContext; let width; let height; let dpr; let grid; let traces = []; let pulses = []; let running = true; let last = 0; let frame; let resizeTimer;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const pointAt = (trace, distance) => {
    const current = clamp(distance, 0, trace.total); let index = 1;
    while (index < trace.cumulative.length - 1 && trace.cumulative[index] < current) index += 1;
    const start = trace.points[index - 1]; const end = trace.points[index]; const segment = trace.cumulative[index] - trace.cumulative[index - 1] || 1;
    const ratio = (current - trace.cumulative[index - 1]) / segment;
    return [start[0] + (end[0] - start[0]) * ratio, start[1] + (end[1] - start[1]) * ratio];
  };

  const createPulse = (ratio) => {
    const traceIndex = Math.floor(Math.random() * traces.length);
    const trace = traces[traceIndex];
    return { traceIndex, distance: ratio ? ratio * trace.total : -Math.random() * 200, speed: 110 + Math.random() * 170, length: 80 + Math.random() * 90, color: Math.random() < 0.22 ? "255,180,0" : "92,225,255" };
  };

  const build = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2); width = hero.clientWidth; height = hero.clientHeight;
    canvas.width = width * dpr; canvas.height = height * dpr;
    offscreen = document.createElement("canvas"); offscreen.width = canvas.width; offscreen.height = canvas.height;
    offscreenContext = offscreen.getContext("2d"); offscreenContext.scale(dpr, dpr);
    grid = width < 700 ? 52 : 68;
    const columns = Math.floor(width / grid); const rows = Math.floor(height / grid); const offsetX = (width - columns * grid) / 2; const offsetY = (height - rows * grid) / 2;
    traces = [];
    for (let traceNumber = 0; traceNumber < Math.round(width * height / 42000) + 10; traceNumber += 1) {
      let column = Math.floor(Math.random() * (columns + 1)); let row = Math.floor(Math.random() * (rows + 1)); let direction = Math.floor(Math.random() * 4);
      const points = [[offsetX + column * grid, offsetY + row * grid]];
      const segments = 5 + Math.floor(Math.random() * 7);
      for (let segment = 0; segment < segments; segment += 1) {
        const length = 1 + Math.floor(Math.random() * 4); let valid = false;
        for (let turn = 0; turn < 4 && !valid; turn += 1) {
          const nextColumn = column + directions[direction][0] * length; const nextRow = row + directions[direction][1] * length;
          if (nextColumn >= 0 && nextColumn <= columns && nextRow >= 0 && nextRow <= rows) { column = nextColumn; row = nextRow; valid = true; } else direction = (direction + 1) % 4;
        }
        if (!valid) break;
        points.push([offsetX + column * grid, offsetY + row * grid]); direction = (direction + (Math.random() < 0.5 ? 1 : 3)) % 4;
      }
      if (points.length < 3) continue;
      const cumulative = [0];
      for (let index = 1; index < points.length; index += 1) cumulative.push(cumulative[index - 1] + Math.abs(points[index][0] - points[index - 1][0]) + Math.abs(points[index][1] - points[index - 1][1]));
      traces.push({ points, cumulative, total: cumulative[cumulative.length - 1] });
    }
    offscreenContext.lineWidth = 1; offscreenContext.lineJoin = "round";
    traces.forEach((trace) => {
      offscreenContext.strokeStyle = "rgba(88,128,255,.26)"; offscreenContext.beginPath(); trace.points.forEach((point, index) => index ? offscreenContext.lineTo(...point) : offscreenContext.moveTo(...point)); offscreenContext.stroke();
      trace.points.forEach((point, index) => { offscreenContext.beginPath(); offscreenContext.arc(...point, index === 0 || index === trace.points.length - 1 ? 3.2 : 1.8, 0, Math.PI * 2); if (index === 0 || index === trace.points.length - 1) { offscreenContext.strokeStyle = "rgba(140,170,255,.55)"; offscreenContext.stroke(); } else { offscreenContext.fillStyle = "rgba(140,170,255,.5)"; offscreenContext.fill(); } });
    });
    pulses = Array.from({ length: Math.min(26, Math.round(traces.length * 0.7)) }, () => createPulse(Math.random()));
  };

  const animate = (timestamp) => {
    if (running) {
      const elapsed = Math.min(0.05, (timestamp - last) / 1000 || 0.016); last = timestamp;
      context.setTransform(1, 0, 0, 1, 0, 0); context.clearRect(0, 0, canvas.width, canvas.height); context.setTransform(dpr, 0, 0, dpr, 0, 0); context.drawImage(offscreen, 0, 0, width, height);
      mouse.x += (mouse.targetX - mouse.x) * 0.14; mouse.y += (mouse.targetY - mouse.y) * 0.14;
      if (mouse.x > -900) {
        const glow = context.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 220); glow.addColorStop(0, "rgba(92,140,255,.28)"); glow.addColorStop(1, "rgba(92,140,255,0)"); context.fillStyle = glow; context.fillRect(mouse.x - 220, mouse.y - 220, 440, 440);
        traces.forEach((trace) => trace.points.forEach((point) => { const distance = Math.hypot(point[0] - mouse.x, point[1] - mouse.y); if (distance < 190) { const alpha = 1 - distance / 190; context.beginPath(); context.arc(...point, 2.5 + alpha * 3, 0, Math.PI * 2); context.fillStyle = `rgba(92,225,255,${alpha * 0.9})`; context.fill(); } }));
      }
      pulses.forEach((pulse, index) => {
        const trace = traces[pulse.traceIndex]; pulse.distance += pulse.speed * elapsed;
        if (pulse.distance - pulse.length > trace.total) { pulses[index] = createPulse(); return; }
        if (pulse.distance < 0) return;
        context.lineCap = "round";
        for (let segment = 0; segment < 12; segment += 1) {
          const startDistance = pulse.distance - pulse.length * (1 - segment / 12); const endDistance = pulse.distance - pulse.length * (1 - (segment + 1) / 12);
          if (endDistance < 0 || startDistance > trace.total) continue;
          const start = pointAt(trace, startDistance); const end = pointAt(trace, endDistance);
          context.strokeStyle = `rgba(${pulse.color},${((segment + 1) / 12) * 0.9})`; context.lineWidth = 1 + (segment / 12) * 1.6; context.beginPath(); context.moveTo(...start); context.lineTo(...end); context.stroke();
        }
        if (pulse.distance <= trace.total) { const head = pointAt(trace, pulse.distance); const headGlow = context.createRadialGradient(...head, 0, ...head, 12); headGlow.addColorStop(0, `rgba(${pulse.color},.9)`); headGlow.addColorStop(1, `rgba(${pulse.color},0)`); context.fillStyle = headGlow; context.beginPath(); context.arc(...head, 12, 0, Math.PI * 2); context.fill(); context.fillStyle = "#fff"; context.beginPath(); context.arc(...head, 2, 0, Math.PI * 2); context.fill(); }
      });
    }
    if (!reduce) frame = requestAnimationFrame(animate);
  };

  const handleResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { build(); if (reduce) { context.setTransform(dpr, 0, 0, dpr, 0, 0); context.drawImage(offscreen, 0, 0, width, height); } }, 200); };
  const handlePointer = (event) => { const bounds = hero.getBoundingClientRect(); mouse.targetX = event.clientX - bounds.left; mouse.targetY = event.clientY - bounds.top; };
  const handleLeave = () => { mouse.targetX = -999; mouse.targetY = -999; };
  const observer = new IntersectionObserver(([entry]) => { running = entry.isIntersecting; if (running) last = performance.now(); });
  build();
  if (reduce) { context.setTransform(dpr, 0, 0, dpr, 0, 0); context.drawImage(offscreen, 0, 0, width, height); } else frame = requestAnimationFrame(animate);
  window.addEventListener("resize", handleResize); hero.addEventListener("pointermove", handlePointer); hero.addEventListener("pointerleave", handleLeave); observer.observe(hero);
  return () => { cancelAnimationFrame(frame); clearTimeout(resizeTimer); observer.disconnect(); window.removeEventListener("resize", handleResize); hero.removeEventListener("pointermove", handlePointer); hero.removeEventListener("pointerleave", handleLeave); };
}
