import React from 'react';
import ReactDOM from 'react-dom';
import Fastclick from 'fastclick';
import App from './App';
import {isTouchDevice} from './util/dom';
import './index.css';
import 'font-awesome/css/font-awesome.css';

if (document.body) {
  // Hack to get Mobile Safari to show :active styling on tap
  document.body.ontouchstart = () => {};

  // Lets us style hovers only for non-touch
  document.body.classList.add(isTouchDevice() ? 'touch' : 'no-touch');

  // Remove tap delay on iOS standalone
  if (window.navigator.standalone && /iPad|iPhone|iPod/.test(window.navigator.userAgent)) {
    Fastclick.attach(document.body);
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
