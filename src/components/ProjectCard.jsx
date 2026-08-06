import React from "react";
import "../styles/projectCard.scss";

export default function ProjectCard({ title, description, imageUrl, githubUrl, viewCodeLabel }) {
  return (
    <div className="card">

      <div className="card-image">
        <img src={imageUrl} alt={title} />
      </div>


      <div className="card-content">
        <h4 data-locale-fade>{title}</h4>
        <p data-locale-fade>{description}</p>
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex sm:inline-flex items-center justify-center sm:justify-start gap-1.5 pl-0 sm:pl-[14px] text-sm font-semibold text-black dark:text-white hover:text-pink-400 dark:hover:text-pink-400 transition-colors duration-300"
          >
            <img src="/icons/github.svg" alt="" className="w-4 h-4 filter brightness-0 dark:invert" aria-hidden="true" />
            <span data-locale-fade>{viewCodeLabel}</span>
          </a>
        )}
      </div>


      <div className="shine"></div>

      <div className="background">
        <div className="line line-1"></div>
      </div>
    </div>
  );
}