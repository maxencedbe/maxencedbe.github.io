import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectCard from "./ProjectCard.jsx";
import { useLocale } from "./useLocale.js";

const projectsData = {
  en: [
    {
      title: "Hi! PARIS Hi!ckathon 2025 (finalist)",
      description: "Ranked 2nd out of 80+ teams in the 2025 edition of the Hi!Paris Data Science hackathon. Task: Predicting student PISA scores from complex socio-economic backgrounds. Engineered a Gated Model (router composed of two XGBoost regressors), achieving an R² score of 0.79 on the final test set.",
      imageUrl: "/HiParis.png",
      githubUrl: "https://github.com/maxencedbe/hi_paris_2025",
      category: ["Machine Learning"]
    },
    {
      title: "Molecular graph captioning - Kaggle competition",
      description: "Development of a retrieval-based architecture using contrastive learning to align molecular graph embeddings with natural language descriptions in a joint latent space. Implementation of a dedicated Graph Neural Network encoder using PyTorch Geometric, optimized for semantic alignment through BERTScore and BLEU-4 metrics.",
      imageUrl: "/GraphMolecular.png",
      githubUrl: "https://github.com/maxencedbe/molecular_graph_captioning",
      category: ["Machine Learning"]
    },
    {
      title: "Streaming safety classifier for LLMs - Capstone Project with DragonLLM",
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
      title: "Personal portfolio website",
      description: "Developed and deployed a personal portfolio website using Astro.",
      imageUrl: "/Astro.png",
      githubUrl: "https://github.com/maxencedbe/maxencedbe.github.io",
      category: ["Web dev"]
    },
    {
      title: "Data privacy & anonymization - Project Cassiopee",
      description: "Assessed privacy risks in anonymized datasets through OSINT and re-identification case studies, and proposed data protection strategies. Project conducted at Telecom SudParis under the supervision of Maryline Laurent and Louis-Philippe Sondeck.",
      imageUrl: "/Data.png",
      githubUrl: "https://github.com/maxencedbe/Cassiopee",
      category: ["Data Science"]
    },
    {
      title: "Automated parking optimization",
      description: "Developed a Python-based optimization model for vehicle placement in multi-level automated parking systems. Designed and evaluated heuristic algorithms (A* search, simulated annealing) to minimize retrieval costs and improve system efficiency.",
      imageUrl: "/Parking.png",
      githubUrl: "https://github.com/maxencedbe/parking-optimization",
      category: ["Data Science"]
    }
  ],
  fr: [
    {
      title: "Hi! PARIS Hi!ckathon 2025 (finaliste)",
      description: "Classé 2ème sur plus de 80 équipes lors de l'édition 2025 du hackathon de Data Science Hi!Paris. Tâche : prédire les scores PISA des étudiants à partir de contextes socio-économiques complexes. Conception d'un modèle « Gated » (routeur composé de deux régresseurs XGBoost), atteignant un score R² de 0,79 sur le jeu de test final.",
      imageUrl: "/HiParis.png",
      githubUrl: "https://github.com/maxencedbe/hi_paris_2025",
      category: ["Machine Learning"]
    },
    {
      title: "Molecular graph captioning - Kaggle competition",
      description: "Développement d'une architecture basée sur la recherche d'information utilisant l'apprentissage contrastif pour aligner les embeddings de graphes moléculaires avec des descriptions en langage naturel dans un espace latent commun. Implémentation d'un encodeur Graph Neural Network dédié utilisant PyTorch Geometric, optimisé pour l'alignement sémantique via les métriques BERTScore et BLEU-4.",
      imageUrl: "/GraphMolecular.png",
      githubUrl: "https://github.com/maxencedbe/molecular_graph_captioning",
      category: ["Machine Learning"]
    },
    {
      title: "Classifieur de sécurité en streaming pour LLM – Capstone Project with DragonLLM",
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
      title: "Confidentialité des données & anonymisation - Projet Cassiopée",
      description: "Évaluation des risques de confidentialité dans des ensembles de données anonymisés via des études de cas OSINT et de ré-identification, et proposition de stratégies de protection des données. Projet mené à Télécom SudParis sous la supervision de Maryline Laurent et Louis-Philippe Sondeck.",
      imageUrl: "/Data.png",
      githubUrl: "https://github.com/maxencedbe/Cassiopee",
      category: ["Data Science"]
    },
    {
      title: "Optimisation automatisée de stationnement",
      description: "Développement d'un modèle d'optimisation en Python pour le placement de véhicules dans des systèmes de stationnement automatisés à plusieurs niveaux. Conception et évaluation d'algorithmes heuristiques (recherche A*, recuit simulé) pour minimiser les coûts de récupération et améliorer l'efficacité du système.",
      imageUrl: "/Parking.png",
      githubUrl: "https://github.com/maxencedbe/parking-optimization",
      category: ["Data Science"]
    }
  ]
};

