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
  iframeContainer.setAttribute('src', ROOT_URL);

  // Create Container for Widget
  const widgetContainer = document.createElement('div');
  widgetContainer.setAttribute('class', 'lb_widget-container closed');

  // Insert Header and Iframe into container
  widgetContainer.append(widgetHeader);
  widgetContainer.append(iframeContainer);

  // ------------------ ROBOT WIDGET ------------------
  // Create open button with the robot
  const openButton = document.createElement('button');
  openButton.setAttribute('class', 'lb_widget closed');
  openButton.title = 'Accéder aux services réservés aux agents de l’Etat';
  openButton.innerHTML = `<img src="${ABSOLUTE_URL}images/logos/${THEME}/widget/${userLogged}.svg" />`;

  // create Styles
  const stylesBalise = document.createElement('style');
  stylesBalise.innerHTML = `${WIDGET_STYLE}`;

  // Get header and body from the page
  const target = document.body || document.querySelector('body');
  const head = document.head || document.querySelector('head');
  head.append(stylesBalise);

  // ------------------ INSERT WIDGET ------------------
  // insert root
  target.append(openButton);
  target.append(widgetContainer);

  // ------------------ FUNCTIONS WIDGET ------------------

  const openRizimo = () => {
    if (!dragged) {
      replaceOrAddClass(widgetContainer, 'closed', 'opened');
      iframeContainer.setAttribute('iframe-state', 'opened');
      replaceOrAddClass(openButton, 'closed', 'opened');
    }
    dragged = false;
  };
  const closeRizimo = () => {
    replaceOrAddClass(widgetContainer, 'opened', 'closed');
    iframeContainer.setAttribute('iframe-state', 'closed');
    replaceOrAddClass(openButton, 'opened', 'closed');
  };
  const toggleFullscreen = (state = null) => {
    if (state === true) {
      widgetContainer.classList.add('fullscreen');
    } else if (state === false) {
      widgetContainer.classList.remove('fullscreen');
    } else {
      widgetContainer.classList.toggle('fullscreen');
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

  const receiveMessage = (data) => {
    const { type, content } = data;
    if (type === 'notifications') {
      handleNotification(content);
    } else if (type === 'userLogged') {
      handleUserLogged(content);
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
      openButton.style.left = `${window.innerWidth - 85}px`;
    } else if (positionLeft < 0) {
      openButton.style.left = '10px';
    } else {
      openButton.style.left = `${positionLeft}px`;
    }

    if (positionTop > window.innerHeight - 85) {
      openButton.style.top = `${window.innerHeight - 85}px`;
    } else if (positionTop < 0) {
      openButton.style.top = '10px';
    } else {
      openButton.style.top = `${positionTop}px`;
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
    openButton.style.right = '10px';
    openButton.style.bottom = '10px';
    openButton.style.left = null;
    openButton.style.top = null;
  };

  openButton.onmousedown = function handleMouseDown(event) {
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

  openButton.ontouchstart = function handleTouchStart(event) {
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

  openButton.ondragstart = function handleDragStart() {
    dragged = true;
    return false;
  };

  openButton.ondrop = function handleDrop(e) {
    // Prevent default behavior (Prevent file from being opened)
    e.preventDefault();

    const files = [];

    if (e.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      [...e.dataTransfer.items].forEach((item) => {
        // If dropped items aren't files, reject them
        if (item.kind === 'file') {
          files.push(item.getAsFile());
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      [...e.dataTransfer.files].forEach((file) => {
        files.push(file);
      });
    }

    const iframeEvent = new CustomEvent('widget-drop', {
      files,
    });

    // console.log(iframeContainer, iframeEvent);
    iframeContainer.contentWindow.postMessage();
    // iframeContainer.contentWindow.dispatchEvent(iframeEvent);
    openRizimo();
    // toggleFullscreen(true);
  };

  openButton.ondragover = function handleDragOver(e) {
    // Prevent default behavior (Prevent file from being opened)
    e.preventDefault();
  };

  openButton.ondragenter = function handleDragEnter() {
    openButton.classList.add('dropping');
  };

  openButton.ondragleave = function handleDragLeave() {
    openButton.classList.remove('dropping');
  };
}
