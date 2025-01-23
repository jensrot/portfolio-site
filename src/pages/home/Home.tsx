import React, { useEffect } from "react";

import { Link } from "react-router-dom";

import "./home.scss";

export const Home: React.FC = () => {
  return (
    <div id="main">
      <div className="card-border">
        <div id="wrapper" className="card">
          <div className="main-title">
            <h1 data-aos="fade-down">Jens Rottiers</h1>
          </div>
          <div className="about-text">
            <p>
              I'm a junior software developer and Alumni of <br />
              <span>
                <a
                  href="https://www.arteveldehogeschool.be/opleidingen/bachelor/new-media-development-multimediaproductie"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  New Media Development 2019
                </a>
              </span>
              .
            </p>
          </div>
          <div className="buttons-container">
            <Link to="/projects">
              <button>Projects</button>
            </Link>
          </div>
          <div className="social-container">
            <ul className="social-icons">
              <li className="icon">
                <a
                  href="https://github.com/jensrott"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-github"></i>
                </a>
              </li>
              <li className="icon">
                <a
                  href="https://www.linkedin.com/in/jens-rottiers-44527b1b3"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-linkedin"></i>
                </a>
              </li>

              <li className="icon">
                <a
                  href="mailto:jens.rottiers@outlook.com"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-envelope"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};