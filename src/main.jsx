import "./index.css";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { HashRouter } from "react-router";
import LanguageProvider from "./contexts/LanguageProvider.jsx";
import { ThemeProvider } from "./contexts/ThemeProvider.jsx";

createRoot(document.getElementById("root")).render(
  <LanguageProvider>
    <ThemeProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeProvider>
  </LanguageProvider>
);
