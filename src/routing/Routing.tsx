import React, { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { track } from "../analytics/events";

import { Home } from "../pages/home/Home";
import { Projects } from "../pages/projects/Projects";
import DemosIndex from "../pages/demos/DemosIndex";
import WordCloud from "../pages/demos/word-cloud/WordCloud";
import FlowingParagraph from "../pages/demos/flowing-paragraph/FlowingParagraph";
import TypewriterStream from "../pages/demos/typewriter-stream/TypewriterStream";
import MultilangParticles from "../pages/demos/multilang/MultilangParticles";
import BalancedLabels from "../pages/demos/balanced-labels/BalancedLabels";

// Unknown paths bounce to home, which would otherwise hide broken inbound links
const NotFoundRedirect: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    track('route_not_found', { path: pathname });
  }, [pathname]);

  return <Navigate to="/" />;
};

const Routing: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/demos" element={<DemosIndex />} />
      <Route path="/demos/word-cloud" element={<WordCloud />} />
      <Route path="/demos/flowing-paragraph" element={<FlowingParagraph />} />
      <Route path="/demos/typewriter-stream" element={<TypewriterStream />} />
      <Route path="/demos/multilang" element={<MultilangParticles />} />
      <Route path="/demos/balanced-labels" element={<BalancedLabels />} />
      <Route path="*" element={<NotFoundRedirect />} />
    </Routes>
  );
};

export default Routing;
