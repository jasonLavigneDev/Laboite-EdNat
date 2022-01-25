const styles = `
          <style>
                  .widget {
                      position: fixed;
                      bottom: 5px;
                      right: 5px;
                      width: 75px;
                      height: 75px;
              z-index: 9999;
                  }
      
                  .widget {
              display: flex;
              justify-content: center;
              align-items: center;
                      width: 75px;
                      height: 75px;
              border-radius: 50%;
              color: white;
              border: none;
              cursor: pointer;
              padding: 0;
              margin: 0;
              font-size: 25px;
              box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%), 
                          0px 6px 10px 0px rgb(0 0 0 / 14%), 
                          0px 1px 18px 0px rgb(0 0 0 / 12%);
                  }
            .widget *, .widget-container * {
              box-sizing: content-box !important;
            }
      
                  .widget > img {
                      width: 75px;
                      height: 75px;
                  }
      
            .widget .notifications {
              position: fixed;
              background-color: #ce0500;
              font-size: 15px;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              top: 0;
              right: 0;
              box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%), 
                          0px 6px 10px 0px rgb(0 0 0 / 14%), 
                          0px 1px 18px 0px rgb(0 0 0 / 12%);
            }
      
            .widget.opened {
              display: none;
            }
      
            .widget-container.closed {
              display: none;
            }
      
      
            .widget-container.opened.fullscreen {
              height: calc(100% - 10px);
              width: calc(100% - 10px);
            }
      
            .widget-container.opened {
              z-index: 9999;
              position: fixed;
              display: flex;
              flex-direction: column;
                      bottom: 5px;
                      right: 5px;
              height: 600px;
              width: 500px;
              max-width: 100%;
              border-width: 2px;
              border-style: solid;
              border-color: #000091;
              border-radius: 8px;
              animation: fadeIn 0.7s;
              overflow: hidden;
              box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%), 
                          0px 6px 10px 0px rgb(0 0 0 / 14%), 
                          0px 1px 18px 0px rgb(0 0 0 / 12%);
            }
      
            .widget-container.opened iframe {
              flex: 1;
              width: 100%;
              border: none;
              border-radius: 8px;
            }
      
            .widget-container .widget-header {
              height: 35px;
              background-color: #000091;
              display: flex;
              padding: 5px;
              justify-content: space-between;
            }
            .widget-container img {
              height: 35px;
            }
      
            .widget-container .buttons-container {
              display: flex;
            }
      
            .widget-container .buttons-container button {
              margin: 0;
              padding: 0;
              border: 0;
              background: none;
              position: relative;
              width: 25px;
              height: 25px;
              cursor: pointer;
            }
      
            .widget-container .cross-stand-alone:before, .cross-stand-alone:after {
              content: "";
              position: absolute;
              top: 18px;
              left: 0;
              right: 0;
              height: 2px;
              background: #fff;
              border-radius: 4px;
            }
            .widget-container .cross-stand-alone:before {
              transform: rotate(45deg);
            }
            .widget-container .cross-stand-alone:after {
              transform: rotate(-45deg);
            }
      
            .widget-container button.full-screen {
              width: 35px;
              height: 35px;
              color: #fff;
              font-size: 25px;
              display: flex;
              justify-content: center;
              align-items: center;
              margin-right: 5px;
            }
            
            @keyframes fadeIn {
              0%{
                opacity: 0;
              }
              100%{
                opacity: 1;
              }
            }
              </style>
          `;

