import React, { Component, PropTypes } from 'react';
import styles from './StatusBar.scss';

export default class StatusBar extends Component {
  render() {
    return (
      <div className="StatusBar">
        <div className="StatusBar-children">{this.props.children}</div>
        <p className="StatusBar-version"><a href="https://github.com/kremonte/sprouts">Sprouts ver. 2.0.0a</a></p>
      </div>
    );
  }
}

StatusBar.propTypes = {
  children: PropTypes.any
};
