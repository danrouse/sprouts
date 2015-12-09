import React, { Component, PropTypes } from 'react';
import styles from './OptionsMenu.scss';

export default class OptionsMenu extends Component {
  render() {
    return (
      <div className={'OptionsMenu' + (this.props.hidden ? ' hidden' : '')}>
        {Object.keys(this.props.options).map(option => {
          const value = this.props.options[option];
          return (
            <div key={option}>
              <label htmlFor={option}>{option}</label>
              <input type="range" onChange={this.props.onChange.bind(null, option)} value={value} min="1" max="100" />
            </div>
          );
        })}
      </div>
    );
  }
}

OptionsMenu.propTypes = {
  onChange: PropTypes.func,
  options: PropTypes.object,
  hidden: PropTypes.bool
}