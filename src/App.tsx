import React from "react";

import { BrowserRouter } from "react-router-dom";
import Routing from "./routing/Routing";

import Particles from "./components/Particles";

import { createRandomNumberBetweenTwoValues } from "./utils/create-random-number-between-two-values";

export const App = () => {
  return (
    <React.Fragment>
      <BrowserRouter>
        <Particles className="particles-animation" quantity={createRandomNumberBetweenTwoValues(200, 800)} />
        <Routing />
      </BrowserRouter>
    </React.Fragment>
  );
};