import React, { Component, PropTypes } from 'react';
import IpaInput from 'react-ipa-input';
import TreeNode from '../TreeNode';

import textToTree from '../../util/textToTree';
import keyCodes from '../../util/keyCodes';

import styles from './App.scss';

const TEST_STR = "[TP [T' [NP [AP foo * ref][N' [N bar]]]][VP [AP foo *ref] baz]]";

export default class App extends Component {
  static childContextTypes = {
    selectedNode: PropTypes.object.isRequired
  };

  getChildContext() {
    return {
      selectedNode: this.state.selectedNode
    };
  }

  constructor(props) {
    super(props);

    const displayOptions = {
      xPadding: 4,
      yPadding: 4,
      shallowCenterName: true,
      showNameToBodyLines: true,
      showNameToChildLines: true,
      nameToBodyLineWidth: 2,
      nameToBodyLineHeight: 10,
      nameToChildLineWidth: 2,
      nameToChildLineHeight: 5,
      nameFontSize: 16,
      nameFontFamily: 'Arial',
      nameFontColor: '#ff0000',
      bodyFontSize: 14,
      bodyFontFamily: 'Times New Roman',
      bodyFontColor: '#00ff00'
    };

    const rootNode = textToTree(TEST_STR, displayOptions);

    this.state = {
      textInput: TEST_STR,
      rootNode: rootNode,
      selectedNode: rootNode,
      displayOptions: displayOptions,
    };
  }

  updateDisplayOption(option, event) {
    let val = event.target.value;
    if(typeof this.state.displayOptions[option] === 'number') {
      val = parseInt(val);
    }

    const displayOptions = Object.assign({}, this.state.displayOptions, {
      [option]: val
    });
    this.setState({
      displayOptions,
      rootNode: textToTree(this.state.textInput, this.state.displayOptions)
    });
  }

  onTextChange(nextText) {
    this.setState({
      textInput: nextText,
      rootNode: textToTree(nextText, this.state.displayOptions)
    });
  }

  onTreeChange(nextTree) {
    const nextText = nextTree.toString();

    this.setState({
      textInput: nextText
    });
  }

  moveSelectionUp() {
    this.setState({
      selectedNode: this.state.selectedNode.parent || this.state.selectedNode
    });
  }

  moveSelectionDown() {
    this.setState({
      selectedNode: this.state.selectedNode.childNodes[0] || this.state.selectedNode
    });
  }

  moveSelectionLeft() {
    const selection = this.state.selectedNode;
    if(!selection.parent) { return; }
    const childIndex = selection.parent.childNodes.indexOf(selection);
    const nextChild = selection.parent.childNodes[Math.max(childIndex - 1, 0)];
    this.setState({
      selectedNode: nextChild
    });
  }

  moveSelectionRight() {
    const selection = this.state.selectedNode;
    if(!selection.parent) { return; }
    const childIndex = selection.parent.childNodes.indexOf(selection);
    const nextChild = selection.parent.childNodes[Math.min(childIndex + 1, selection.parent.childNodes.length - 1)];
    this.setState({
      selectedNode: nextChild
    });
  }


  onKeyDown(event) {
    const nodeName = event.target.nodeName;
    if(nodeName === 'INPUT' || nodeName === 'TEXTAREA' || nodeName === 'SELECT') {
      return;
    }

    const key = keyCodes[event.keyCode] || String.fromCharCode(event.keyCode);
    switch(key) {
      case 'UPARROW':
        this.moveSelectionUp();
        break;
      case 'DOWNARROW':
        this.moveSelectionDown();
        break;
      case 'LEFTARROW':
        this.moveSelectionLeft();
        break;
      case 'RIGHTARROW':
        this.moveSelectionRight();
        break;
    }
  }

  onKeyUp(event) {

  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  render() {

    return (
      <div className="app">
        <IpaInput value={this.state.textInput}
          onChange={this.onTextChange.bind(this)} />
        <TreeNode {...this.state.rootNode}
          options={this.state.displayOptions}
          onChange={this.onTreeChange.bind(this)} />

        <div>Selected node: {this.state.selectedNode.name}</div>
        <div>
          <div>
            <label htmlFor="xPadding">xPadding</label>
            <input type="range" onChange={this.updateDisplayOption.bind(this, 'xPadding')} value={this.state.xPadding} min="1" max="100" step="1" id="xPadding" />
          </div>
          <div>
            <label htmlFor="yPadding">yPadding</label>
            <input type="range" onChange={this.updateDisplayOption.bind(this, 'yPadding')} value={this.state.yPadding}  min="1" max="100" step="1" id="yPadding" />
          </div>
          <div>
            <label htmlFor="nameToBodyLineWidth">nameToBodyLineWidth</label>
            <input type="range" onChange={this.updateDisplayOption.bind(this, 'nameToBodyLineWidth')} value={this.state.nameToBodyLineWidth}  min="1" max="100" step="1" id="nameToBodyLineWidth" />
          </div>
          <div>
            <label htmlFor="nameToBodyLineHeight">nameToBodyLineHeight</label>
            <input type="range" onChange={this.updateDisplayOption.bind(this, 'nameToBodyLineHeight')} value={this.state.nameToBodyLineHeight}  min="1" max="100" step="1" id="nameToBodyLineHeight" />
          </div>
          <div>
            <label htmlFor="nameToChildLineWidth">nameToChildLineWidth</label>
            <input type="range" onChange={this.updateDisplayOption.bind(this, 'nameToChildLineWidth')} value={this.state.nameToChildLineWidth}  min="1" max="100" step="1" id="nameToChildLineWidth" />
          </div>
          <div>
            <label htmlFor="nameToChildLineHeight">nameToChildLineHeight</label>
            <input type="range" onChange={this.updateDisplayOption.bind(this, 'nameToChildLineHeight')} value={this.state.nameToChildLineHeight}  min="1" max="100" step="1" id="nameToChildLineHeight" />
          </div>
          <div>
            <label htmlFor="nameFontSize">nameFontSize</label>
            <input type="range" onChange={this.updateDisplayOption.bind(this, 'nameFontSize')} value={this.state.nameFontSize}  min="1" max="100" step="1" id="nameFontSize" />
          </div>
          <div>
            <label htmlFor="bodyFontSize">bodyFontSize</label>
            <input type="range" onChange={this.updateDisplayOption.bind(this, 'bodyFontSize')} value={this.state.bodyFontSize}  min="1" max="100" step="1" id="bodyFontSize" />
          </div>
        </div>
      </div>
    );
  }
}
