import React, { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Home } from "../pages/home/Home";
import { Projects } from "../pages/projects/Projects";

const DemosIndex = lazy(() => import("../pages/demos/DemosIndex"));
const WordCloud = lazy(() => import("../pages/demos/word-cloud/WordCloud"));
const FlowingParagraph = lazy(() => import("../pages/demos/flowing-paragraph/FlowingParagraph"));
const TypewriterStream = lazy(() => import("../pages/demos/typewriter-stream/TypewriterStream"));
const MultilangParticles = lazy(() => import("../pages/demos/multilang/MultilangParticles"));
const BalancedLabels = lazy(() => import("../pages/demos/balanced-labels/BalancedLabels"));

const preloadRoutes = () => {
  import("../pages/demos/DemosIndex");
  import("../pages/demos/word-cloud/WordCloud");
  import("../pages/demos/flowing-paragraph/FlowingParagraph");
  import("../pages/demos/typewriter-stream/TypewriterStream");
  import("../pages/demos/multilang/MultilangParticles");
  import("../pages/demos/balanced-labels/BalancedLabels");
};

const Routing: React.FC = () => {
  useEffect(() => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(preloadRoutes);
    } else {
      setTimeout(preloadRoutes, 1000);
    }
  }, []);

  return (
    <Suspense fallback={null}>
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
    </Suspense>
  );
};

export default Routing;
