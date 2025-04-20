import React from 'react';
import ReactDOM from 'react-dom/client';  // Cambia el import a "react-dom/client"

import App from './App';
import './App.css';  // Importa el archivo CSS global
// Usa ReactDOM.createRoot en lugar de ReactDOM.render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
