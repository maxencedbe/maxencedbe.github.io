import React, { useState, useMemo } from "react";
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
    const containerRef = React.useRef(null);

    const filteredProjects = useMemo(() => {
        if (activeFilter === "Tout") return projectsData;
        return projectsData.filter(project => project.category.includes(activeFilter));
    }, [activeFilter]);

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
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const elements = containerRef.current.querySelectorAll("[class*='animate-']");
        elements.forEach((el) => {
            el.classList.remove("is-visible"); // Reset to allow fade-in
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, [filteredProjects]);

    return (
        <div className="w-full" ref={containerRef}>
            {/* Filter Bar */}
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

            {/* Projects Grid/List */}
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
            </div>
        </div>
    );
}
