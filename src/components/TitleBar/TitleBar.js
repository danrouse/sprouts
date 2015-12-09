import React, { Component, PropTypes } from 'react';
import styles from './TitleBar.scss';

export default class TitleBar extends Component {
  render() {
    return (
      <div className="TitleBar">{this.props.children}</div>
    );
  }
}

TitleBar.propTypes = {
  children: PropTypes.any
};
