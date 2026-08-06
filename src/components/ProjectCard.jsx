import React from "react";
import "../styles/projectCard.scss";

export default function ProjectCard({ title, description, imageUrl, githubUrl }) {
  return (
    <div className="card">

      {githubUrl && (
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-[12px] right-[12px] z-[3] flex items-center justify-center w-[36px] h-[36px] transition-opacity duration-300 opacity-60 hover:opacity-100"
        >
          <img src="/icons/github.svg" alt="GitHub" className="w-[20px] h-[20px] filter brightness-0 dark:invert" />
        </a>
      )}


      <div className="card-image">
        <img src={imageUrl} alt={title} />
      </div>


      <div className="card-content">
        <h4 data-locale-fade>{title}</h4>
        <p data-locale-fade>{description}</p>
      </div>


      <div className="shine"></div>

      <div className="background">
        <div className="line line-1"></div>
      </div>
    </div>
  );
}