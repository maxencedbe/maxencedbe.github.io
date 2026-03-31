import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectCard from "./ProjectCard.jsx";

const projectsData = [
    {
        title: "Hi! PARIS Hi!ckathon 2025 (2nd place)",
        description: "Ranked 2nd out of 80+ teams in the 2025 edition of the Hi!Paris data science hackathon. Task: Predicting student PISA scores from complex socio-economic backgrounds. Engineered a Gated Model (router composed of two XGBoost regressors), achieving an R² score of 0.79 on the final test set.",
        imageUrl: "/HiParis.png",
        githubUrl: "https://github.com/maxencedbe/hi_paris_2025",
        category: ["Machine Learning"]
    },
    {
        title: "Molecular graph captioning (active Kaggle competition)",
        description: "Development of a retrieval-based architecture using contrastive learning to align molecular graph embeddings with natural language descriptions in a joint latent space. Implementation of a dedicated graph neural network encoder using PyTorch Geometric, optimized for semantic alignment through BERTScore and BLEU-4 metrics.",
        imageUrl: "/GraphMolecular.png",
        githubUrl: "https://github.com/maxencedbe/molecular_graph_captioning",
        category: ["Deep Learning"]
    },
    {
        title: "DragonLLM - LLM toxicity & guardrails (upcoming, Jan 2026)",
        description: "Training a classifier designed to interrupt generation when the Language Model begins producing toxic or harmful content. Implementing Qwen3-Guardrails and circuit-breaker inspired architectures for real-time safety enforcement in a specialized AI model for the finance sector.",
        imageUrl: "/DragonLLM.png",
        githubUrl: "",
        category: ["Deep Learning"]
    },
    {
        title: "ScratchNet",
        description: "Reimplemented a Multi-Layer Perceptron (MLP) from scratch with NumPy.",
        imageUrl: "/Neural_network.png",
        githubUrl: "https://github.com/maxencedbe/scratchnet",
        category: ["Deep Learning"]
    },
    {
        title: "Personal portfolio website",
        description: "Developed and deployed a personal portfolio website using Astro.",
        imageUrl: "/Astro.png",
        githubUrl: "https://github.com/maxencedbe/maxencedbe.github.io",
        category: ["Web dev"]
    },
    {
        title: "Data privacy & anonymization — Project Cassiopee",
        description: "Assessed privacy risks in anonymized datasets through OSINT and re-identification case studies, and proposed data protection strategies. Project conducted at Telecom SudParis under the supervision of Maryline Laurent and Louis-Philippe Sondeck.",
        imageUrl: "/Data.png",
        githubUrl: "https://github.com/maxencedbe/Cassiopee",
        category: ["Machine Learning"]
    },
    {
        title: "Automated parking optimization",
        description: "Developed a Python-based optimization model for vehicle placement in multi-level automated parking systems. Designed and evaluated heuristic algorithms (A* search, simulated annealing) to minimize retrieval costs and improve system efficiency.",
        imageUrl: "/Parking.png",
        githubUrl: "https://github.com/maxencedbe/parking-optimization",
        category: ["Machine Learning"]
    }
];

const allCategories = ["All", ...Array.from(new Set(projectsData.flatMap(p => p.category)))];


const filters = ["All", "Deep Learning", "Machine Learning", "Web dev"];

export default function ProjectGrid() {
    const [activeFilter, setActiveFilter] = useState("All");
    const [showAll, setShowAll] = useState(false);
    const containerRef = React.useRef(null);

    const filteredProjects = useMemo(() => {
        if (activeFilter === "All") return projectsData;
        return projectsData.filter(project => project.category.includes(activeFilter));
    }, [activeFilter]);

    const displayedProjects = filteredProjects;

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

            el.classList.remove("is-visible");
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, [displayedProjects]);

    const handleToggleExpand = () => {
        if (showAll) {
            setShowAll(false);
            if (containerRef.current) {
                if (window.lenis) {
                    window.lenis.scrollTo(containerRef.current, { offset: -100, duration: 1.5 });
                } else {
                    const y = containerRef.current.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }
        } else {
            setShowAll(true);
        }
    };

    return (
        <div className="w-full" ref={containerRef}>

            <div className="flex flex-wrap justify-center gap-3 mb-12 reveal-up">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-full text-sm font-medium filter-btn ${activeFilter === filter ? "active" : ""}`}
                    >
                        {filter}
                    </button>
                ))}
            </div>


            <div className="flex flex-col items-center w-full max-w-6xl mx-auto">
                <div className="flex flex-col gap-8 md:gap-16 w-full items-center">
                    {/* Always visible ones */}
                    {displayedProjects.map((project, index) => {
                        const isHiddenByDefault = activeFilter === "All" && index >= 3;
                        if (isHiddenByDefault) return null;

                        return (
                            <div
                                key={project.title}
                                className="flex flex-col items-center w-full reveal-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <ProjectCard
                                    title={project.title}
                                    description={project.description}
                                    imageUrl={project.imageUrl}
                                    githubUrl={project.githubUrl}
                                />
                            </div>
                        );
                    })}
                </div>
                {/* Smooth Expandable Wrapper for items > 3 */}
                <AnimatePresence initial={false}>
                    {activeFilter === "All" && displayedProjects.length > 3 && showAll && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden flex flex-col items-center w-full"
                        >
                            <div className="flex flex-col gap-8 md:gap-16 w-full items-center pt-8 md:pt-16 pb-8 md:pb-16 px-4 md:px-8">
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
                    <p className="text-center text-gray-500 mt-10">No projects found in this category.</p>
                )}

                {/* Show More / Show Less Buttons */}
                {activeFilter === "All" && displayedProjects.length > 3 && (
                    <div className="mt-8 md:mt-12 flex justify-center reveal-fade">
                        <button 
                            onClick={handleToggleExpand} 
                            className="px-8 py-3 rounded-full text-sm sm:text-base font-medium filter-btn transition-colors duration-300"
                        >
                            {showAll ? 'Show less' : 'Show more projects'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
