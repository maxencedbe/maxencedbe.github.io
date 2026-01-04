import { useEffect, useRef } from "react";
import { gsap, Circ } from "gsap";
import "../styles/animatedBackground.css";

export default function AnimatedBackground() {
  const canvasRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let largeHeader = headerRef.current;
    let canvas = canvasRef.current;
    let ctx = canvas.getContext("2d");
    let points = [];
    let target = { x: width / 2, y: height / 2 };
    let animateHeader = true;
    let animationFrameId;
    let isDark = document.documentElement.classList.contains("dark");


    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          isDark = document.documentElement.classList.contains("dark");
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    const scaleCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      largeHeader.style.height = height + "px";
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    scaleCanvas();

    let spacing;
    if (width < 768) {
      spacing = 100;
    } else if (width < 1200) {
      spacing = 90;
    } else {
      spacing = 80;
    }

    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        const px = x + Math.random() * spacing;
        const py = y + Math.random() * spacing;
        points.push({ x: px, originX: px, y: py, originY: py });
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
      let spacing;
      if (width < 768) {
        spacing = 100;
      } else if (width < 1200) {
        spacing = 90;
      } else {
        spacing = 80;
      }

      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          const px = x + Math.random() * spacing;
          const py = y + Math.random() * spacing;
          points.push({ x: px, originX: px, y: py, originY: py });
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


      gsap.killTweensOf(points);
      points.forEach(shiftPoint);
    };

    window.addEventListener("resize", resize);

    points.forEach(shiftPoint);

    function animate() {
      if (animateHeader) {
        ctx.clearRect(0, 0, width, height);


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

        points.forEach((p) => {
          if (Math.abs(getDistance(target, p)) < 4000) {
            p.active = 0.3;
            p.circle.active = 0.6;
          } else if (Math.abs(getDistance(target, p)) < 20000) {
            p.active = 0.1;
            p.circle.active = 0.3;
          } else if (Math.abs(getDistance(target, p)) < 40000) {
            p.active = 0.02;
            p.circle.active = 0.1;
          } else {
            p.active = 0;
            p.circle.active = 0;
          }

          drawLines(p, r, g, b);
          p.circle.draw();
        });
      }
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    function shiftPoint(p) {
      gsap.to(p, {
        duration: 2 + Math.random() * 2,
        x: p.originX - 50 + Math.random() * 100,
        y: p.originY - 50 + Math.random() * 100,
        ease: Circ.easeInOut,
        onComplete: () => shiftPoint(p),
      });
    }

    function drawLines(p, r, g, b) {
      if (!p.active) return;


      ctx.beginPath();
      p.closest.forEach((c) => {
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(c.x, c.y);
      });
      ctx.strokeStyle = `rgba(${r},${g},${b},${p.active})`;
      ctx.stroke();
    }

    function circle(pos, rad) {
      this.pos = pos;
      this.radius = rad;
      this.active = 0;
      this.draw = function () {
        if (!this.active) return;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);

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
      gsap.killTweensOf(points);
      observer.disconnect();
    };
  }, []);

  return (
    <div id="large-header" ref={headerRef} className="large-header demo-1" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, transform: 'translateZ(0)' }}>
      <canvas id="demo-canvas" ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas>
    </div>
  );
}