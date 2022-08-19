import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
/* import store from './redux/store'; */
import { BrowserRouter } from 'react-router-dom';
import './css/style.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
      <App />
  </BrowserRouter>
);
    {/* <Provider store={store}> */}