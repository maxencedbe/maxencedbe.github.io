import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectCard from "./ProjectCard.jsx";
import { useLocale } from "./useLocale.js";
import { watchSeparators } from "./tidySeparators.js";

const projectsData = {
  en: [
    {
      title: "Hi! PARIS Hi!ckathon 2025 (2nd place)",
      description: "Ranked 2nd out of 80+ teams in the 2025 edition of the Hi!Paris Data Science hackathon. Task: Predicting student PISA scores from complex socio-economic backgrounds. Engineered a Gated Model (router composed of two XGBoost regressors), achieving an R² score of 0.79 on the final test set.",
      imageUrl: "/HiParis.png",
      githubUrl: "https://github.com/maxencedbe/hi_paris_2025",
      category: ["Machine Learning"]
    },
    {
      title: "Molecular Graph Captioning (Kaggle competition)",
      description: "Development of a retrieval-based architecture using contrastive learning to align molecular graph embeddings with natural language descriptions in a joint latent space. Implementation of a dedicated Graph Neural Network encoder using PyTorch Geometric, optimized for semantic alignment through BERTScore and BLEU-4 metrics.",
      imageUrl: "/GraphMolecular.png",
      githubUrl: "https://github.com/maxencedbe/molecular_graph_captioning",
      category: ["Machine Learning"]
    },
    {
      title: "Streaming Safety Classifier for LLMs — Capstone Project with DragonLLM (now OVHai LLM)",
      description: "Reproduced the toxicity classifier from the Qwen3Guard technical report: synthesized diverse toxic and safe conversations with Qwen3-30B, labeled them using Qwen3Guard's safety classifier, then trained a lightweight per-token safety head on top of a frozen Qwen backbone for real-time, streaming unsafe-content detection.",
      imageUrl: "/DragonLLM.png",
      githubUrl: "https://github.com/maxencedbe/capstone_dragonllm",
      category: ["Machine Learning"]
    },
    {
      title: "ScratchNet",
      description: "Reimplemented a Multi-Layer Perceptron (MLP) from scratch with NumPy.",
      imageUrl: "/Neural_network.png",
      githubUrl: "https://github.com/maxencedbe/scratchnet",
      category: ["Machine Learning"]
    },
    {
      title: "Personal Portfolio Website",
      description: "Developed and deployed a personal portfolio website using Astro.",
      imageUrl: "/Astro.png",
      githubUrl: "https://github.com/maxencedbe/maxencedbe.github.io",
      category: ["Web dev"]
    },
    {
      title: "Data Privacy & Anonymization — Project Cassiopée",
      description: "Assessed privacy risks in anonymized datasets through OSINT and re-identification case studies, and proposed data protection strategies. Project conducted at Télécom SudParis under the supervision of Maryline Laurent and Louis-Philippe Sondeck.",
      imageUrl: "/Data.png",
      githubUrl: "https://github.com/maxencedbe/Cassiopee",
      category: ["Data Science"]
    },
    {
      title: "Automated Parking Optimization",
      description: "Developed a Python-based optimization model for vehicle placement in multi-level automated parking systems. Designed and evaluated heuristic algorithms (A* search, simulated annealing) to minimize retrieval costs and improve system efficiency.",
      imageUrl: "/Parking.png",
      githubUrl: "https://github.com/maxencedbe/parking-optimization",
      category: ["Data Science"]
    }
  ],
  fr: [
    {
      title: "Hi! PARIS Hi!ckathon 2025 (2e place)",
      description: "Classé 2e sur plus de 80 équipes lors de l'édition 2025 du hackathon de Data Science Hi!Paris. Tâche : prédire les scores PISA des étudiants à partir de contextes socio-économiques complexes. Conception d'un modèle « Gated » (routeur composé de deux régresseurs XGBoost), atteignant un score R² de 0,79 sur le jeu de test final.",
      imageUrl: "/HiParis.png",
      githubUrl: "https://github.com/maxencedbe/hi_paris_2025",
      category: ["Machine Learning"]
    },
    {
      title: "Molecular Graph Captioning (compétition Kaggle)",
      description: "Développement d'une architecture basée sur la recherche d'information utilisant l'apprentissage contrastif pour aligner les embeddings de graphes moléculaires avec des descriptions en langage naturel dans un espace latent commun. Implémentation d'un encodeur Graph Neural Network dédié utilisant PyTorch Geometric, optimisé pour l'alignement sémantique via les métriques BERTScore et BLEU-4.",
      imageUrl: "/GraphMolecular.png",
      githubUrl: "https://github.com/maxencedbe/molecular_graph_captioning",
      category: ["Machine Learning"]
    },
    {
      title: "Classifieur de sécurité en streaming pour LLM — Capstone avec DragonLLM (maintenant OVHai LLM)",
      description: "Reproduction du classifieur de toxicité du rapport technique Qwen3Guard : synthèse de conversations toxiques et sûres avec Qwen3-30B, labellisation via le classifieur de sécurité de Qwen3Guard, puis entraînement d'une safety head légère au-dessus d'un backbone Qwen gelé pour une détection de contenu nuisible en temps réel, token par token.",
      imageUrl: "/DragonLLM.png",
      githubUrl: "https://github.com/maxencedbe/capstone_dragonllm",
      category: ["Machine Learning"]
    },
    {
      title: "ScratchNet",
      description: "Réimplémentation d'un Perceptron Multi-Couches (MLP) à partir de zéro avec NumPy.",
      imageUrl: "/Neural_network.png",
      githubUrl: "https://github.com/maxencedbe/scratchnet",
      category: ["Machine Learning"]
    },
    {
      title: "Site web portfolio personnel",
      description: "Développement et déploiement d'un site web portfolio personnel utilisant Astro.",
      imageUrl: "/Astro.png",
      githubUrl: "https://github.com/maxencedbe/maxencedbe.github.io",
      category: ["Web dev"]
    },
    {
      title: "Confidentialité des données & anonymisation — Projet Cassiopée",
      description: "Évaluation des risques de confidentialité dans des ensembles de données anonymisés via des études de cas OSINT et de ré-identification, et proposition de stratégies de protection des données. Projet mené à Télécom SudParis sous la supervision de Maryline Laurent et Louis-Philippe Sondeck.",
      imageUrl: "/Data.png",
      githubUrl: "https://github.com/maxencedbe/Cassiopee",
      category: ["Data Science"]
    },
    {
      title: "Optimisation de parking automatisé",
      description: "Développement d'un modèle d'optimisation en Python pour le placement de véhicules dans des systèmes de stationnement automatisés à plusieurs niveaux. Conception et évaluation d'algorithmes heuristiques (recherche A*, recuit simulé) pour minimiser les coûts de récupération et améliorer l'efficacité du système.",
      imageUrl: "/Parking.png",
      githubUrl: "https://github.com/maxencedbe/parking-optimization",
      category: ["Data Science"]
    }
  ]
};

