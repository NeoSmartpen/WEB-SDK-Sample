import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { StylesProvider } from '@mui/styles';
import App from './App';

const theme = createTheme();

ReactDOM.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <StylesProvider injectFirst>
        <App />
      </StylesProvider>
    </ThemeProvider>
  </BrowserRouter>,
  document.getElementById('root'),
);
