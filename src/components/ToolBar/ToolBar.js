import React, { Component, PropTypes } from 'react';
import styles from './ToolBar.scss';

export default class ToolBar extends Component {
  render() {
    return (
      <div className="ToolBar">
        {this.props.items.map((item, i) => {
          if(item === 'divider') {
            return <div key={i} className="ToolBar-divider" />;
          } else {
            return (
              <button key={i}
                className={item.isActive ? 'active' : ''}
                onClick={item.onClick}
                onMouseOver={item.onMouseOver}
                onMouseOut={item.onMouseOut}>
                {item.text}
              </button>
            );
          }
        })}
      </div>
    );
  }
}

ToolBar.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        onClick: PropTypes.func,
        onMouseOver: PropTypes.func,
        text: PropTypes.string,
      })
    ])
  ).isRequired
};
