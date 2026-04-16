import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

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
    <React.Fragment>
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
    </React.Fragment>
  );
};

export default Routing;