const filterLabels = {
  en: { All: "All", "Data Science": "Data Science", "Machine Learning": "Machine Learning", "Web dev": "Web dev" },
  fr: { All: "Tout", "Data Science": "Data Science", "Machine Learning": "Machine Learning", "Web dev": "Développement web" }
};

const ui = {
  en: { showMore: "Show more projects", showLess: "Show less", noResults: "No projects found in this category.", viewCode: "View on GitHub" },
  fr: { showMore: "Voir plus de projets", showLess: "Voir moins", noResults: "Aucun projet trouvé dans cette catégorie.", viewCode: "Voir sur GitHub" }
};

const FILTER_KEYS = ["All", "Data Science", "Machine Learning", "Web dev"];

export default function ProjectGrid() {
  const locale = useLocale();
  const [activeFilter, setActiveFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const containerRef = React.useRef(null);
  // The block that cross-fades on a filter change, and a latch so a second
  // click mid-fade cannot start an overlapping one.
  const listRef = React.useRef(null);
  const filterRowRef = React.useRef(null);
  const swappingRef = React.useRef(false);

  const projects = projectsData[locale] || projectsData.en;
  const labels = filterLabels[locale] || filterLabels.en;
  const t = ui[locale] || ui.en;

  const filteredProjects = useMemo(() => {
    if (activeFilter === "All") return projects;
    return projects.filter(project => project.category.includes(activeFilter));
  }, [activeFilter, projects]);

  const firstPassRef = React.useRef(true);
  React.useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
        else entry.target.classList.remove("is-visible");
      });
    }, { root: null, rootMargin: "0px 0px -150px 0px", threshold: 0.1 });
    const elements = containerRef.current.querySelectorAll("[class*='reveal-']");
    elements.forEach((el) => {
      // On the first pass the cards reveal as you scroll to them, as before. On
      // a filter change they are handed over already revealed: the swap is
      // covered by the block fade below, and replaying each card's own reveal
      // underneath it was the staggered, jumpy part.
      if (firstPassRef.current) el.classList.remove("is-visible");
      else el.classList.add("is-visible");
      observer.observe(el);
    });
    firstPassRef.current = false;
    return () => observer.disconnect();
  }, [activeFilter]);

  // A one-word title like ScratchNet sits on the logo's top edge, leaving the
  // rest of the logo's height blank beside it. Centring it is content-dependent
  // — a long title must stay at the top and flow around the float — and CSS
  // cannot branch on how many lines something takes. Padding is used rather than
  // `align-content`, which would centre it but turn the heading into its own
  // formatting context, costing long titles the full width they need.
  React.useEffect(() => {
    const centreShortTitles = () => {
      const cards = containerRef.current?.querySelectorAll(".card") ?? [];
      for (const card of cards) {
        const title = card.querySelector("h4");
        const logo = card.querySelector(".card-image");
        if (!title || !logo) continue;
        title.style.paddingTop = "";
        // Only below the breakpoint; above it the logo sits in a flex row.
        if (window.innerWidth > 768) continue;
        // The min-height that reserves the logo's band also inflates what the
        // heading reports, so measuring it directly always found no slack at
        // all. Lifted for the reading, which is what the lines actually take.
        title.style.minHeight = "0";
        const natural = title.offsetHeight;
        title.style.minHeight = "";
        const slack = logo.offsetHeight - natural;
        if (slack > 1) title.style.paddingTop = `${slack / 2}px`;
      }
    };
    centreShortTitles();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => requestAnimationFrame(centreShortTitles));
    }
    const timers = [setTimeout(centreShortTitles, 300), setTimeout(centreShortTitles, 1200)];
    window.addEventListener("resize", centreShortTitles);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", centreShortTitles);
    };
  }, [locale, activeFilter, showAll]);

  // The filter row wraps to two lines on a phone, which leaves the rule between
  // Data Science and Machine Learning stranded at a line edge. Same rule as the
  // skills rows, same implementation. Re-run when the labels change language,
  // since that changes their widths and so where the row breaks.
  React.useEffect(() => {
    return watchSeparators(filterRowRef.current);
  }, [locale]);

  const smoothScrollToY = (target, duration = 800, onComplete) => {
    const start = window.scrollY;
    const distance = target - start;
    const startTime = performance.now();
    const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, start + distance * ease(progress));
      if (progress < 1) requestAnimationFrame(step);
      else if (onComplete) onComplete();
    };
    requestAnimationFrame(step);
  };

  // Same shape as the language switch: the whole block goes out as one, the
  // content is swapped while nothing is on screen, and it comes back a little
  // more slowly than it left. Fading each card on its own instead let the new
  // set reflow into place while half visible, which is what made it look like
  // things were jumping around.
  const changeFilter = (key) => {
    if (key === activeFilter || swappingRef.current) return;
    const el = listRef.current;
    if (!el) { setActiveFilter(key); return; }

    swappingRef.current = true;
    el.style.transition = "opacity 0.2s ease-in";
    el.style.opacity = "0";

    setTimeout(() => {
      setActiveFilter(key);
      // Two frames, so React has committed the new cards before they are shown.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.transition = "opacity 0.35s ease-out";
        el.style.opacity = "1";
        setTimeout(() => {
          el.style.transition = "";
          el.style.opacity = "";
          swappingRef.current = false;
        }, 380);
      }));
    }, 200);
  };

  const handleToggleExpand = () => {
    if (showAll) {
      setShowAll(false);
      const el = document.getElementById('projects');
      if (!el) return;
      const NAVBAR_OFFSET = 35;
      const lenis = window.lenis;
      if (lenis) {
        lenis.scrollTo(el, { offset: -NAVBAR_OFFSET, duration: 1.5 });
      } else {
        const target = el.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
        smoothScrollToY(target, 1500);
      }
    } else {
      setShowAll(true);
    }
  };

  return (
    <div className="w-full" ref={containerRef}>
      {/* Claws back most of the grid wrapper's px-4 on phones, where that padding
          stacks on the main's and leaves the row 311px of a 375px screen.
          Twelve pixels and not the full sixteen: at 396px the row is wide enough
          for Machine Learning to join the first line, stranding Web dev alone on
          the second. Twelve leaves the widest iPhone — 430pt, so a 390px row —
          six pixels short of that, where sixteen would put it eight past. */}
      <div data-sep-row ref={filterRowRef} className="-mx-3 sm:mx-0 flex flex-wrap justify-center items-center mb-12">
        {FILTER_KEYS.map((key, index) => (
          <React.Fragment key={key}>
            {index > 0 && <div className="sep-rule w-[1px] h-4 bg-black/15 dark:bg-white/15" aria-hidden="true"></div>}
            {/* Forces the break after the second filter on phones, instead of
                leaving it to whatever happens to fit. No padding value can give
                two and two in both languages at every width — the constraints
                contradict each other, since "Développement web" is far wider
                than "Web dev" — and left to itself the row split three and one
                on the larger screens. A zero-height full-basis item pushes the
                rest onto the next line whatever the width. It sits after the
                separator, not before, so that separator ends line one and the
                pass drops it. */}
            {index === 2 && <div data-sep-break className="basis-full h-0 sm:hidden" aria-hidden="true"></div>}
            <div className="reveal-up px-1.5 sm:px-2" style={{ transitionDelay: `${index * 100}ms` }}>
              <button
                data-locale-fade
                onClick={() => changeFilter(key)}
                className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium filter-btn inline-flex items-center justify-center transition-transform duration-300 cursor-pointer transform-gpu antialiased ${activeFilter === key ? "active" : ""}`}
              >
                {labels[key]}
              </button>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="flex flex-col items-center w-full max-w-6xl mx-auto" ref={listRef}>
        <div className="flex flex-col gap-0 w-full items-center">
          {/* No AnimatePresence here any more: an exit animation would have kept
              the outgoing cards mounted past the swap, so they would still have
              been on screen as the block faded back in — the old set showing
              through the new one. The block fade covers the change on its own. */}
          {filteredProjects.map((project, index) => {
            const isHiddenByDefault = activeFilter === "All" && index >= 3;
            if (isHiddenByDefault) return null;
            return (
              <div key={index + '-' + activeFilter} className="flex flex-col items-center w-full">
                {index > 0 && <div className="w-24 h-px bg-black/10 dark:bg-white/10 my-3.5 md:my-3" aria-hidden="true"></div>}
                <ProjectCard
                  title={project.title}
                  description={project.description}
                  imageUrl={project.imageUrl}
                  githubUrl={project.githubUrl}
                  viewCodeLabel={t.viewCode}
                />
              </div>
            );
          })}
        </div>

        <AnimatePresence initial={false}>
          {activeFilter === "All" && filteredProjects.length > 3 && showAll && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden flex flex-col items-center w-[calc(100%+60px)] px-[30px]"
            >
              <div className="flex flex-col gap-0 w-full items-center pb-4 md:pb-8">
                {filteredProjects.slice(3).map((project, index) => (
                  <motion.div
                    key={project.title}
                    className="flex flex-col items-center w-full"
                  >
                    <div className="w-24 h-px bg-black/10 dark:bg-white/10 my-3.5 md:my-3" aria-hidden="true"></div>
                    <ProjectCard
                      title={project.title}
                      description={project.description}
                      imageUrl={project.imageUrl}
                      githubUrl={project.githubUrl}
                      viewCodeLabel={t.viewCode}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <p data-locale-fade className="text-center text-gray-500 mt-10">{t.noResults}</p>
        )}

        {activeFilter === "All" && filteredProjects.length > 3 && (
          <div className={`${showAll ? "mt-4" : "mt-6 md:mt-8"} flex justify-center reveal-up`}>
            <button
              onClick={handleToggleExpand}
              className="px-4 py-2 rounded-full text-sm font-medium filter-btn inline-flex items-center justify-center transition-transform duration-300 cursor-pointer transform-gpu antialiased"
            >
              <span data-locale-fade>{showAll ? t.showLess : t.showMore}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
