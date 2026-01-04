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
          className="card-github"
        >
          <img src="/icons/github.svg" alt="GitHub" />
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