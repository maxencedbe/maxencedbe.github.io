import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectCard from "./ProjectCard.jsx";

const projectsData = [
    {
        title: "Hi! PARIS Hi!ckathon 2025 (2ème place)",
        description: "Classé 2ème sur plus de 80 équipes lors de l'édition 2025 du hackathon de data science Hi!Paris. Tâche : prédire les scores PISA des étudiants à partir de contextes socio-économiques complexes. Conception d'un modèle 'Gated' (routeur composé de deux régresseurs XGBoost), atteignant un score R² de 0.79 sur le jeu de test final.",
        imageUrl: "/HiParis.png",
        githubUrl: "https://github.com/maxencedbe/hi_paris_2025",
        category: ["Machine Learning"]
    },
    {
        title: "Molecular graph captioning (Compétition Kaggle en cours)",
        description: "Développement d'une architecture basée sur la recherche d'information utilisant l'apprentissage contrastif pour aligner les embeddings de graphes moléculaires avec des descriptions en langage naturel dans un espace latent commun. Implémentation d'un encodeur de réseau de neurones graphiques dédié utilisant PyTorch Geometric, optimisé pour l'alignement sémantique via les métriques BERTScore et BLEU-4.",
        imageUrl: "/GraphMolecular.png",
        githubUrl: "https://github.com/maxencedbe/molecular_graph_captioning",
        category: ["Deep Learning"]
    },
    {
        title: "DragonLLM – LLM toxicity & guardrails (À venir, janv. 2026)",
        description: "Entraînement d'un classifieur conçu pour interrompre la génération lorsque le modèle de langage commence à produire du contenu toxique ou nuisible. Implémentation de Qwen3-Guardrails et d'architectures inspirées des coupe-circuits pour l'application de la sécurité en temps réel dans un modèle d'IA spécialisé pour le secteur financier.",
        imageUrl: "/DragonLLM.png",
        githubUrl: "",
        category: ["Deep Learning"]
    },
    {
        title: "ScratchNet",
        description: "Réimplémentation d'un Perceptron Multi-Couches (MLP) à partir de zéro avec NumPy.",
        imageUrl: "/Neural_network.png",
        githubUrl: "https://github.com/maxencedbe/scratchnet",
        category: ["Deep Learning"]
    },
    {
        title: "Site web portfolio personnel",
        description: "Développement et déploiement d'un site web portfolio personnel utilisant Astro.",
        imageUrl: "/Astro.png",
        githubUrl: "https://github.com/maxencedbe/maxencedbe.github.io",
        category: ["Développement web"]
    },
    {
        title: "Confidentialité des données & anonymisation — Projet Cassiopée",
        description: "Évaluation des risques de confidentialité dans des ensembles de données anonymisés via des études de cas OSINT et de ré-identification, et proposition de stratégies de protection des données. Projet mené à Télécom SudParis sous la supervision de Maryline Laurent et Louis-Philippe Sondeck.",
        imageUrl: "/Data.png",
        githubUrl: "https://github.com/maxencedbe/Cassiopee",
        category: ["Machine Learning"]
    },
    {
        title: "Optimisation automatisée de stationnement",
        description: "Développement d'un modèle d'optimisation en Python pour le placement de véhicules dans des systèmes de stationnement automatisés à plusieurs niveaux. Conception et évaluation d'algorithmes heuristiques (recherche A*, recuit simulé) pour minimiser les coûts de récupération et améliorer l'efficacité du système.",
        imageUrl: "/Parking.png",
        githubUrl: "https://github.com/maxencedbe/parking-optimization",
        category: ["Machine Learning"]
    }
];

const filters = ["Tout", "Deep Learning", "Machine Learning", "Développement web"];

export default function ProjectGridFr() {
    const [activeFilter, setActiveFilter] = useState("Tout");
    const [showAll, setShowAll] = useState(false);
    const containerRef = React.useRef(null);

    const filteredProjects = useMemo(() => {
        if (activeFilter === "Tout") return projectsData;
        return projectsData.filter(project => project.category.includes(activeFilter));
    }, [activeFilter]);

    const displayedProjects = filteredProjects;

    // Re-run animation observer when items change
    React.useEffect(() => {
        if (typeof window === "undefined" || !containerRef.current) return;

        const observerOptions = {
            root: null,
            rootMargin: "0px 0px -50px 0px",
            threshold: 0.1,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                } else {
                    entry.target.classList.remove("is-visible");
                }
            });
        }, observerOptions);

        const elements = containerRef.current.querySelectorAll("[class*='reveal-']");
        elements.forEach((el) => {
            el.classList.remove("is-visible"); // Reset to allow fade-in
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, [displayedProjects]);

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
            if (progress < 1) {
                requestAnimationFrame(step);
            } else if (onComplete) {
                onComplete();
            }
        };

        requestAnimationFrame(step);
    };

    const handleToggleExpand = () => {
        if (showAll) {
            const el = document.getElementById('projects');
            if (el) {
                smoothScrollTo(el, 800, () => setShowAll(false));
            }
        } else {
            setShowAll(true);
        }
    };

    return (
        <div className="w-full" ref={containerRef}>
            {/* Filter Bar */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
                {filters.map((filter, index) => (
                    <div key={filter} className="reveal-up" style={{ transitionDelay: `${index * 100}ms` }}>
                        <button
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-full text-sm font-medium filter-btn inline-flex items-center justify-center transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer transform-gpu antialiased ${activeFilter === filter ? "active" : ""}`}
                        >
                            {filter}
                        </button>
                    </div>
                ))}
            </div>

            {/* Projects Grid/List */}
            <div className="flex flex-col items-center w-full max-w-6xl mx-auto">
                <div className="flex flex-col gap-8 md:gap-16 w-full items-center">
                    {/* Always visible ones */}
                    <AnimatePresence mode="popLayout">
                        {displayedProjects.map((project, index) => {
                            const isHiddenByDefault = activeFilter === "Tous" && index >= 3;
                            if (isHiddenByDefault) return null;

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    key={project.title}
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
                {/* Smooth Expandable Wrapper for items > 3 */}
                <AnimatePresence initial={false}>
                    {activeFilter === "Tous" && displayedProjects.length > 3 && showAll && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden flex flex-col items-center w-[calc(100%+60px)] px-[30px]"
                        >
                            <div className="flex flex-col gap-8 md:gap-16 w-full items-center pt-8 md:pt-16 pb-8 md:pb-12">
                                {displayedProjects.slice(3).map((project, index) => (
                                    <div
                                        key={project.title}
                                        className="flex flex-col items-center w-full"
                                    >
                                        <ProjectCard
                                            title={project.title}
                                            description={project.description}
                                            imageUrl={project.imageUrl}
                                            githubUrl={project.githubUrl}
                                        />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {displayedProjects.length === 0 && (
                    <p className="text-center text-gray-500 mt-10">Aucun projet trouvé dans cette catégorie.</p>
                )}

                {/* Show More / Show Less Buttons */}
                {activeFilter === "Tous" && displayedProjects.length > 3 && (
                    <div className="mt-8 md:mt-12 flex justify-center reveal-fade">
                        <button 
                            onClick={handleToggleExpand} 
                            className="px-8 py-3 rounded-full text-sm sm:text-base font-medium filter-btn inline-flex items-center justify-center transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer transform-gpu antialiased"
                        >
                            {showAll ? 'Voir moins' : 'Voir plus de projets'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
