import { useEffect, useRef } from "react";
import "../styles/animatedBackground.css";

export default function AnimatedBackground({ instant = false }) {
  const canvasRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // How far from the pointer a star still shows. The thresholds below are
    // squared distances, so 40000 is a 200px radius — a 400px disc. That is a
    // contained cluster on a 1280px desktop (under a third of the width) but
    // wider than a 375px phone, which is why the constellation covered the whole
    // screen there. Scaling by the viewport's narrow side keeps the cluster the
    // same fraction of the screen everywhere; 800 is the desktop height it was
    // originally tuned against, so desktop is unchanged.
    const clusterScale = () => Math.pow(Math.min(width, height) / 800, 2);
    let reach = clusterScale();
    // The visible patch was a circle, so on a wide screen it sat as a narrow
    // column in the middle. Horizontal distance is divided by this before the
    // thresholds below, which stretches the circle into an ellipse following
    // the screen's shape: as wide as the aspect ratio allows, capped so an
    // ultrawide still keeps some empty margin. Portrait phones get 1, unchanged.
    const stretchFor = () => Math.min(Math.max(width / height, 1), 2);
    let stretch = stretchFor();
    let largeHeader = headerRef.current;
    let canvas = canvasRef.current;
    let ctx = canvas.getContext("2d");
    let points = [];
    let target = { x: width / 2, y: height / 2 };
    let animateHeader = true;
    let animationFrameId;
    let isDark = document.documentElement.classList.contains("dark");
    // `instant` (locked pages such as 404) skips the staggered constellation
    // build-up so the page just fades in quickly instead of playing the intro.
    // So does a page whose intro was skipped because this tab has already seen
    // it (see the first script in Layout's body).
    // Someone who has asked their system to reduce motion gets the
    // constellation drawn at once and then held still: no build-up and
    // no drift.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const skipBuild = instant || window.__introSkipped === true || reduceMotion;
    // The build-up: points appear as a wave spreading out from the centre,
    // each one easing in and swelling to size, and a line only starts tracing
    // towards a neighbour once both of its ends are there. The spread and fade
    // still add up to the 2.9s the 'constellation-ready' event was tuned to;
    // the last lines finish tracing a little after it.
    const revealSpread = skipBuild ? 0 : 2300;
    const pointFadeDuration = skipBuild ? 200 : 600;
    const lineDrawDuration = skipBuild ? 0 : 500;
    const revealStart = performance.now();

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    // Overshoots by a few percent before settling, so a dot pops into place
    // rather than just growing.
    const easeOutBack = (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('constellation-ready'));
    }, revealSpread + pointFadeDuration);


    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          isDark = document.documentElement.classList.contains("dark");
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    // Each point wanders to a fresh random spot near its origin, eases there
    // over two to four seconds, then picks another — the original motion, which
    // reads as drifting rather than oscillating. What changed is only where it
    // is evaluated. It used to be a GSAP tween per point that re-created itself
    // on completion, so every point held a permanent, self-perpetuating tween
    // driven by GSAP's ticker whether or not the canvas was even visible. At 24
    // points that was survivable; once the mesh was tightened for phones it
    // meant 180 live tweens plus a steady churn of tween objects for the
    // collector. Run from the clock inside the draw loop it costs a handful of
    // arithmetic per point, and stops entirely when the canvas is skipped.
    //
    // A first attempt replaced it with a sine drift, which was cheaper still but
    // strictly periodic, and looked it.
    const circInOut = (t) =>
      t < 0.5
        ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
        : (Math.sqrt(1 - (2 * t - 2) * (2 * t - 2)) + 1) / 2;

    // Starts from wherever the point currently is, so a leg that expired while
    // the canvas was hidden resumes without a jump.
    const newLeg = (p, now) => {
      p.legStart = now;
      p.legDuration = 2000 + Math.random() * 2000;
      p.fromX = p.x;
      p.fromY = p.y;
      p.toX = p.originX - 50 + Math.random() * 100;
      p.toY = p.originY - 50 + Math.random() * 100;
    };

    // Birth time grows with distance from the centre, measured in the same
    // stretched space as the visibility falloff and relative to its outer edge,
    // so the wave crosses exactly the visible patch over the reveal. A little
    // jitter keeps the front ragged instead of a perfect expanding ring; points
    // beyond the edge are invisible anyway and are born at the end.
    const birthTimeFor = (px, py) => {
      const edge = Math.sqrt(40000 * reach);
      const d = Math.sqrt(Math.pow((px - width / 2) / stretch, 2) + Math.pow(py - height / 2, 2));
      return (Math.min(d / edge, 1) * 0.8 + Math.random() * 0.2) * revealSpread;
    };

    const makePoint = (px, py) => ({
      x: px, originX: px,
      y: py, originY: py,
      birthTime: birthTimeFor(px, py),
      // Zero duration, so the first update rolls a leg rather than special-casing it.
      legStart: 0, legDuration: 0,
      fromX: px, fromY: py, toX: px, toY: py,
    });

    // Cell size of the point grid, and so the point count. It has to shrink with
    // the screen rather than grow — it used to be widest on phones, leaving
    // roughly three points across a 375px viewport against sixteen on a desktop,
    // the same constellation blown up — but 40 overshot in the other direction:
    // a 375x812 phone got 10 x 21 = 210 points, as many as a 1512px desktop, on
    // a fraction of the hardware. At 55 that is 7 x 15 = 105, half as many, and
    // the neighbour search that runs at startup and on resize is O(n squared),
    // so its work drops fourfold. Still about seven cells across, nothing like
    // the three it started from.
    const spacingFor = (w) => (w < 768 ? 55 : w < 1200 ? 90 : 80);

    const scaleCanvas = () => {
      // Drawn at the screen's real pixel density, up to 3. It used to be capped
      // at 2 to save fill rate on phones, which commonly report 3, but the
      // canvas was then upscaled by half again and the hairlines came out
      // visibly soft next to the crisp text around them. The loop already stops
      // drawing once the canvas has faded out on scroll, so the extra cost is
      // only paid while the hero is on screen.
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      width = window.innerWidth;
      height = window.innerHeight;
      reach = clusterScale();
      stretch = stretchFor();
      largeHeader.style.height = height + "px";
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    scaleCanvas();

    // Kept in step with the identical block in `resize` below — they had drifted
    // apart, so a phone opened the page on the old coarse mesh and only picked up
    // the tighter one if the window happened to be resized.
    let spacing = spacingFor(width);

    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        const px = x + Math.random() * spacing;
        const py = y + Math.random() * spacing;
        points.push(makePoint(px, py));
      }
    }

    points.forEach((p1) => {
      const closest = [];
      points.forEach((p2) => {
        if (p1 !== p2) {
          let placed = false;
          for (let k = 0; k < 5; k++) {
            if (!placed && !closest[k]) {
              closest[k] = p2;
              placed = true;
            }
          }
          for (let k = 0; k < 5; k++) {
            if (
              !placed &&
              getDistance(p1, p2) < getDistance(p1, closest[k])
            ) {
              closest[k] = p2;
              placed = true;
            }
          }
        }
      });
      p1.closest = closest;
    });

    points.forEach((p) => {
      p.circle = new circle(
        p,
        2 + Math.random() * 2,
        undefined // Color will be determined in draw
      );
    });



    const resize = () => {
      if (Math.abs(window.innerWidth - width) < 50) return;

      scaleCanvas();
      target = { x: width / 2, y: height / 2 };


      points = [];
      const spacing = spacingFor(width);

      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          const px = x + Math.random() * spacing;
          const py = y + Math.random() * spacing;
          points.push(makePoint(px, py));
        }
      }


      points.forEach((p1) => {
        const closest = [];
        points.forEach((p2) => {
          if (p1 !== p2) {
            let placed = false;
            for (let k = 0; k < 5; k++) {
              if (!placed && !closest[k]) {
                closest[k] = p2;
                placed = true;
              }
            }
            for (let k = 0; k < 5; k++) {
              if (
                !placed &&
                getDistance(p1, p2) < getDistance(p1, closest[k])
              ) {
                closest[k] = p2;
                placed = true;
              }
            }
          }
        });
        p1.closest = closest;
      });


      points.forEach((p) => {
        p.circle = new circle(
          p,
          2 + Math.random() * 2,
          undefined
        );
      });


    };

    window.addEventListener("resize", resize);


    // Fade the background out as soon as scrolling starts — it's a hero intro
    // effect, and left fully visible for the whole page it competes with text
    // for attention (especially now that content sections have no opaque card
    // behind them). Tied directly to scrollY (not a threshold that only flips
    // once the hero has mostly left the viewport) so it starts dissolving on
    // the very first pixel scrolled, fully gone well before About. Pages
    // without a #home hero (e.g. 404) keep it visible, nothing to fade against.
    const heroEl = document.getElementById('home');
    let onScroll;
    // Once the fade above reaches zero the canvas is fully transparent, but it
    // was still clearing and redrawing every point and line 60 times a second
    // for the whole rest of the page — invisible work that competed with
    // scrolling itself. Worst on phones, which have no Lenis to smooth things
    // over and far less headroom. The loop keeps running so it picks straight
    // back up on the way to the top; it just stops drawing what nobody sees.
    let isVisible = true;
    if (heroEl) {
      let ticking = false;
      onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const fadeDistance = height * 0.5;
          const opacity = Math.max(0, 1 - window.scrollY / fadeDistance);
          largeHeader.style.opacity = String(opacity);
          if (isVisible && opacity === 0) ctx.clearRect(0, 0, width, height);
          isVisible = opacity > 0;
          ticking = false;
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    // Line and dot opacity against distance, where 1 is the outer edge of the
    // visible patch. It used to be four flat bands (0.3 / 0.1 / 0.02 / 0 for
    // lines), so a drifting point crossing a band edge switched all its lines
    // to the next level in a single frame, which read as a line suddenly
    // changing colour. Now it interpolates between the same levels, placed at
    // the same distances (the bands' edges were at 0.32, 0.71 and 1), so the
    // overall shape is unchanged but nothing ever jumps.
    const falloffStops = [
      [0, 0.3, 0.6],
      [0.32, 0.3, 0.6],
      [0.71, 0.1, 0.3],
      [1, 0.02, 0.1],
      [1.15, 0, 0],
    ];
    function falloff(u) {
      for (let i = 1; i < falloffStops.length; i++) {
        const [u1, l1, d1] = falloffStops[i];
        if (u <= u1) {
          const [u0, l0, d0] = falloffStops[i - 1];
          const k = (u - u0) / (u1 - u0);
          return [l0 + (l1 - l0) * k, d0 + (d1 - d0) * k];
        }
      }
      return [0, 0];
    }

    function animate() {
      if (animateHeader && isVisible) {
        ctx.clearRect(0, 0, width, height);

        const elapsed = performance.now() - revealStart;

        let r, g, b;
        if (isDark) {
          r = 245 + Math.sin(Date.now() * 0.001) * 10;
          g = 245 + Math.cos(Date.now() * 0.001) * 10;
          b = 255;
        } else {
          r = 30 + Math.sin(Date.now() * 0.001) * 15;
          g = 30;
          b = 60 + Math.cos(Date.now() * 0.001) * 15;
        }

        const now = performance.now();

        points.forEach((p) => {
          if (!reduceMotion) {
            // Written so the first frame (0/0) and a leg that ran out while the
            // canvas was hidden both fall through to a fresh one.
            let t = (now - p.legStart) / p.legDuration;
            if (!(t < 1)) {
              newLeg(p, now);
              t = 0;
            }
            const e = circInOut(t);
            p.x = p.fromX + (p.toX - p.fromX) * e;
            p.y = p.fromY + (p.toY - p.fromY) * e;
          }

          // How long since this point was born (0 if not yet born)
          const age = Math.max(0, elapsed - p.birthTime);
          // Fade-in progress for this individual point (0 → 1 over
          // pointFadeDuration), eased so it arrives fast and settles, and
          // driving the dot's size as well as its opacity.
          const grow = pointFadeDuration ? Math.min(1, age / pointFadeDuration) : 1;
          const pointAlpha = easeOutCubic(grow);
          p.circle.scale = Math.max(0, easeOutBack(grow));

          if (pointAlpha <= 0) {
            p.active = 0;
            p.circle.active = 0;
          } else {
            // Opacity by distance from the centre, multiplied by the point's
            // own fade-in.
            const d = Math.pow((p.x - target.x) / stretch, 2) + Math.pow(p.y - target.y, 2);
            const [lineLevel, dotLevel] = falloff(Math.sqrt(d / (40000 * reach)));
            p.active = lineLevel * pointAlpha;
            p.circle.active = dotLevel * pointAlpha;
          }

          drawLines(p, r, g, b, elapsed);
          p.circle.draw();
        });
      }
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    // A line traces out from p towards its neighbour, starting once both
    // points are halfway through fading in. Before that it isn't drawn at all,
    // so nothing ever points at an empty spot.
    function drawLines(p, r, g, b, elapsed) {
      if (!p.active) return;

      ctx.beginPath();
      p.closest.forEach((c) => {
        let k = 1;
        if (lineDrawDuration) {
          const start = Math.max(p.birthTime, c.birthTime) + pointFadeDuration / 2;
          const t = (elapsed - start) / lineDrawDuration;
          if (t <= 0) return;
          if (t < 1) k = easeOutCubic(t);
        }
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + (c.x - p.x) * k, p.y + (c.y - p.y) * k);
      });
      ctx.strokeStyle = `rgba(${r},${g},${b},${p.active})`;
      ctx.stroke();
    }

    function circle(pos, rad) {
      this.pos = pos;
      this.radius = rad;
      this.scale = 1;
      this.active = 0;
      this.draw = function () {
        if (!this.active) return;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius * this.scale, 0, 2 * Math.PI, false);

        if (isDark) {
          ctx.fillStyle = "rgba(255,255,255," + this.active + ")";
        } else {
          ctx.fillStyle = "rgba(30,30,60," + this.active + ")";
        }

        ctx.fill();
      };
    }

    function getDistance(p1, p2) {
      return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      if (onScroll) window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div id="large-header" ref={headerRef} className="large-header demo-1" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, transform: 'translateZ(0)' }}>
      <canvas id="demo-canvas" ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas>
    </div>
  );
}