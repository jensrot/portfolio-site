import React, { Suspense, lazy } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import { Home } from "../pages/home/Home";
import { Projects } from "../pages/projects/Projects";

const DemosIndex        = lazy(() => import("../pages/demos/DemosIndex"));
const WordCloud         = lazy(() => import("../pages/demos/word-cloud/WordCloud"));
const FlowingParagraph  = lazy(() => import("../pages/demos/flowing-paragraph/FlowingParagraph"));
const TypewriterStream  = lazy(() => import("../pages/demos/typewriter-stream/TypewriterStream"));
const MultilangParticles = lazy(() => import("../pages/demos/multilang/MultilangParticles"));
const BalancedLabels    = lazy(() => import("../pages/demos/balanced-labels/BalancedLabels"));

const Routing: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/projects" component={Projects} />
<Route exact path="/demos" component={DemosIndex} />
        <Route exact path="/demos/word-cloud" component={WordCloud} />
        <Route exact path="/demos/flowing-paragraph" component={FlowingParagraph} />
        <Route exact path="/demos/typewriter-stream" component={TypewriterStream} />
        <Route exact path="/demos/multilang" component={MultilangParticles} />
        <Route exact path="/demos/balanced-labels" component={BalancedLabels} />
        <Redirect from="*" to="/" />
      </Switch>
    </Suspense>
  );
};

export default Routing;
