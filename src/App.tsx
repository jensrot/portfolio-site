import React from "react";

import { BrowserRouter } from "react-router-dom";
import Routing from "./routing/Routing";

import Particles from "./components/Particles";

export const App = () => {
  return (
    <React.Fragment>
      <BrowserRouter>
        <Particles className="particles-animation" quantity={1000} />
        <Routing />
      </BrowserRouter>
    </React.Fragment>
  );
};