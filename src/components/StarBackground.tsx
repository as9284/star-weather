import { useEffect, useRef } from "react";

/** Full-viewport animated starfield with twinkling stars and shooting stars. */
export function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);

    /* ── Stars ───────────────────────────────────────────────── */
    interface Star {
      x: number;
      y: number;
      r: number;
      alpha: number;
      speed: number; // twinkle speed
      phase: number;
    }

    const PIXELS_PER_STAR = 3000;
    const MAX_STARS = 400;
    const STAR_COUNT = Math.min(
      Math.floor((width * height) / PIXELS_PER_STAR),
      MAX_STARS,
    );

    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.002,
      phase: Math.random() * Math.PI * 2,
    }));

    /* ── Shooting stars ──────────────────────────────────────── */
    interface Shooter {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
    }

    const shooters: Shooter[] = [];

    const spawnShooter = () => {
      const angle = Math.random() * 0.6 + 0.3; // ~17° – ~52° from horizontal
      const speed = Math.random() * 6 + 4;
      shooters.push({
        x: Math.random() * width * 0.8,
        y: Math.random() * height * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: Math.random() * 40 + 30,
        size: Math.random() * 1.5 + 0.8,
      });
    };

    const SHOOT_INTERVAL_MS = 3000; // ms between shooting star spawns
    let lastShootTime = performance.now();

    /* ── Render loop ─────────────────────────────────────────── */
    let frame = 0;

    const draw = () => {
      frame++;
      const now = performance.now();
      ctx.clearRect(0, 0, width, height);

      // Stars
      for (const s of stars) {
        const twinkle =
          0.3 + 0.7 * ((Math.sin(frame * s.speed + s.phase) + 1) / 2);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,215,255,${twinkle * 0.85})`;
        ctx.fill();
      }

      // Shooting stars (timestamp-based for consistent rate across frame rates)
      if (now - lastShootTime >= SHOOT_INTERVAL_MS) {
        lastShootTime = now;
        spawnShooter();
      }

      for (let i = shooters.length - 1; i >= 0; i--) {
        const sh = shooters[i];
        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.life++;

        const progress = sh.life / sh.maxLife;
        const alpha = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;

        // Trail
        const tailLen = 40;
        const grad = ctx.createLinearGradient(
          sh.x,
          sh.y,
          sh.x - sh.vx * tailLen * 0.3,
          sh.y - sh.vy * tailLen * 0.3,
        );
        grad.addColorStop(0, `rgba(200,180,255,${alpha * 0.9})`);
        grad.addColorStop(1, `rgba(200,180,255,0)`);

        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(
          sh.x - sh.vx * tailLen * 0.3,
          sh.y - sh.vy * tailLen * 0.3,
        );
        ctx.strokeStyle = grad;
        ctx.lineWidth = sh.size;
        ctx.lineCap = "round";
        ctx.stroke();

        // Head glow
        ctx.beginPath();
        ctx.arc(sh.x, sh.y, sh.size * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.95})`;
        ctx.fill();

        if (sh.life >= sh.maxLife) shooters.splice(i, 1);
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
