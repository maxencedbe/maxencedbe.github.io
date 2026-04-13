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
          className="absolute top-[12px] right-[12px] z-[3] flex items-center justify-center w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(255,255,255,0.05)] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] backdrop-blur-[20px] dark:backdrop-blur-[2px] transition-all duration-300 hover:scale-110 active:scale-95 hover:bg-black dark:hover:bg-white hover:border-black dark:hover:border-white group"
        >
          <img src="/icons/github.svg" alt="GitHub" className="w-[20px] h-[20px] filter brightness-0 dark:invert transition-all duration-300 group-hover:invert dark:group-hover:invert-0" />
        </a>
      )}


      <div className="card-image">
        <img src={imageUrl} alt={title} />
      </div>


      <div className="card-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>


      <div className="shine"></div>

      <div className="background">
        <div className="tiles">
          {[...Array(16)].map((_, i) => (
            <div key={i} className={`tile tile-${i + 1}`}></div>
          ))}
        </div>
        <div className="line line-1"></div>
      </div>

      <svg
        className="about-border"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <rect x="0" y="0" width="100%" height="100%" rx="15" ry="15" />
      </svg>
    </div>
  );
}