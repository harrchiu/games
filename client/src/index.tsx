import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './24game';
import AppRouter from './Router';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<AppRouter />);
