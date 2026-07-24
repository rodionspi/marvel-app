import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './components/app/App';

import './style/style.scss';

ReactDOM
    .createRoot(document.getElementById('root'))
    .render(
      <React.StrictMode>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </React.StrictMode>
    );
