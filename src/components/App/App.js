import React, { Component, PropTypes } from 'react';

import TitleBar from '../TitleBar';
import ToolBar from '../ToolBar';
import IpaInput from 'react-ipa-input';
import OptionsMenu from '../OptionsMenu';
import TreeNode from '../TreeNode';
import StatusBar from '../StatusBar';

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
      xPadding: 12,
      yPadding: 6,
      shallowCenterName: true,
      showNameToBodyLines: true,
      showNameToChildLines: true,
      nameToBodyLineWidth: 1,
      nameToBodyLineHeight: 20,
      nameToBodyLineColor: '#000000',
      nameToChildLineWidth: 1,
      nameToChildLineHeight: 12,
      nameToChildLineColor: '#000000',
      nameFontSize: 20,
      nameFontFamily: 'Times New Roman',
      nameFontColor: '#000000',
      bodyFontSize: 16,
      bodyFontFamily: 'Times New Roman',
      bodyFontColor: '#000000'
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

  onNodeClicked(node, event) {
    this.setState({
      selectedNode: node
    });
    event.stopPropagation();
  }

  clearTree() {
    const rootNode = textToTree('[]', this.state.displayOptions);

    this.setState({
      rootNode: rootNode,
      selectedNode: rootNode,
      textInput: '[]'
    })
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  render() {

    return (
      <div className="App">
        <TitleBar>🍂 Sprouts - Syntax Tree Builder</TitleBar>
        <ToolBar items={[
          { text: '☰ Options', onClick: this.clearTree.bind(this) },
          { text: '＋ New', onClick: this.clearTree.bind(this) },
          { text: '💾 Save', onClick: this.clearTree.bind(this) },
          { text: '⛬ Share', onClick: this.clearTree.bind(this) },
          'divider',
          { text: 'New', onClick: this.clearTree.bind(this) },
          { text: 'New', onClick: this.clearTree.bind(this) },
          { text: 'New', onClick: this.clearTree.bind(this) },
          ]}/>
        <div className="App-inner">
          <OptionsMenu onChange={this.updateDisplayOption.bind(this)} options={this.state.displayOptions} />
          <div className="App-main">
            <IpaInput value={this.state.textInput}
              showName={false}
              onChange={this.onTextChange.bind(this)} />
            <div className="App-tree">
              <TreeNode {...this.state.rootNode}
                options={this.state.displayOptions}
                onClick={this.onNodeClicked.bind(this)}
                onChange={this.onTreeChange.bind(this)} />
            </div>
          </div>
        </div>
        <StatusBar>Selected node: {this.state.selectedNode.name}</StatusBar>
      </div>
    );
  }
}
