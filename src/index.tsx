//@ts-ignore
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import "./normalize.css";
import { App } from "./App";
import { initAnalytics } from "./analytics/posthog";

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);

initAnalytics();
