'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';

/* ═══════════════════════════════════════
   유틸리티
═══════════════════════════════════════ */
function rand(a: number, b: number) {
    return a + Math.random() * (b - a);
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    group?: number;
}

interface Ripple {
    x: number;
    y: number;
    radius: number;
    maxR: number;
    alpha: number;
}

// CSS 변수에서 파티클 색상 읽기
function getParticleColors() {
    const style = getComputedStyle(document.documentElement);
    const get = (name: string) => parseInt(style.getPropertyValue(name).trim()) || 0;
    return {
        primary: [get('--v2-particle-r'), get('--v2-particle-g'), get('--v2-particle-b')],
        secondary: [get('--v2-particle2-r'), get('--v2-particle2-g'), get('--v2-particle2-b')],
    };
}

/* ═══════════════════════════════════════
   #8 Pulse Ripple Network (상단 Hero)
   — 은은한 이색: primary + secondary 혼합
═══════════════════════════════════════ */
function drawPulseRipple(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    pts: Particle[],
    ripples: Ripple[],
    frameRef: { t: number; nextRipple: number },
    colors: { primary: number[]; secondary: number[] }
) {
    const N = pts.length;
    const DIST = 120;
    const t = ++frameRef.t;
    const [pr, pg, pb] = colors.primary;
    const [sr, sg, sb] = colors.secondary;

    ctx.clearRect(0, 0, W, H);

    pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    if (t >= frameRef.nextRipple) {
        const p = pts[Math.floor(Math.random() * N)];
        ripples.push({ x: p.x, y: p.y, radius: 0, maxR: 180, alpha: 0.5 });
        frameRef.nextRipple = t + 80 + Math.floor(Math.random() * 60);
    }

    ripples.forEach(rp => { rp.radius += 0.8; rp.alpha -= 0.004; });
    for (let i = ripples.length - 1; i >= 0; i--) {
        if (ripples[i].alpha <= 0) ripples.splice(i, 1);
    }

    // 리플 원 — secondary 색상으로 은은하게
    ripples.forEach(rp => {
        ctx.strokeStyle = `rgba(${sr},${sg},${sb},${rp.alpha * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2); ctx.stroke();
    });

    // 연결선 — primary 색상
    for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
            const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < DIST) {
                let boost = 0;
                ripples.forEach(rp => {
                    const di = Math.sqrt((pts[i].x - rp.x) ** 2 + (pts[i].y - rp.y) ** 2);
                    const dj = Math.sqrt((pts[j].x - rp.x) ** 2 + (pts[j].y - rp.y) ** 2);
                    if (Math.abs(di - rp.radius) < 25 || Math.abs(dj - rp.radius) < 25) boost += rp.alpha * 0.5;
                });
                const base = (1 - d / DIST) * 0.35;
                const a = Math.min(base + boost, 0.85);
                ctx.strokeStyle = `rgba(${pr},${pg},${pb},${a})`;
                ctx.lineWidth = 1.0 + boost * 1.0;
                ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
            }
        }
    }

    // 파티클 점 — 이색: 짝수=primary, 홀수=secondary
    pts.forEach((p, idx) => {
        let glow = 0;
        ripples.forEach(rp => {
            const d = Math.sqrt((p.x - rp.x) ** 2 + (p.y - rp.y) ** 2);
            if (Math.abs(d - rp.radius) < 20) glow += rp.alpha;
        });
        const alpha = Math.min(0.65 + glow * 0.6, 1.0);
        const col = idx % 2 === 0 ? colors.primary : colors.secondary;
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 + glow * 0.3), 0, Math.PI * 2); ctx.fill();
    });
}

/* ═══════════════════════════════════════
   #7 Gradient Drift (중간)
   — 두 색상 그룹이 반대 방향으로 흐르며 교차
═══════════════════════════════════════ */
function drawGradientDrift(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    pts: Particle[],
    colors: { primary: number[]; secondary: number[] }
) {
    const DIST = 110;
    const [pr, pg, pb] = colors.primary;
    const [sr, sg, sb] = colors.secondary;

    ctx.clearRect(0, 0, W, H);

    pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < DIST) {
                const mixed = pts[i].group !== pts[j].group;
                let r: number, g: number, b: number;
                if (mixed) {
                    r = (pr + sr) / 2; g = (pg + sg) / 2; b = (pb + sb) / 2;
                } else if (pts[i].group === 0) {
                    r = pr; g = pg; b = pb;
                } else {
                    r = sr; g = sg; b = sb;
                }
                const a = (1 - d / DIST) * (mixed ? 0.35 : 0.45);
                ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
                ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
            }
        }
    }

    pts.forEach(p => {
        const col = p.group === 0 ? [pr, pg, pb] : [sr, sg, sb];
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},0.85)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
}

/* ═══════════════════════════════════════
   #1 Classic Drift (하단)
   — 은은한 이색 연결선
═══════════════════════════════════════ */
function drawClassicDrift(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    pts: Particle[],
    colors: { primary: number[]; secondary: number[] }
) {
    const DIST = 120;
    const [pr, pg, pb] = colors.primary;
    const [sr, sg, sb] = colors.secondary;

    ctx.clearRect(0, 0, W, H);

    pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    // 연결선 — primary/secondary 혼합
    const lineR = (pr + sr) / 2, lineG = (pg + sg) / 2, lineB = (pb + sb) / 2;
    const N = pts.length;
    for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
            const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < DIST) {
                const a = (1 - d / DIST) * 0.45;
                ctx.strokeStyle = `rgba(${lineR},${lineG},${lineB},${a})`;
                ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
            }
        }
    }

    // 파티클 점 — 이색 교차
    pts.forEach((p, idx) => {
        const col = idx % 2 === 0 ? [pr, pg, pb] : [sr, sg, sb];
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},0.85)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
}

/* ═══════════════════════════════════════
   메인 컴포넌트
═══════════════════════════════════════ */
const ParticleNetworkBackground: React.FC = () => {
    const topRef = useRef<HTMLCanvasElement>(null);
    const midRef = useRef<HTMLCanvasElement>(null);
    const botRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number[]>([]);
    const { resolvedTheme } = useTheme();

    const initEffect = useCallback(
        (
            canvasRef: React.RefObject<HTMLCanvasElement | null>,
            zoneSelector: string,
            effectFn: (ctx: CanvasRenderingContext2D, W: number, H: number) => void,
        ) => {
            const cv = canvasRef.current;
            if (!cv) return () => { };

            const ctx = cv.getContext('2d');
            if (!ctx) return () => { };

            const resize = () => {
                const zone = document.querySelector(zoneSelector);
                if (zone) {
                    const rect = zone.getBoundingClientRect();
                    cv.width = window.innerWidth;
                    cv.height = rect.height;
                    cv.style.top = `${rect.top}px`;
                } else {
                    cv.width = window.innerWidth;
                    cv.height = window.innerHeight;
                }
            };

            resize();

            let running = true;
            const draw = () => {
                if (!running) return;
                effectFn(ctx, cv.width, cv.height);
                const id = requestAnimationFrame(draw);
                animRef.current.push(id);
            };
            draw();

            const onResize = () => resize();
            window.addEventListener('resize', onResize);
            window.addEventListener('scroll', onResize, { passive: true });

            return () => {
                running = false;
                window.removeEventListener('resize', onResize);
                window.removeEventListener('scroll', onResize);
            };
        },
        [],
    );

    useEffect(() => {
        // CSS 변수에서 테마 색상을 동적으로 읽어옴
        const colors = getParticleColors();

        // --- #8 Pulse Ripple (상단) ---
        const pulseN = 50;
        const pulsePts: Particle[] = Array.from({ length: pulseN }, () => ({
            x: rand(0, window.innerWidth),
            y: rand(0, window.innerHeight),
            vx: rand(-0.12, 0.12),
            vy: rand(-0.12, 0.12),
            r: rand(1.8, 3.5),
        }));
        const ripples: Ripple[] = [];
        const pulseFrame = { t: 0, nextRipple: 60 };

        const cleanupTop = initEffect(topRef, '#v2-zone-top', (ctx, W, H) => {
            drawPulseRipple(ctx, W, H, pulsePts, ripples, pulseFrame, colors);
        });

        // --- #7 Gradient Drift (중간) ---
        const SPEED = 0.10;
        const driftN = 30;
        const groupA: Particle[] = Array.from({ length: driftN }, () => ({
            x: rand(0, window.innerWidth), y: rand(0, 600),
            vx: rand(0.04, SPEED), vy: rand(-SPEED * 0.4, SPEED * 0.4),
            r: rand(1.8, 3.5), group: 0,
        }));
        const groupB: Particle[] = Array.from({ length: driftN }, () => ({
            x: rand(0, window.innerWidth), y: rand(0, 600),
            vx: rand(-SPEED, -0.04), vy: rand(-SPEED * 0.4, SPEED * 0.4),
            r: rand(1.8, 3.5), group: 1,
        }));
        const driftAll = [...groupA, ...groupB];

        const cleanupMid = initEffect(midRef, '#v2-zone-mid', (ctx, W, H) => {
            drawGradientDrift(ctx, W, H, driftAll, colors);
        });

        // --- #1 Classic Drift (하단) ---
        const classicN = 55;
        const classicPts: Particle[] = Array.from({ length: classicN }, () => ({
            x: rand(0, window.innerWidth),
            y: rand(0, 600),
            vx: rand(-0.18, 0.18),
            vy: rand(-0.18, 0.18),
            r: rand(2.0, 4.0),
        }));

        const cleanupBot = initEffect(botRef, '#v2-zone-bot', (ctx, W, H) => {
            drawClassicDrift(ctx, W, H, classicPts, colors);
        });

        return () => {
            cleanupTop();
            cleanupMid();
            cleanupBot();
            animRef.current.forEach(id => cancelAnimationFrame(id));
            animRef.current = [];
        };
    }, [resolvedTheme, initEffect]);

    const canvasStyle: React.CSSProperties = {
        position: 'absolute',
        left: 0,
        width: '100%',
        pointerEvents: 'none',
        opacity: 0.65,
        zIndex: 0,
    };

    return (
        <div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
        >
            <canvas ref={topRef} style={{ ...canvasStyle, top: 0 }} />
            <canvas ref={midRef} style={{ ...canvasStyle, top: '100vh' }} />
            <canvas ref={botRef} style={{ ...canvasStyle, top: '200vh' }} />
        </div>
    );
};

export default ParticleNetworkBackground;
