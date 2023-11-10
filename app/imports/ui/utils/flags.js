function inIframe() {
  try {
    // eslint-disable-next-line eqeqeq
    return window.self != window.parent;
  } catch (e) {
    return true;
  }
}

export const IS_FRAMED = inIframe() && window.name === 'lb_iframe-widget';
