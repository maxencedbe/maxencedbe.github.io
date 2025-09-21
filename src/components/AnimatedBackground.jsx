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

    largeHeader.style.height = height + "px";
    canvas.width = width;
    canvas.height = height;

    for (let x = 0; x < width; x += width / 20) {
      for (let y = 0; y < height; y += height / 20) {
        const px = x + Math.random() * (width / 20);
        const py = y + Math.random() * (height / 20);
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
            if (!placed && getDistance(p1, p2) < getDistance(p1, closest[k])) {
              closest[k] = p2;
              placed = true;
            }
          }
        }
      });
      p1.closest = closest;
    });

    points.forEach((p) => {
      p.circle = new circle(p, 2 + Math.random() * 2, "rgba(156,217,249,0.3)");
    });


    const scrollCheck = () => {
      animateHeader = document.body.scrollTop <= height;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      largeHeader.style.height = height + "px";
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("scroll", scrollCheck);
    window.addEventListener("resize", resize);

    points.forEach(shiftPoint);
    animate();

    function animate() {
      if (animateHeader) {
        ctx.clearRect(0, 0, width, height);
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
          drawLines(p);
          p.circle.draw();
        });
      }
      requestAnimationFrame(animate);
    }

    function shiftPoint(p) {
      gsap.to(p, {
        duration: 2 + Math.random()*2,
        x: p.originX - 50 + Math.random() * 100,
        y: p.originY - 50 + Math.random() * 100,
        ease: Circ.easeInOut,
        onComplete: () => shiftPoint(p),
      });
    }

    function drawLines(p) {
    if (!p.active) return;
      p.closest.forEach((c) => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(c.x, c.y);
        const r = 156 + Math.sin(Date.now() * 0.001) * 50;
        const g = 217;
        const b = 249 + Math.cos(Date.now() * 0.001) * 50;
        ctx.strokeStyle = `rgba(${r},${g},${b},${p.active})`;
        ctx.shadowColor = `rgba(${r},${g},${b},0.6)`;
        ctx.shadowBlur = 6;
        ctx.stroke();
      });
    }

    function circle(pos, rad, color) {
      this.pos = pos;
      this.radius = rad;
      this.color = color;
      this.active = 0;
      this.draw = function () {
        if (!this.active) return;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = "rgba(156,217,249," + this.active + ")";
        ctx.fill();
      };
    }

    function getDistance(p1, p2) {
      return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("scroll", scrollCheck);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div id="large-header" ref={headerRef} className="large-header demo-1">
      <canvas id="demo-canvas" ref={canvasRef}></canvas>
    </div>
  );
}