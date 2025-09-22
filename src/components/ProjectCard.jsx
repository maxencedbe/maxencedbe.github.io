import React from "react";
import "../styles/projectCard.scss";

export default function ProjectCard({ title, description, imageUrl }) {
  return (
    <div className="card">
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
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`tile tile-${i + 1}`}></div>
          ))}
        </div>
        <div className="line line-1"></div>
      </div>
    </div>
  );
}