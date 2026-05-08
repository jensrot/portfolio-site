import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Home } from "../pages/home/Home";
import { Projects } from "../pages/projects/Projects";
import DemosIndex from "../pages/demos/DemosIndex";
import WordCloud from "../pages/demos/word-cloud/WordCloud";
import FlowingParagraph from "../pages/demos/flowing-paragraph/FlowingParagraph";
import TypewriterStream from "../pages/demos/typewriter-stream/TypewriterStream";
import MultilangParticles from "../pages/demos/multilang/MultilangParticles";
import BalancedLabels from "../pages/demos/balanced-labels/BalancedLabels";

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
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default Routing;
