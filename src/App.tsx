import React from "react";

import { BrowserRouter } from "react-router-dom";
import Routing from "./routing/Routing";

import Particles from "./components/particles/Particles";
import DevTools from "./components/dev-tools/DevTools";

import { getRandomNumberBetweenTwoValues } from "./utils/random-number-between-two-values";

export const App = () => {
  return (
    <React.Fragment>
      <BrowserRouter>
        <Particles className="particles-animation" quantity={getRandomNumberBetweenTwoValues(200, 800)} />
        <Routing />
        {(import.meta.env.DEV || import.meta.env.VITE_TEST === 'true') && <DevTools />}
      </BrowserRouter>
    </React.Fragment>
  );
};