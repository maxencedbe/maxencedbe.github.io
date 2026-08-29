// A separator only means something between two items on the same line. Once a
// wrapping row breaks, whichever one straddles the break is left dangling at the
// end of a line or leading the next. CSS cannot see line boxes, so the break is
// found by comparing the offsetTop of the items either side.
//
// Shared by the skills and spoken-languages rows in the page and by the project
// filters, which are a React island — same rule, one implementation.
function rowsIn(root) {
  const scope = root && root.querySelectorAll ? root : document;
  return [
    ...(scope.matches && scope.matches('[data-sep-row]') ? [scope] : []),
    ...scope.querySelectorAll('[data-sep-row]'),
  ];
}

export function tidySeparators(root) {
  rowsIn(root).forEach((row) => {
    const seps = [...row.querySelectorAll('.sep-rule')];
    seps.forEach((s) => { s.style.visibility = ''; });

    // `visibility`, not `display`, and that is the whole trick. Removing a
    // separator from the flow frees the space it held, which can pull an item up
    // a line and invalidate the very measurement the decision came from — a row
    // ended up with a rule missing between two items that had landed on the same
    // line, and another left stranded at a break. Made invisible instead, the
    // separator keeps its place, the layout never moves, and one reading of the
    // wrap stays true for every separator in the row.
    //
    // The cost is the few pixels it still occupies at the end of a line, which
    // nudges that line's centring by about half of them. Cheaper than being
    // wrong.
    const line = new Map();
    for (const child of row.children) line.set(child, child.offsetTop);

    // A separator's neighbours are the nearest items either side, which are not
    // always the nearest elements: a row may carry a zero-height spacer that
    // forces the wrap, and that spacer is itself display:none above the phone
    // breakpoint. An unrendered element reports offsetTop 0, which matches
    // nothing, so comparing against one hid a separator on a row that had not
    // even wrapped. Both are stepped over.
    const skip = (el) => el.hasAttribute('data-sep-break') || el.offsetParent === null;
    const neighbour = (el, dir) => {
      let n = el[dir];
      while (n && skip(n)) n = n[dir];
      return n;
    };

    for (const sep of seps) {
      const prev = neighbour(sep, 'previousElementSibling');
      const next = neighbour(sep, 'nextElementSibling');
      if (!prev || !next) continue;
      if (line.get(prev) !== line.get(next)) sep.style.visibility = 'hidden';
    }
  });
}

// Running once is not enough. The pass reads a laid-out row, and that layout can
// still change afterwards — most often when the webfont lands and every label
// resizes. `fonts.ready` resolves when loading finishes, which is not the same
// instant as the reflow that follows, so a run pinned to it alone can read stale
// positions and leave the wrong separator hidden, with nothing to correct it: a
// phone fires no resize event of its own.
//
// So it is simply repeated as things settle. A ResizeObserver would be the
// tidier instrument, but nothing holds a reference to one created here and it
// stopped firing; a couple of timers do the same job with no lifetime to get
// wrong.
export function watchSeparators(root) {
  const run = () => tidySeparators(root);
  run();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(run));
  }
  const timers = [setTimeout(run, 300), setTimeout(run, 1200)];
  window.addEventListener('resize', run);

  return () => {
    timers.forEach(clearTimeout);
    window.removeEventListener('resize', run);
  };
}
