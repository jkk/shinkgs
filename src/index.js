import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {isTouchDevice} from './util/dom';
import './index.css';
import 'font-awesome/css/font-awesome.css';

if (document.body) {
  // Hack to get Mobile Safari to show :active styling on tap
  document.body.ontouchstart = () => {};

  // Lets us style hovers only for non-touch
  document.body.classList.add(isTouchDevice() ? 'touch' : 'no-touch');
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
