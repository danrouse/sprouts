import React, { Component, PropTypes } from 'react';

export default class TreeNode extends Component {
  static propTypes = {
    name: PropTypes.string,
    body: PropTypes.string,
    childNodes: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func,
    selectedNode: PropTypes.number,
    ref: PropTypes.object,

    // SVG rendering props
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,

    // user config (tree-global spacing, etc.)
    options: PropTypes.shape({
      xPadding: PropTypes.number,
      yPadding: PropTypes.number,
      shallowCenterName: PropTypes.bool,
      showNameToBodyLines: PropTypes.bool,
      showNameToChildLines: PropTypes.bool,
      nameToBodyLineWidth: PropTypes.number,
      nameToBodyLineHeight: PropTypes.number,
      nameToChildLineWidth: PropTypes.number,
      nameToChildLineHeight: PropTypes.number,
      nameFontSize: PropTypes.number,
      nameFontFamily: PropTypes.string,
      nameFontColor: PropTypes.string,
      bodyFontSize: PropTypes.number,
      bodyFontFamily: PropTypes.string,
      bodyFontColor: PropTypes.string
    })
  };

  static defaultProps = {
    childNodes: []
  };

  static contextTypes = {
    selectedNode: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * Converts a <TreeNode /> and its children to a string, recursively.
   * 
   * @return {String} nodeString - Text representation of the TreeNode.
   */
  toString() {
    let buffer = '';
    if(this.props.body) {
      buffer += ` ${this.props.body}`
    } else if(this.props.childNodes.length > 0) {
      buffer += ' ';
      this.props.childNodes.forEach(child => {
        buffer += child.toString();
      });
    }
    return `[${this.props.name}${buffer}]`;
  }

  render() {
    const { index, name, body, width, height, x, y, childNodes, options } = this.props;

    let nameCenter = width / 2;
    if(options.shallowCenterName && childNodes.length > 0) {
      const left = childNodes[0].x + (childNodes[0].width / 2);
      const right = childNodes[childNodes.length - 1].x + (childNodes[childNodes.length - 1].width / 2);
      const dx = right - left;
      nameCenter = left + (dx / 2);
    }

    let bodyText, bodyLine;
    if(body) {
      bodyText = <text
        x={width / 2}
        y={options.nameFontSize + options.yPadding + options.nameToBodyLineHeight + options.bodyFontSize}
        fontFamily={options.bodyFontFamily}
        fontSize={options.bodyFontSize}
        fill={options.bodyFontColor}>
        {body}
      </text>;

      if(options.showNameToBodyLines) {
        bodyLine = <line
          x1={width / 2}
          x2={width / 2}
          y1={options.nameFontSize + options.yPadding}
          y2={options.nameFontSize + options.yPadding + options.nameToBodyLineHeight}
          stroke="#ff0000"
          strokeWidth={options.nameToBodyLineWidth} />;
      }
    }

    const children = childNodes.map(child => {
      return [
        <TreeNode {...child} options={options} />,
        <line
          x1={nameCenter}
          x2={child.x + (child.width / 2)}
          y1={options.nameFontSize + options.yPadding}
          y2={options.nameFontSize + options.yPadding + options.nameToChildLineHeight}
          stroke="#00ff00"
          strokeWidth={options.nameToChildLineWidth} />
      ];
    });

    return (
      <svg key={index}
        className={index === this.context.selectedNode.index ? 'selected' : ''}
        x={x}
        y={y}
        width={width}
        height={height}
        textAnchor="middle">

        <text
          x={nameCenter} y={options.nameFontSize}
          fontFamily={options.nameFontFamily}
          fontSize={options.nameFontSize}
          fill={index === this.context.selectedNode.index ? '#ffff00' : options.nameFontColor}>
          {name}
        </text>
        {bodyText}        
        {bodyLine}

        {children && <g>{children}</g>}
      </svg>
    );
  }
}
