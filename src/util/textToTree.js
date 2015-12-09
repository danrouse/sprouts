import React from 'react';
import measureText from './measureText';

function parseToken(token) {
  const split = token.split(' ');
  const name = split.shift();
  let body = split.join(' ');
  let ref;
  const astIndex = body.lastIndexOf('*');
  if(astIndex !== -1) {
    ref = body.substr(astIndex + 1).trim();
    body = body.substr(0, astIndex).trim();
    console.log('ref', name, body);
  }
  return [ name, body, ref ];
}

let nodeIndex = 0;
export function setNodeMeasurements(node, options) {
  const measurements = {};

  // name and body
  const nameWidth = measureText(node.name, options.nameFontFamily, options.nameFontSize, options.nameFontWeight);
  const bodyWidth = measureText(node.body, options.bodyFontFamily, options.bodyFontSize, options.bodyFontWeight);
  const textWidth = Math.max(nameWidth, bodyWidth);
  let yOffset = node.name ? options.nameFontSize : 0;
  if(node.body) {
    yOffset += options.bodyFontSize + options.yPadding;
    if(options.showNameToBodyLines) {
      yOffset += options.nameToBodyLineHeight;
    }
  }

  let childrenWidth = 0;
  let childrenTextWidth = 0;
  let childrenHeight = 0;
  if(node.childNodes.length) {
    if(options.showNameToChildLines) {
      yOffset += options.nameToChildLineHeight;
    }
    yOffset += options.yPadding;
  }
  node.childNodes.forEach((child, i) => {
    setNodeMeasurements(child, options);
    child.x = childrenWidth;
    child.y = yOffset;
    childrenWidth += child.width + options.xPadding;
    childrenTextWidth += child.measurements.textWidth + options.xPadding;
    childrenHeight = Math.max(childrenHeight, child.height);
  });
  childrenWidth -= options.xPadding; // remove padding from last elem
  childrenTextWidth -= options.xPadding;

  const totalWidth = Math.max(textWidth, childrenWidth);
  if(totalWidth > childrenWidth) {
    // move each child forward to center it under the (gigantic) parent
    const xOffset = (textWidth - childrenWidth) / 2;
    node.childNodes.forEach((child) => {
      child.x += xOffset;
    });
  }

  const totalHeight = yOffset + childrenHeight;

  node.index = nodeIndex++;
  node.width = totalWidth;
  node.height = totalHeight;
  node.measurements = {
    nameWidth,
    bodyWidth,
    textWidth,
    childrenWidth,
    childrenTextWidth,
    childrenHeight
  };
};

/**
 * Parses text into a tree
 * Uses conventional bracketed-text syntax;
 * e.g. [Parent [Child][Sibling]]
 * Supplies nodes with the props:
 * name, body, x, y, width, height, innerWidth, childNodes
 * 
 * @param  {String} text Input text
 * @param  {Object} options Display options for the tree. See `TreeNode.props.options`
 * @return {Object} rootNode  Root node of parsed tree
 */
export default function textToTree(text, options) {
  const rootNode = { childNodes: [] };
  const refs = {};
  let curNode = rootNode;
  let curToken = '';
  nodeIndex = 0;

  // step through the string character by character
  for(let i = 0; i < text.length; i++) {
    const chr = text.charAt(i);
    if(chr === '[') {
      // at an open bracket, make a new node and move to it
      // save buffered text
      const token = curToken.trim();
      if(token) {
        const [ name, body, ref ] = parseToken(token);
        if(ref) {
          if(refs.hasOwnProperty(ref)) {
            curNode.nodeRef = refs[ref];
            refs[ref].nodeRef = curNode;
          } else {
            refs[ref] = curNode;
          }
        }
        curNode.name = name;
        curNode.body = body;
        curToken = '';
      }
      const newNode = {
        parent: curNode,
        childNodes: []
      };
      curNode.childNodes.push(newNode);
      curNode = newNode;
    } else if(chr === ']') {
      // close bracket, move up the tree to current parent
      // save buffered text
      const token = curToken.trim();
      if(token) {
        const [ name, body, ref ] = parseToken(token);
        if(ref) {
          if(refs.hasOwnProperty(ref)) {
            curNode.nodeRef = refs[ref];
            refs[ref].nodeRef = curNode; // ref ref?
          } else {
            refs[ref] = curNode;
          }
        }
        curNode.name = name;
        curNode.body = body;
        curToken = '';
      }
      curNode = curNode.parent;
    } else {
      // add to buffer if not a bracket (spaces get trimmed)
      curToken += chr;
    }
  }

  console.log('refs', refs, rootNode);

  setNodeMeasurements(rootNode, options);

  if(rootNode.name) {
    return rootNode;
  } else {
    const newRoot = rootNode.childNodes[0];
    delete newRoot.parent;
    return newRoot;
  }
}