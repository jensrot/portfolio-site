import React from 'react';
import { Link, useHistory } from 'react-router-dom';

import demosData from "../../data/demos.json";

import './demos-index.scss';

const DemosIndex: React.FC = () => {

    const history = useHistory();

    return (
        <div id="demos-index">
            <div className="demos-content">
                <a href='#' onClick={e => { e.preventDefault(); history.goBack(); }} className="demos-back-link">&#8592; Back</a>
                <h1>Demos (experiments)</h1>
                {demosData.map(section => {
                    const link = section.link;
                    const parts = link ? section.section.split(link.text) : [section.section];
                    return (
                        <div key={section.section} className="demo-section">
                            <p className="demos-subtitle">
                                {parts[0]}
                                {link && <a href={link.url} target="_blank" rel="noopener noreferrer">{link.text}</a>}
                                {parts[1]}
                            </p>
                            <ul className="demo-list">
                                {section.demos.map(demo => (
                                    <li key={demo.path}>
                                        <div className="demo-btn">
                                            <span className="demo-num">{demo.num}</span>
                                            <span className="demo-btn-title">
                                                <Link to={demo.path} className="demo-btn-link">{demo.title}</Link>
                                            </span>
                                            {demo.api && (
                                                demo.apiUrl
                                                    ? <a href={demo.apiUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="demo-api"
                                                        title={demo.desc}><code>{demo.api}</code></a>
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
