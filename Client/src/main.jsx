import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './App.css';
import { AuthProvider } from './Contexts/AuthProvider';

const root = createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
      <AuthProvider>
        <App apiUrl={import.meta.env.REACT_APP_API_URL} />
      </AuthProvider>
    </BrowserRouter>
);
