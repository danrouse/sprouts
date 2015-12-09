const textCache = {};
let canvas, ctx;

/**
 * Measures text of a specific font, returning a cached result if possible.
 * Only accurate for text widths, not heights.
 * Uses an injected element, can only run in the DOM (not on server.)
 * 
 * @param  {String} text       Text to measure
 * @param  {String} fontFamily Font family
 * @param  {Number} fontSize   Font size in pixels
 * @param  {String} fontWeight Font weight style
 * @return {Number} width      Text width measurement
 */

export default function measureText(text, fontFamily, fontSize, fontWeight = 'normal') {
  if(!text) { return 0; }
  if(!canvas) {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
  }

  const cacheKey = text + fontFamily + fontSize + fontWeight;
  if(textCache.hasOwnProperty(cacheKey)) {
    return textCache[cacheKey];
  } else {
    ctx.font = `${fontSize}px ${fontWeight} ${fontFamily}`;
    const metrics = ctx.measureText(text).width;
    textCache[cacheKey] = metrics;
    return metrics;
  }
}