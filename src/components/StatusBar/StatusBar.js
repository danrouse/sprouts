import React, { Component, PropTypes } from 'react';
import styles from './StatusBar.scss';

export default class StatusBar extends Component {
  render() {
    return (
      <div className="StatusBar">{this.props.children}</div>
    );
  }
}

StatusBar.propTypes = {
  children: PropTypes.any
};
