import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { LanguageProvider } from "./context/LanguageContext/LanguageProvider.jsx";
import { ThemeProvider } from "./context/ThemeContext/ThemeProvider.jsx";
import { AuthProvider } from "./context/AuthContext/AuthProvider.jsx";
import { DataProvider } from "./context/DataContext/DataProvider.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <DataProvider>
              <App />
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
