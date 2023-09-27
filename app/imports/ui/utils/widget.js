import { v4 } from 'uuid';

// eslint-disable-next-line eqeqeq
const isInWidgetIframe = window.parent != window && window.name === 'lb_iframe-widget';

const cb = new Map();

export function postMessage(data, callback) {
  const callbackId = v4();
  cb.set(callbackId, callback);

  window.parent.postMessage(
    {
      ...data,
      callback: callbackId,
    },
    '*',
  );
}

window.addEventListener('message', (e) => {
  if (e.data.type === 'callback') {
    const callbackId = e.data.callback;

    if (cb.has(callbackId)) {
      const callback = cb.get(callbackId);

      if (typeof callback === 'function') {
        callback(e.data.data);
      }

      cb.delete(callbackId);
    }
  }
});

export async function isWiget() {
  if (!isInWidgetIframe) return false;

  return new Promise((r) => {
    postMessage(
      {
        type: 'isWiget',
      },
      r,
    );
  });
}

async function verifyWidget() {
  const v = await isWiget();

  if (!v) throw new Error('The parent frame does not implement rizomo api');
}

export async function isFullScreen() {
  await verifyWidget();

  return new Promise((r) => {
    postMessage(
      {
        type: 'isFullScreen',
      },
      r,
    );
  });
}

export async function isOpened() {
  await verifyWidget();

  return new Promise((r) => {
    postMessage(
      {
        type: 'isOpened',
      },
      r,
    );
  });
}

export async function openWidget() {
  await verifyWidget();

  return new Promise((r) => {
    postMessage(
      {
        type: 'openWidget',
      },
      () => r(),
    );
  });
}
export async function closeWidget() {
  await verifyWidget();

  return new Promise((r) => {
    postMessage(
      {
        type: 'closeWidget',
      },
      () => r(),
    );
  });
}

/**
 *
 * @param {boolean} state
 */
export async function setFullScreen(state) {
  await verifyWidget();

  return new Promise((r) => {
    postMessage(
      {
        type: 'setFullScreen',
        content: state,
      },
      () => r(),
    );
  });
}
