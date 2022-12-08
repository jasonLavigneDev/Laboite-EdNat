{
  // ------------------ METEOR CONSTANTS ------------------
  const ABSOLUTE_URL = `{{absoluteUrl}}`;
  const THEME = `{{theme}}`;
  const ROOT_URL = `{{rootUrl}}`;
  const WIDGET_STYLE = `{{style}}`;

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
  const iframeContainer = document.createElement('iframe');
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
      widgetContainer.setAttribute('class', 'lb_widget-container opened');
      iframeContainer.setAttribute('iframe-state', 'opened');
      openButton.setAttribute('class', 'lb_widget opened');
    }
    dragged = false;
  };
  const closeRizimo = () => {
    widgetContainer.setAttribute('class', 'lb_widget-container closed');
    iframeContainer.setAttribute('iframe-state', 'closed');
    openButton.setAttribute('class', 'lb_widget closed');
  };
  const toggleFullscreen = () => {
    widgetContainer.classList.toggle('fullscreen');
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

  const receiveMessage = ({ data }) => {
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
    openButton.setAttribute('class', 'lb_widget closed moving');
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
      openButton.setAttribute('class', 'lb_widget closed');
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
      openButton.setAttribute('class', 'lb_widget closed');
      document.removeEventListener('touchmove', onMouseMove);
      document.ontouchend = null;
    };
  };

  openButton.ondragstart = function handleDragStart() {
    dragged = true;
    return false;
  };

  openButton.ondrop = function handleDrop(e) {
    console.log(e);
  };

  openButton.ondragover = function handleDragOver(e) {
    console.log(e);
  };
}
