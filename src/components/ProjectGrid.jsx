import React, { useState, useMemo } from "react";
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
    const containerRef = React.useRef(null);

    const filteredProjects = useMemo(() => {
        if (activeFilter === "All") return projectsData;
        return projectsData.filter(project => project.category.includes(activeFilter));
    }, [activeFilter]);

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
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);


        const elements = containerRef.current.querySelectorAll("[class*='animate-']");
        elements.forEach((el) => {

            el.classList.remove("is-visible");
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, [filteredProjects]);

    return (
        <div className="w-full" ref={containerRef}>

            <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-in-up">
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


            <div className="flex flex-col items-center w-full">
                {filteredProjects.map((project, index) => (
                    <div
                        key={project.title}
                        className={`flex flex-col items-center w-full animate-fade-in-up ${index === filteredProjects.length - 1 ? "mb-0" : "md:mb-16 mb-8"}`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <ProjectCard
                            title={project.title}
                            description={project.description}
                            imageUrl={project.imageUrl}
                            githubUrl={project.githubUrl}
                        />
                    </div>
                ))}
                {filteredProjects.length === 0 && (
                    <p className="text-center text-gray-500 mt-10">No projects found in this category.</p>
                )}
            </div>
        </div>
    );
}
