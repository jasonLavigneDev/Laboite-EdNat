{
  // ------------------ METEOR CONSTANTS ------------------
  const ABSOLUTE_URL = `{{absoluteUrl}}`;
  const THEME = `{{theme}}`;
  const ROOT_URL = `{{rootUrl}}`;
  const WIDGET_STYLE = `{{style}}`;

  // ------------------ UTILS ------------------
  /**
   *
   * @param {HTMLElement} element
   * @param {string} oldToken
   * @param {string} newToken
   */
  const replaceOrAddClass = function replaceOrAddClass(element, oldToken, newToken) {
    if (!element.classList.replace(oldToken, newToken)) {
      element.classList.remove(oldToken);
      element.classList.add(newToken);
    }
  };

  // ------------------ VARIABLES WIDGET ------------------
  let notifications = 0;
  let userLogged = 'disconnected';
  let dragged = false;
  const touchduration = 200;
  let timer;
  let shiftX;
  let shiftY;

  // ------------------ HEADER WIDGET ------------------
  // Create Header
  const widgetHeader = document.createElement('div');
  widgetHeader.setAttribute('class', 'lb_widget-header');

  // create Logo
  const widgetLogo = document.createElement('img');
  widgetLogo.setAttribute('src', `${ABSOLUTE_URL}images/logos/${THEME}/widget/logo.svg`);

  // Create buttons container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.setAttribute('class', 'buttons-container');

  // Create Close Button
  const closeButton = document.createElement('button');
  closeButton.setAttribute('class', 'cross-stand-alone');
  closeButton.title = 'Accéder aux services réservés aux agents de l’Etat';

  // Create fullscreen Icon
  const fullscreenButton = document.createElement('button');
  fullscreenButton.setAttribute('class', 'full-screen');
  fullscreenButton.innerHTML = '⛶';
  fullscreenButton.title = 'Plein écran';

  // Insert logo and buttons into header
  buttonsContainer.append(fullscreenButton);
  buttonsContainer.append(closeButton);
  widgetHeader.append(widgetLogo);
  widgetHeader.append(buttonsContainer);

  // ------------------ CONTAINER WIDGET ------------------
  // Create Iframe
  const iframeName = 'lb-widget';
  const iframeContainer = document.createElement('iframe');
  iframeContainer.setAttribute('id', iframeName);
  iframeContainer.setAttribute('name', iframeName);
  iframeContainer.setAttribute('class', 'lb_iframe-widget');
  iframeContainer.setAttribute('iframe-state', 'closed');
  iframeContainer.setAttribute('name', 'lb_iframe-widget');
  iframeContainer.setAttribute('src', ROOT_URL);

  // Create Container for Widget
  const widgetContainer = document.createElement('div');
  widgetContainer.setAttribute('class', 'lb_widget-container');

  // Insert Header and Iframe into container
  widgetContainer.append(widgetHeader);
  widgetContainer.append(iframeContainer);

  // ------------------ ROBOT WIDGET ------------------
  // Create open button with the robot
  const openButton = document.createElement('button');
  openButton.setAttribute('class', 'lb_widget');
  openButton.title = 'Accéder aux services réservés aux agents de l’Etat';
  openButton.innerHTML = `<img src="${ABSOLUTE_URL}images/logos/${THEME}/widget/${userLogged}.svg" />`;

  // create Styles
  const stylesBalise = document.createElement('style');
  stylesBalise.innerHTML = `${WIDGET_STYLE}`;

  // Get header and body from the page
  const target = document.body || document.querySelector('body');
  const head = document.head || document.querySelector('head');
  head.append(stylesBalise);

  // ------------------- CONTAINER --------------------
  const container = document.createElement('div');
  container.setAttribute('class', 'lb_container closed');

  // ------------------ INSERT WIDGET ------------------
  // insert root
  container.appendChild(openButton);
  container.appendChild(widgetContainer);

  target.append(container);

  // ------------------ FUNCTIONS WIDGET ------------------

  const openRizimo = () => {
    if (!dragged) {
      replaceOrAddClass(container, 'closed', 'opened');
      iframeContainer.setAttribute('iframe-state', 'opened');
    }
    dragged = false;
  };
  const closeRizimo = () => {
    replaceOrAddClass(container, 'opened', 'closed');
    iframeContainer.setAttribute('iframe-state', 'closed');
  };
  const toggleFullscreen = (state = null) => {
    if (state === true) {
      container.classList.add('fullscreen');
    } else if (state === false) {
      container.classList.remove('fullscreen');
    } else {
      container.classList.toggle('fullscreen');
    }
  };

  const handleNotification = (content) => {
    notifications = content;
    if (notifications > 0) {
      openButton.innerHTML = `
    <img src="${ABSOLUTE_URL}images/logos/${THEME}/widget/notifications.svg" />
    <div class="notifications">
      ${notifications}
    </div>
    `;
    } else {
      openButton.innerHTML = `<img src="${ABSOLUTE_URL}images/logos/${THEME}/widget/${userLogged}.svg" />`;
    }
  };

  const handleUserLogged = (content) => {
    if (content) {
      userLogged = 'connected';
      openButton.innerHTML = `<img src="${ABSOLUTE_URL}images/logos/${THEME}/widget/connected.svg" />`;
    } else {
      openButton.innerHTML = `<img src="${ABSOLUTE_URL}images/logos/${THEME}/widget/disconnected.svg" />`;
      userLogged = 'disconnected';
    }
  };

  const messageCallback = (message, data) => {
    iframeContainer.contentWindow.postMessage({ type: 'callback', callback: message.data.callback, data }, '*');
  };

  const receiveMessage = (message) => {
    const { type, content } = message.data;

    switch (type) {
      case 'notifications':
        handleNotification(content);
        break;
      case 'userLogged':
        handleUserLogged(content);
        break;

      case 'isWiget':
        messageCallback(message, true);
        break;
      case 'isFullScreen':
        messageCallback(message, container.classList.contains('fullscreen'));
        break;
      case 'isOpened':
        messageCallback(message, container.classList.contains('opened'));
        break;
      case 'openWidget':
        openRizimo();
        messageCallback(message);
        break;
      case 'closeWidget':
        closeRizimo();
        messageCallback(message);
        break;
      case 'setFullScreen':
        toggleFullscreen(content);
        messageCallback(message);
        break;

      default:
        break;
    }
  };

  // ------------------ EVENTS LISTENERS WIDGET ------------------
  openButton.addEventListener('click', openRizimo);
  closeButton.addEventListener('click', closeRizimo);
  fullscreenButton.addEventListener('click', toggleFullscreen);
  window.addEventListener('message', receiveMessage, false);

  // ------------------ DRAGGABLE ROBOT ------------------

  const moveAt = (clientX, clientY) => {
    const positionLeft = clientX - shiftX;
    const positionTop = clientY - shiftY;

    if (positionLeft > window.innerWidth - 85) {
      container.style.left = `${window.innerWidth - 85}px`;
    } else if (positionLeft < 0) {
      container.style.left = '10px';
    } else {
      container.style.left = `${positionLeft}px`;
    }

    if (positionTop > window.innerHeight - 85) {
      container.style.top = `${window.innerHeight - 85}px`;
    } else if (positionTop < 0) {
      container.style.top = '10px';
    } else {
      container.style.top = `${positionTop}px`;
    }
  };

  const onMouseMove = (event) => {
    const contact = event.touches ? event.touches[0] : null;
    const ref = contact || event;
    if (dragged) {
      moveAt(ref.clientX, ref.clientY);
    }
  };

  const onlongpress = () => {
    dragged = true;
    openButton.classList.add('moving');
    document.addEventListener('touchmove', onMouseMove, false);
    document.addEventListener('mousemove', onMouseMove, false);
    if (timer) {
      clearTimeout(timer);
    }
  };

  window.onresize = () => {
    container.style.right = '10px';
    container.style.bottom = '10px';
    container.style.left = null;
    container.style.top = null;
  };

  container.onmousedown = function handleMouseDown(event) {
    shiftX = event.clientX - openButton.getBoundingClientRect().left;
    shiftY = event.clientY - openButton.getBoundingClientRect().top;

    timer = setTimeout(onlongpress, touchduration);

    // drop the openButton, remove unneeded handlers
    document.onmouseup = function handleMouseUp() {
      if (timer) {
        clearTimeout(timer);
      }
      openButton.classList.remove('moving');
      document.removeEventListener('mousemove', onMouseMove);
      document.onmouseup = null;
    };
  };

  container.ontouchstart = function handleTouchStart(event) {
    const touch = event.touches ? event.touches[0] : null;
    const ref = touch || event;
    shiftX = ref.clientX - openButton.getBoundingClientRect().left;
    shiftY = ref.clientY - openButton.getBoundingClientRect().top;

    timer = setTimeout(onlongpress, touchduration);

    // drop the openButton, remove unneeded handlers
    document.ontouchend = function handleTouchEnd() {
      if (timer) {
        clearTimeout(timer);
      }
      dragged = false;
      openButton.classList.remove('moving');
      document.removeEventListener('touchmove', onMouseMove);
      document.ontouchend = null;
    };
  };

  container.ondragstart = function handleDragStart() {
    dragged = true;
    return false;
  };

  container.ondragenter = function handleDragEnter() {
    openButton.classList.add('dropping');
    // iframeContainer.style.pointerEvents = 'all';
  };

  container.ondragleave = function handleDragLeave() {
    openButton.classList.remove('dropping');
    // iframeContainer.style.pointerEvents = 'none';
  };
}