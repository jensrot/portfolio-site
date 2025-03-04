//@ts-ignore
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import "./normalize.css";
import { App } from "./App";
import * as serviceWorker from "./serviceWorker.ts";

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