export const widget = () => `
{
    // ------------------ VARIABLES WIDGET ------------------
    let notifications = 0;
    let initX;
    let initY;
    let firstX;
    let firstY;
    let dragged;
    let downTimeStamp;
    const TIMESTAMP = 500;
    // ------------------ HEADER WIDGET ------------------
    // Create Header
    const widgetHeader = document.createElement('div');
    widgetHeader.setAttribute('class', 'widget-header');
  
    // create Logo
    const widgetLogo = document.createElement('img');
    widgetLogo.setAttribute('src', '${Meteor.absoluteUrl()}images/logos/rizomo/RobotR_Blc.svg');
  
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.setAttribute('class', 'buttons-container');
  
    // Create Close Button
    const closeButton = document.createElement('button');
    closeButton.setAttribute('class', 'cross-stand-alone');
    closeButton.title = 'Fermer ${Meteor.settings.public.appName}';
  
    // Create fullscreen Icon
    const fullscreenButton = document.createElement('button');
    fullscreenButton.setAttribute('class', 'full-screen');
    fullscreenButton.innerHTML = '⛶';
    fullscreenButton.title = 'Plein écran';
  
    // Insert logo and buttons into hedaer
    buttonsContainer.append(fullscreenButton);
    buttonsContainer.append(closeButton);
    widgetHeader.append(widgetLogo);
    widgetHeader.append(buttonsContainer);
  
    // ------------------ CONTAINER WIDGET ------------------
    // Create Iframe
    const iframeContainer = document.createElement('iframe');
    iframeContainer.setAttribute('class', 'iframe-widget');
    iframeContainer.setAttribute('iframe-state', 'closed');
    iframeContainer.setAttribute('src', '${Meteor.absoluteUrl()}');
  
    // Create Container for Widget
    const widgetContainer = document.createElement('div');
    widgetContainer.setAttribute('class', 'widget-container closed');
  
    // Insert Header and Iframe into container
    widgetContainer.append(widgetHeader);
    widgetContainer.append(iframeContainer);
  
    // ------------------ ROBOT WIDGET ------------------
    // Create open button with the robot
    const openButton = document.createElement('button');
    openButton.setAttribute('class', 'widget closed');
    openButton.title = 'Ouvrir ${Meteor.settings.public.appName}';
    openButton.innerHTML = '<img src="${Meteor.absoluteUrl()}images/logos/rizomo/robot_button.svg" />';
  
    // Get header and body from the page
    const target = document.body || document.querySelector('body');
    const head = document.head || document.querySelector('head');
    head.innerHTML = \`${styles}\`;
  
    // ------------------ INSERT WIDGET ------------------
    // insert root
    target.append(openButton);
    target.append(widgetContainer);
  
    // ------------------ FUNCTIONS WIDGET ------------------
    const openRizimo = (e) => {
      if (!dragged && downTimeStamp && e.timeStamp - downTimeStamp < TIMESTAMP) {
        widgetContainer.setAttribute('class', 'widget-container opened');
        iframeContainer.setAttribute('iframe-state', 'opened');
        openButton.setAttribute('class', 'widget opened');
      }
      dragged = false
      downTimeStamp = null;
    };
    const closeRizimo = () => {
      widgetContainer.setAttribute('class', 'widget-container closed');
      iframeContainer.setAttribute('iframe-state', 'closed');
      openButton.setAttribute('class', 'widget closed');
    };
    const toggleFullscreen = () => {
      widgetContainer.classList.toggle('fullscreen');
    };
  
    const receiveMessage = ({ data }) => {
      const { type, content } = data;
      if (type === 'notifications') {
        notifications = content;
        if (notifications > 0) {
          openButton.innerHTML = \`
          <img src="${Meteor.absoluteUrl()}images/logos/rizomo/robot_button_notifs.svg" />
          <div class="notifications">
            \${notifications}
          </div>
          \`;
        } else {
          openButton.innerHTML = '<img src="${Meteor.absoluteUrl()}images/logos/rizomo/robot_button.svg" />';
        }
      }
    };
  
    // ------------------ EVENTS LISTENERS WIDGET ------------------
    openButton.addEventListener('click', openRizimo);
    closeButton.addEventListener('click', closeRizimo);
    fullscreenButton.addEventListener('click', toggleFullscreen);
    window.addEventListener('message', receiveMessage, false);
  
    // ------------------ DRAGGABLE ROBOT ------------------
  
    const dragIt = (e) => {
      dragged = true
      const left = initX + e.pageX - firstX + 'px';
      const top = initY + e.pageY - firstY + 'px';
      openButton.style.left = left < 0 ? 0 : left;
      openButton.style.top = top < 0 ? 0 : top;
    };
  
    const swipeIt = (e) => {
      dragged = true
      const contact = e.touches;
      const left = initX + contact[0].pageX - firstX + 'px';
      const top = initY + contact[0].pageY - firstY + 'px';
      openButton.style.left = left < 0 ? 0 : left;
      openButton.style.top = top < 0 ? 0 : top;
    };
  
    openButton.addEventListener(
      'mousedown',
      (e) => {
        e.preventDefault();
        downTimeStamp = e.timeStamp;
        initX = openButton.offsetLeft;
        initY = openButton.offsetTop;
        firstX = e.pageX;
        firstY = e.pageY;
  
        openButton.addEventListener('mousemove', dragIt, false);
  
        window.addEventListener(
          'mouseup',
          (e) => {
            openButton.removeEventListener('mousemove', dragIt, false);
          },
          false,
        );
      },
      false,
    );
  
    openButton.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        initX = openButton.offsetLeft;
        initY = openButton.offsetTop;
        const touch = e.touches;
        firstX = touch[0].pageX;
        firstY = touch[0].pageY;
  
        this.addEventListener('touchmove', swipeIt, false);
  
        window.addEventListener(
          'touchend',
          (e) => {
            e.preventDefault();
            openButton.removeEventListener('touchmove', swipeIt, false);
          },
          false,
        );
      },
      false,
    );
  }`;
