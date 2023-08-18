{
  // ------------------ METEOR CONSTANTS ------------------
  const ABSOLUTE_URL = `{{absoluteUrl}}`;
  const THEME = `{{theme}}`;
  const ROOT_URL = `{{rootUrl}}`;
  const CHATBOT_URL = `{{chatbotUrl}}`;
  const WIDGET_STYLE = `{{style}}`;

  // ------------------ CONFIG ------------------
  /**
   * @enum {string}
   */
  const TABS = {
    RIZOMO: 'rizomo',
    CHATBOT: 'chatbot',
  };

  const IFRAME_ID = 'lb-widget';
  const CHATBOT_IFRAME_ID = 'lb-widget';

  const createIframe = function createIframe(name, src) {
    // Create Iframe
    const iframeContainer = document.createElement('iframe');
    iframeContainer.setAttribute('id', name);
    iframeContainer.setAttribute('name', name);
    iframeContainer.setAttribute('class', 'lb_iframe-widget');
    iframeContainer.setAttribute('iframe-state', 'lb_closed');
    iframeContainer.setAttribute('name', 'lb_iframe-widget');
    iframeContainer.setAttribute('src', src);
    iframeContainer.setAttribute('frameborder', '0');
    return iframeContainer;
  };

  /**
   * @type {{ key: TABS; children?: Element | Element[] | () => (Element | Element[]); attributes: { [attribute: string]: string; }; render?: Element | Element[] | () => (Element | Element[]);  }[]}
   */
  const TABS_CONFIG = [
    {
      key: TABS.RIZOMO,
      children: () => {
        const widgetLogo = document.createElement('img');
        widgetLogo.setAttribute('src', `${ABSOLUTE_URL}images/logos/${THEME}/widget/logo.svg`);
        widgetLogo.style.borderRadius = '4px';

        return widgetLogo;
      },
      render() {
        return createIframe(IFRAME_ID, ROOT_URL);
      },
    },
    {
      key: TABS.CHATBOT,
      children: () => {
        const chatIcon = document.createElement('div');
        chatIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
        `;

        return chatIcon.firstElementChild;
      },
      render() {
        const iframe = createIframe(CHATBOT_IFRAME_ID, CHATBOT_URL);
        iframe.setAttribute('allow', 'autoplay');

        return iframe;
      },
    },
  ];

  // ------------------ UTILS ------------------

  const getIframe = function getIframe() {
    return document.getElementById(IFRAME_ID);
  };

  /**
   * @param {Element | Element[] | () => (Element | Element[])} children
   *
   * @returns {Element[]}
   */
  const renderChildren = function renderChildren(children) {
    if (!children) {
      return [];
    }

    if (typeof children === 'function') {
      return renderChildren(children());
    }
    if (!Array.isArray(children)) {
      return [children];
    }

    return children;
  };

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

  // ------------------ TAB VARIABLES ------------------
  let currentTab = TABS.RIZOMO;

  const tabChildrenContainer = document.createElement('div');
  tabChildrenContainer.setAttribute('class', 'lb_widget-tab-container');

  // ------------------ HEADER WIDGET ------------------
  // Create Header
  const widgetHeader = document.createElement('div');
  widgetHeader.setAttribute('class', 'lb_widget-header');

  const tabsHeaderContainer = document.createElement('div');
  tabsHeaderContainer.setAttribute('class', 'lb_widget-header-tabs');

  TABS_CONFIG.forEach(({ key, children, attributes }) => {
    const tabEl = document.createElement('button');

    if (attributes) {
      Object.entries(attributes).forEach(([attrKey, attrValue]) => {
        tabEl.setAttribute(attrKey, attrValue);
      });
    }

    tabEl.setAttribute('data-tab', key);
    if (key === currentTab) {
      tabEl.setAttribute('data-active', 'true');
    }

    if (children) {
      renderChildren(children).forEach((element) => {
        tabEl.append(element);
      });
    }

    tabEl.classList.add('lb_widget-header-tabs--tab');
    tabsHeaderContainer.append(tabEl);
  });

  const getTabRender = function getTabRender(key) {
    return tabChildrenContainer.querySelector(`:scope > .lb_container_tab[data-tab="${key}"]`);
  };
  const renderTab = function renderTab(key) {
    let renderEl = getTabRender(key);

    if (!renderEl) {
      renderEl = document.createElement('div');
      renderEl.setAttribute('data-tab', key);
      renderEl.setAttribute('class', 'lb_container_tab');

      const tab = TABS_CONFIG.find((t) => t.key === key);

      if (!tab) {
        console.warn('Tab config not found.');
      }

      const rendered = renderChildren(tab.render);
      rendered.forEach((renderedEl) => {
        renderEl.append(renderedEl);
      });

      tabChildrenContainer.append(renderEl);
    }

    return renderEl;
  };

  tabsHeaderContainer.addEventListener('click', (e) => {
    const tabEl = /** @type {HTMLElement} */ (e.target).closest('.lb_widget-header-tabs--tab');

    if (!tabEl) {
      console.error('Tab not found');
      return;
    }

    const tabKey = tabEl.getAttribute('data-tab');

    if (!tabKey) {
      console.error('Tab key empty');
      return;
    }

    if (currentTab === tabKey) {
      return;
    }

    // Edit the active tab in the header
    tabEl.setAttribute('data-active', 'true');
    const oldTabEl = /** @type {HTMLElement} */ (e.currentTarget).querySelector(`[data-tab=${currentTab}]`);
    oldTabEl.setAttribute('data-active', 'false');

    // Edit the active tab in the main fram
    renderTab(tabKey).setAttribute('data-active', 'true');
    getTabRender(currentTab).setAttribute('data-active', 'false');

    currentTab = tabKey;
  });

  // Create buttons container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.setAttribute('class', 'lb_buttons-container');

  // Create Close Button
  const closeButton = document.createElement('button');
  closeButton.setAttribute('class', 'lb_close-btn');
  closeButton.title = 'Accéder aux services réservés aux agents de l’Etat';

  // Create Close Icon
  const closeIcon = document.createElement('div');
  closeIcon.setAttribute('class', 'lb_cross-stand-alone');

  // Create fullscreen Icon
  const fullscreenButton = document.createElement('button');
  fullscreenButton.setAttribute('class', 'lb_fullscreen-btn');
  fullscreenButton.innerHTML = '⛶';
  fullscreenButton.title = 'Plein écran';

  // Insert logo and buttons into header
  buttonsContainer.append(fullscreenButton);

  closeButton.append(closeIcon);
  buttonsContainer.append(closeButton);

  widgetHeader.append(tabsHeaderContainer);
  widgetHeader.append(buttonsContainer);

  // ------------------ CONTAINER WIDGET ------------------

  // Create Container for Widget
  const widgetContainer = document.createElement('div');
  widgetContainer.setAttribute('class', 'lb_widget-container');

  // Insert Header and Iframe into container
  widgetContainer.append(widgetHeader);
  widgetContainer.append(tabChildrenContainer);

  // Render default tab on first execution. And set it as active
  renderTab(currentTab).setAttribute('data-active', 'true');

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
  container.setAttribute('class', 'lb_container lb_closed');

  // ------------------ INSERT WIDGET ------------------
  // insert root
  container.appendChild(openButton);
  container.appendChild(widgetContainer);

  target.append(container);

  // ------------------ FUNCTIONS WIDGET ------------------

  const openRizimo = () => {
    if (!dragged) {
      replaceOrAddClass(container, 'lb_closed', 'lb_opened');
      getIframe().setAttribute('iframe-state', 'lb_opened');
    }
    dragged = false;
  };
  const closeRizimo = () => {
    replaceOrAddClass(container, 'lb_opened', 'lb_closed');
    getIframe().setAttribute('iframe-state', 'lb_closed');
  };
  const toggleFullscreen = (state = null) => {
    if (state === true) {
      container.classList.add('lb_fullscreen');
    } else if (state === false) {
      container.classList.remove('lb_fullscreen');
    } else {
      container.classList.toggle('lb_fullscreen');
    }
  };

  const handleNotification = (content) => {
    notifications = content;
    if (notifications > 0) {
      openButton.innerHTML = `
    <img src="${ABSOLUTE_URL}images/logos/${THEME}/widget/notifications.svg" />
    <div class="lb_notifications">
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
    getIframe().contentWindow.postMessage({ type: 'callback', callback: message.data.callback, data }, '*');
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
    openButton.classList.add('lb_moving');
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
      openButton.classList.remove('lb_moving');
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
      openButton.classList.remove('lb_moving');
      document.removeEventListener('touchmove', onMouseMove);
      document.ontouchend = null;
    };
  };

  container.ondragstart = function handleDragStart() {
    dragged = true;
    return false;
  };

  container.ondrop = function handleDrop(e) {
    // Prevent default behavior (Prevent file from being opened)
    e.preventDefault();

    /**
     * @type {File[]}
     */
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

    getIframe().contentWindow.postMessage({ type: 'widget', event: 'upload', files }, '*');
    openRizimo();
    toggleFullscreen(true);
    openButton.classList.remove('lb_dropping');
  };

  container.ondragover = function handleDragOver(e) {
    // Prevent default behavior (Prevent file from being opened)
    e.preventDefault();
  };

  container.ondragenter = function handleDragEnter() {
    openButton.classList.add('lb_dropping');
    // getIframe().style.pointerEvents = 'all';
  };

  container.ondragleave = function handleDragLeave() {
    openButton.classList.remove('lb_dropping');
    // getIframe().style.pointerEvents = 'none';
  };
}
