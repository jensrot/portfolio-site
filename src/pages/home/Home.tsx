import React from "react";

import { Link } from "react-router-dom";
import Particles from "../../components/Particles";
import { createRandomNumberBetweenTwoValues } from "../../utils/create-random-number-between-two-values";

import "./home.scss";

export const Home: React.FC = () => {

  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const user = 'jens.rottiers';
    const domain = 'outlook.com';
    window.location.href = `mailto:${user}@${domain}`;
  };

  return (
    <div id="main">
      <div className="card-border">
        <div id="wrapper" className="card">
          <div className="main-title">
            <h1>Jens Rottiers</h1>
          </div>
          <div className="about-text">
            <p>
              I'm a test automation developer and Alumni of <br />
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
              <button>
                <Particles
                  className="button-particles"
                  quantity={createRandomNumberBetweenTwoValues(30, 70)}
                  staticity={30}
                />
                <span className="button-text">Projects</span>
              </button>
            </Link>
          </div>
          <div className="social-container">
            <ul className="social-icons">
              <li className="icon">
                <a
                  href="https://github.com/jensrott"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit my GitHub profile"
                  title="GitHub"
                >
                  <i className="fab fa-github" aria-hidden="true"></i>
                </a>
              </li>
              <li className="icon">
                <a
                  href="https://www.linkedin.com/in/jens-rottiers-44527b1b3"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit my LinkedIn profile"
                  title="LinkedIn"
                >
                  <i className="fab fa-linkedin" aria-hidden="true"></i>
                </a>
              </li>

              <li className="icon">
                <a
                  href="#"
                  onClick={handleEmailClick}
                  rel="noopener noreferrer"
                  aria-label="Send me an email"
                  title="Email"
                >
                  <i className="fas fa-envelope" aria-hidden="true"></i>
                </a>
              </li>
              <li className="icon">
                <a
                  href="https://x.com/RottiersJe72450"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit my X (Twitter) profile"
                  title="X (Twitter)"
                >
                  <i className="fab fa-x-twitter" aria-hidden="true"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};