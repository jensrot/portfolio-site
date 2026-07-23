import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import demosData from "../../data/demos.json";

import { track } from "../../analytics/events";

import './demos-index.scss';

const DemosIndex: React.FC = () => {

    const navigate = useNavigate();

    return (
        <div id="demos-index">
            <div className="demos-content">
                <a href='#' onClick={e => { e.preventDefault(); navigate(-1); }} className="demos-back-link">&#8592; Back</a>
                <h1>Demos (experiments)</h1>
                {demosData.map(section => {
                    const link = section.link;
                    const parts = link ? section.section.split(link.text) : [section.section];
                    return (
                        <div key={section.section} className="demo-section">
                            <p className="demos-subtitle">
                                {parts[0]}
                                {link && <a href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => track('section_link_clicked', { url: link.url })}>{link.text}</a>}
                                {parts[1]}
                            </p>
                            <ul className="demo-list">
                                {section.demos.map(demo => (
                                    <li key={demo.path}>
                                        <div className="demo-btn">
                                            <span className="demo-num">{demo.num}</span>
                                            <span className="demo-btn-title">
                                                <Link to={demo.path}
                                                    className="demo-btn-link"
                                                    onClick={() => track('demo_opened', { demo: demo.title, path: demo.path, num: demo.num })}>{demo.title}</Link>
                                            </span>
                                            {demo.api && (
                                                // If an array of URLs is provided, split the API string and link each part separately. 
                                                // Otherwise, link the whole API string or just display it as text.
                                                Array.isArray(demo.apiUrl)
                                                    ? <span className="demo-api">
                                                        {demo.api.split(' + ').map((part, i) => (
                                                            <React.Fragment key={i}>
                                                                {i > 0 && ' + '}
                                                                <a href={(demo.apiUrl as string[])[i]}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    title={demo.desc}
                                                                    onClick={() => track('demo_api_link_clicked', { demo: demo.title, api: part, url: (demo.apiUrl as string[])[i] })}><code>{part}</code></a>
                                                            </React.Fragment>
                                                        ))}
                                                    </span>
                                                    : demo.apiUrl
                                                        ? <a href={demo.apiUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="demo-api"
                                                            title={demo.desc}
                                                            onClick={() => track('demo_api_link_clicked', { demo: demo.title, api: demo.api, url: demo.apiUrl })}><code>{demo.api}</code></a>
                                                        : <code className="demo-api">{demo.api}</code>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    )
};

export default DemosIndex;
