import React, { Component, PropTypes } from 'react';

import TitleBar from '../TitleBar';
import ToolBar from '../ToolBar';
import IpaInput from 'react-ipa-input';
import OptionsMenu from '../OptionsMenu';
import TreeNode from '../TreeNode';
import StatusBar from '../StatusBar';
import Modal from 'react-modal';

import textToTree from '../../util/textToTree';
import keyCodes from '../../util/keyCodes';

import styles from './App.scss';

const TEST_STR = "[TP [T' [NP [AP foo * ref][N' [N bar]]]][VP [AP foo *ref] baz]]";
const modalStyle = {
  overlay: {
    zIndex: '3', top: '5em', bottom: '2em'
  },
  content: {
    top: '64px',
    right: '64px',
    left: '64px',
    bottom: 'auto',
    fontFamily: 'Roboto',
    boxShadow: '0 2px 8px #aaa'
  }
};

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
      showModal: '',
      showOptions: false,
      statusText: '',
    };
  }

  showModal(modalName) { this.setState({ showModal: modalName }); }

  hideModal() { this.setState({ showModal: '' }); }

  showOptions() { this.setState({ showOptions: !this.state.showOptions }); }

  hideOptions() { this.setState({ showOptions: false }); }

  setStatus(statusText) {
    this.setState({ statusText });
  }

  clearStatus() {
    this.setState({ statusText: '' });
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

  /**
   * Destroy the current tree and create an empty one
   * Resets most of the UI state
   */
  clearTree() {
    const rootNode = textToTree('[]', this.state.displayOptions);

    this.setState({
      rootNode: rootNode,
      selectedNode: rootNode,
      textInput: '[]',
      showModal: ''
    });
  }

  /**
   * Downloads the current tree as a PNG using Canvas.
   * @return void
   */
  saveTreeAsPNG() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const link = document.createElement('a');
    const svg = (new XMLSerializer).serializeToString(this.refs.tree.childNodes[0]);
    img.width = canvas.width = this.refs.tree.offsetWidth;
    img.height = canvas.height = this.refs.tree.offsetHeight;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      canvas.toDataURL('image/png')
      link.download = 'sprouts.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  /**
   * Downloads the current tree as SVG by exporting
   * the rendered contents of the root node.
   * @return void
   */
  saveTreeAsSVG() {
    const svg = new Blob([this.refs.tree.innerHTML], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(svg);
    link.download = 'sprouts.svg';
    link.onclick = () => {
      // destroy this URL object eventually
      setTimeout(() => { window.URL.revokeObjectURL(link.href) }, 10000);
    };

    link.click();
  }

  /**
   * Tree traversal methods
   */
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

  /**
   * Regenerates the tree when the input text is changed
   */
  onTextChange(nextText) {
    this.setState({
      textInput: nextText,
      rootNode: textToTree(nextText, this.state.displayOptions)
    });
  }

  /**
   * Regenerates the text value when the tree is changed manually
   */
  onTreeChange(nextTree) {
    const nextText = nextTree.toString();

    this.setState({
      textInput: nextText
    });
  }

  /**
   * Select a TreeNode when it's clicked
   */
  onNodeClicked(node, event) {
    this.setState({
      selectedNode: node
    });

    // This is bound to all TreeNodes, but is called by the target first
    event.stopPropagation();
  }

  /**
   * Bind keys to actions (keyboard controls)
   */
  onKeyDown(event) {
    // Don't steal input events from their real targets
    const nodeName = event.target.nodeName;
    if(nodeName === 'INPUT' || nodeName === 'TEXTAREA' || nodeName === 'SELECT') {
      return;
    }

    const key = keyCodes[event.keyCode] || String.fromCharCode(event.keyCode);
    switch(key) {
      // Keyboard tree traversal
      case 'UPARROW':
      case 'W':
        this.moveSelectionUp();
        break;
      case 'DOWNARROW':
      case 'S':
        this.moveSelectionDown();
        break;
      case 'LEFTARROW':
      case 'A':
        this.moveSelectionLeft();
        break;
      case 'RIGHTARROW':
      case 'D':
        this.moveSelectionRight();
        break;
    }
  }

  onKeyUp(event) {
  }

  /**
   * Set up global event listeners
   * @return {[type]} [description]
   */
  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  render() {

    return (
      <div className="App">
        <TitleBar>🍂 Sprouts - Syntax Tree Builder</TitleBar>
        <ToolBar items={[
          { text: '☰ Options',
            onClick: this.showOptions.bind(this),
            onMouseOver: this.setStatus.bind(this, 'Show the tree display options.'),
            onMouseOut: this.clearStatus.bind(this),
            isActive: this.state.showOptions },
          { text: '＋ New',
            onClick: this.showModal.bind(this, 'new'),
            onMouseOver: this.setStatus.bind(this, 'Clear the current tree and create a new one.'),
            onMouseOut: this.clearStatus.bind(this),
            isActive: this.state.showModal === 'new' },
          { text: '💾 Save',
            onClick: this.showModal.bind(this, 'save'),
            onMouseOver: this.setStatus.bind(this, 'Download this tree as a PNG or SVG file.'),
            onMouseOut: this.clearStatus.bind(this),
            isActive: this.state.showModal === 'save' },
          { text: '⛬ Share',
            onClick: this.showModal.bind(this, 'share'),
            onMouseOver: this.setStatus.bind(this, 'Share a link to this tree.'),
            onMouseOut: this.clearStatus.bind(this),
            isActive: this.state.showModal === 'share' },
          'divider',
          { text: 'New',
            onClick: this.clearTree.bind(this) },
          { text: 'New',
            onClick: this.clearTree.bind(this) },
          { text: 'New',
            onClick: this.clearTree.bind(this) },
          ]}/>
        <div className="App-inner">
          <OptionsMenu
            hidden={!this.state.showOptions}
            onChange={this.updateDisplayOption.bind(this)}
            options={this.state.displayOptions} />
          <div className={'App-main' + (this.state.showOptions ? ' withOptions' : '')}>
            <IpaInput value={this.state.textInput}
              showName={false}
              onChange={this.onTextChange.bind(this)} />
            <div className="App-tree" ref="tree">
              <TreeNode {...this.state.rootNode}
                options={this.state.displayOptions}
                onClick={this.onNodeClicked.bind(this)}
                onChange={this.onTreeChange.bind(this)} />
            </div>
          </div>
        </div>
        <StatusBar>{this.state.statusText}</StatusBar>

        <Modal isOpen={this.state.showModal === 'new'}
          style={modalStyle}
          onRequestClose={this.hideModal.bind(this)}>
          Starting a new tree will erase any unsaved changes. Are you sure you want to proceed?
          <div className="buttonGroup">
            <button onClick={this.clearTree.bind(this)}>Proceed</button>
            <button onClick={this.hideModal.bind(this)} className="cancel">Cancel</button>
          </div>
        </Modal>
        <Modal isOpen={this.state.showModal === 'save'}
          style={modalStyle}
          onRequestClose={this.hideModal.bind(this)}>
          <div className="buttonGroup">
            <button onClick={this.saveTreeAsPNG.bind(this)}>.PNG</button>
            <button onClick={this.saveTreeAsSVG.bind(this)}>.SVG</button>
          </div>
        </Modal>
        <Modal isOpen={this.state.showModal === 'share'}
          style={modalStyle}
          onRequestClose={this.hideModal.bind(this)}>
          <div className="buttonGroup">
            <button className="go">Permalink</button>
          </div>
        </Modal>
      </div>
    );
  }
}
