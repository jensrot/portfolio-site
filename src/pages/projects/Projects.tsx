import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import cv from "../../assets/cv_27_07_2020.pdf";
import projectsData from "../../data/projects.json";

import "./projects.scss";

interface Project {
  github_link: string;
  live_link: string;
  title: string;
  description: string;
  technologies: string[];
}

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Array<Project>>();
  const [allProjects, setAllProjects] = useState<Array<Project>>(); // The original list of all projects

  useEffect(() => {
    setAllProjects(projectsData);
    setProjects(projectsData);
  }, [])

  const filterProjects = (tag: string) => {
    if (tag) {
      const filteredProjectsBasedOnTag = allProjects?.filter(project => project.technologies.includes(tag));
      setProjects(filteredProjectsBasedOnTag);
    }
  }

  return (
    <div id="main">
      <div className="container">
        <div className="container__start">
          <Link className="btn" to="/">
            <h1>Home</h1>
          </Link>
          <a
            className="btn"
            href={cv}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h1>Curriculum vitae</h1>
          </a>
        </div>
        <div id="projects" className="cards-container">
          {projects?.map((project, index) => (
            <div className="card" key={index}>
              <div className="card__icons">
                <li className="icon">
                  <a
                    href={project.github_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Visit the github repository"
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
                  <p
                    key={index}
                    className="technology"
                    title={`Show all project with: ${technology}`}
                    onClick={() => filterProjects(technology)}>
                    {technology}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};