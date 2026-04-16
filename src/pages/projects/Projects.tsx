import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import cv from "../../assets/cv_16_04_2026.pdf";
import projectsData from "../../data/projects.json";

import "./projects.scss";
import EasterEgg from "../../components/EasterEgg";

interface Project {
  github_link: string;
  live_link: string;
  title: string;
  description: string;
  technologies: string[];
}

export const Projects: React.FC = () => {

  const [allProjects, setAllProjects] = useState<Array<Project>>(); // The original list of all projects
  const [projects, setProjects] = useState<Array<Project>>();
  const [filterKey, setFilterKey] = useState<number>(0); // Key to trigger re-animation

  useEffect(() => {
    setAllProjects(projectsData);
    setProjects(projectsData);
  }, [])

  const filterProjects = (tag: string) => {
    if (tag && allProjects) {
      const filteredProjectsBasedOnTag = allProjects.filter(project => project.technologies.includes(tag));
      setProjects(filteredProjectsBasedOnTag);
      setFilterKey(prev => prev + 1); // Increment key to trigger re-animation
    }
  }

  return (
    <div id="main">
      <EasterEgg />
      <div className="container">
        <div className="container__start" key={`buttons-${filterKey}`}>
          <Link className="btn" to="/" title="Visit home">
            <h2>Home</h2>
          </Link>
          <a
            className="btn"
            href={cv}
            target="_blank"
            rel="noopener noreferrer"
            title="See my curriculum vitae"
          >
            <h2>Curriculum vitae</h2>
          </a>
        </div>
        <h1 className="visually-hidden">Projects</h1>
        <div id="projects" className="cards-container">
          {projects?.map((project: Project, index: number) => (
            <div className="card" key={`${filterKey}-${index}`}>
              <div className="card__icons">
                <li className="icon">
                  <a
                    href={project.github_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Visit the Github repository"
                  >
                    <i className="fab fa-github"></i>
                  </a>
                </li>
                <li className="icon">
                  <a
                    href={project.live_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Visit the live version"
                  >
                    <i className="fas fa-external-link-alt"></i>
                  </a>
                </li>
              </div>
              <h1 className="card__title">{project.title}</h1>
              <p className="card__text">
                {project.description}
              </p>
              <div className="card__technologies-container">
                {project.technologies?.map((technology, index) => (
                  <button
                    key={index}
                    type="button"
                    className="technology"
                    title={`Show all projects with: ${technology}`}
                    aria-label={`Filter projects by ${technology}`}
                    onClick={() => filterProjects(technology)}>
                    {technology}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};