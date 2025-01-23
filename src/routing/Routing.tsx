import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import { Home } from "../pages/home/Home";
import { Projects } from "../pages/projects/Projects";

const Routing: React.FC = () => {
  return (
    <React.Fragment>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/projects" component={Projects} />
        <Redirect from="*" to="/" />
      </Switch>
    </React.Fragment>
  );
};

export default Routing;
