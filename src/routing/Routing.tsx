import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import { Home } from "../pages/home/Home";
import { Projects } from "../pages/projects/Projects";

import Particles from "react-particles-js";
// @ts-ignore
import { settings } from "../data/particles-settings";

const Routing: React.FC = () => {
  return (
    <React.Fragment>
      <Particles style={{ position: 'absolute' }} params={settings[0]} />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/projects" component={Projects} />
        <Redirect from="*" to="/" />
      </Switch>
    </React.Fragment>
  );
};

export default Routing;