const filterLabels = {
  en: { All: "All", "Machine Learning": "Machine Learning", "Data Science": "Data Science", "Web dev": "Web dev" },
  fr: { All: "Tout", "Machine Learning": "Machine Learning", "Data Science": "Data Science", "Web dev": "Développement web" }
};

const ui = {
  en: { showMore: "Show more projects", showLess: "Show less", noResults: "No projects found in this category." },
  fr: { showMore: "Voir plus de projets", showLess: "Voir moins", noResults: "Aucun projet trouvé dans cette catégorie." }
};

const FILTER_KEYS = ["All", "Machine Learning", "Data Science", "Web dev"];

export default function ProjectGrid() {
  const locale = useLocale();
  const [activeFilter, setActiveFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const containerRef = React.useRef(null);

  const projects = projectsData[locale] || projectsData.en;
  const labels = filterLabels[locale] || filterLabels.en;
  const t = ui[locale] || ui.en;

  const filteredProjects = useMemo(() => {
    if (activeFilter === "All") return projects;
    return projects.filter(project => project.category.includes(activeFilter));
  }, [activeFilter, projects]);

  React.useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
        else entry.target.classList.remove("is-visible");
      });
    }, { root: null, rootMargin: "0px 0px -150px 0px", threshold: 0.1 });
    const elements = containerRef.current.querySelectorAll("[class*='reveal-']");
    elements.forEach((el) => { el.classList.remove("is-visible"); observer.observe(el); });
    return () => observer.disconnect();
  }, [activeFilter]);

  const smoothScrollTo = (element, duration = 800, onComplete) => {
    const start = window.scrollY;
    const target = element.getBoundingClientRect().top + window.scrollY;
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

  const handleToggleExpand = () => {
    if (showAll) {
      const el = document.getElementById('projects');
      if (!el) return;
      const lenis = window.lenis;
      if (lenis) {
        lenis.scrollTo(el, { offset: 0, duration: 1.5, onComplete: () => setShowAll(false) });
      } else {
        smoothScrollTo(el, 1500, () => setShowAll(false));
      }
    } else {
      setShowAll(true);
    }
  };

  return (
    <div className="w-full" ref={containerRef}>
      <div className="flex flex-wrap justify-center gap-5 mb-12">
        {FILTER_KEYS.map((key, index) => (
          <div key={key} className="reveal-up" style={{ transitionDelay: `${index * 100}ms` }}>
            <button
              data-locale-fade
              onClick={() => setActiveFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium filter-btn inline-flex items-center justify-center transition-transform duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer transform-gpu antialiased ${activeFilter === key ? "active" : ""}`}
            >
              {labels[key]}
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center w-full max-w-6xl mx-auto">
        <div className="flex flex-col gap-8 md:gap-16 w-full items-center">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => {
              const isHiddenByDefault = activeFilter === "All" && index >= 3;
              if (isHiddenByDefault) return null;
              return (
                <motion.div
                  key={index + '-' + activeFilter}
                  initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  viewport={{ once: false, margin: "0px 0px -200px 0px" }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
                  className="flex flex-col items-center w-full"
                >
                  <ProjectCard
                    title={project.title}
                    description={project.description}
                    imageUrl={project.imageUrl}
                    githubUrl={project.githubUrl}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
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
              <div className="flex flex-col gap-8 md:gap-16 w-full items-center pt-8 md:pt-16 pb-4 md:pb-8">
                {filteredProjects.slice(3).map((project, index) => (
                  <motion.div
                    key={project.title}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "0px 0px -200px 0px" }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
                    className="flex flex-col items-center w-full"
                  >
                    <ProjectCard
                      title={project.title}
                      description={project.description}
                      imageUrl={project.imageUrl}
                      githubUrl={project.githubUrl}
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
          <div className={`${showAll ? "mt-8" : "mt-12 md:mt-16"} flex justify-center reveal-up`}>
            <button
              onClick={handleToggleExpand}
              className="px-8 py-3 rounded-full text-sm sm:text-base font-medium filter-btn inline-flex items-center justify-center transition-transform duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer transform-gpu antialiased"
            >
              <span data-locale-fade>{showAll ? t.showLess : t.showMore}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
