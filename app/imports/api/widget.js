/** Le préfixe choisi pour les classes CSS, afin d'assurer une unicité, est `lb_` */
const styles = `
              .lb_widget {
                  position: fixed;
                    bottom: 10px;
                  right: 10px;
                  width: 75px;
                  height: 75px;
                  z-index: 9999;
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
                  transition: transform 0.1s ease-in-out;
                  box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%), 
                              0px 6px 10px 0px rgb(0 0 0 / 14%), 
                              0px 1px 18px 0px rgb(0 0 0 / 12%);
              }
      
            .lb_widget.closed:hover {
              transform: scale(1.2);
            }
            .lb_widget *, .lb_widget-container * {
              box-sizing: content-box !important;
            }
      
            .lb_widget > img {
              width: 75px;
              height: 75px;
            }
      
            .lb_widget .notifications {
              position: absolute;
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
      
            .lb_widget.opened {
              display: none;
            }
            .lb_widget.moving {
              transform: scale(1.2);
            }
      
            .lb_widget-container.closed {
              display: none;
            }
      
      
            .lb_widget-container.opened.fullscreen {
              height: calc(100% - 10px);
              width: calc(100% - 10px);
            }
      
            .lb_widget-container.opened {
              z-index: 9999;
              position: fixed;
              display: flex;
              flex-direction: column;
                      bottom: 5px;
                      right: 5px;
              height: 600px;
              max-height: calc(100% - 10px);
              width: 500px;
              max-width: calc(100% - 10px);
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
      
            .lb_widget-container.opened iframe {
              flex: 1;
              width: 100%;
              border: none;
              border-radius: 0 0 8px 8px;
            }
      
            .lb_widget-container .lb_widget-header {
              height: 35px;
              background-color: #000091;
              display: flex;
              padding: 5px;
              justify-content: space-between;
            }
            .lb_widget-container img {
              height: 35px;
            }
      
            .lb_widget-container .buttons-container {
              display: flex;
            }
      
            .lb_widget-container .buttons-container button {
              margin: 0;
              padding: 0;
              border: 0;
              background: none;
              position: relative;
              width: 25px;
              height: 25px;
              cursor: pointer;
            }
      
            .lb_widget-container .cross-stand-alone:before, .cross-stand-alone:after {
              content: "";
              position: absolute;
              top: 18px;
              left: 0;
              right: 0;
              height: 2px;
              background: #fff;
              border-radius: 4px;
            }
            .lb_widget-container .cross-stand-alone:before {
              transform: rotate(45deg);
            }
            .lb_widget-container .cross-stand-alone:after {
              transform: rotate(-45deg);
            }
      
            .lb_widget-container button.full-screen {
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
          `;

// The widget function is generated with a string form to be sent to the client
// It has to grab some variables from the server before
const { theme } = Meteor.settings.public;
export const widget = () => `
{
    // ------------------ VARIABLES WIDGET ------------------
    let notifications = 0;
    let userLogged = "disconnected"
    let dragged = false;
    let touchduration = 200;
    let timer;
    let shiftX
    let shiftY

    // ------------------ HEADER WIDGET ------------------
    // Create Header
    const widgetHeader = document.createElement('div');
    widgetHeader.setAttribute('class', 'lb_widget-header');
  
    // create Logo
    const widgetLogo = document.createElement('img');
    widgetLogo.setAttribute('src', \`${Meteor.absoluteUrl()}images/logos/${theme}/widget/logo.svg\`);
  
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
    iframeContainer.setAttribute('src', '${process.env.ROOT_URL}');
  
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
    openButton.innerHTML = 
        '<img src="${Meteor.absoluteUrl()}images/logos/${theme}/widget/' 
        + userLogged + 
        '.svg" />';
  
    // create Styles
    const stylesBalise = document.createElement('style')
    stylesBalise.innerHTML = \`${styles}\`


    // Get header and body from the page
    const target = document.body || document.querySelector('body');
    const head = document.head || document.querySelector('head');
    head.append(stylesBalise)
  
    // ------------------ INSERT WIDGET ------------------
    // insert root
    target.append(openButton);
    target.append(widgetContainer);
  
    // ------------------ FUNCTIONS WIDGET ------------------

    const openRizimo = (e) => {
      if (!dragged ) {
        widgetContainer.setAttribute('class', 'lb_widget-container opened');
        iframeContainer.setAttribute('iframe-state', 'opened');
        openButton.setAttribute('class', 'lb_widget opened');
      }
      dragged = false
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
        openButton.innerHTML = \`
        <img src="${Meteor.absoluteUrl()}images/logos/${theme}/widget/notifications.svg" />
        <div class="notifications">
          \${notifications}
        </div>
        \`;
      } else {
        openButton.innerHTML = 
            '<img src="${Meteor.absoluteUrl()}images/logos/${theme}/widget/' 
            + userLogged + 
            '.svg" />';
      }
    }
    
    const handleUserLogged = (content) => {
      if(content){
        userLogged = "connected"
        '<img src="${Meteor.absoluteUrl()}images/logos/${theme}/widget/connected.svg" />';
      } else {
        openButton.innerHTML = 
            '<img src="${Meteor.absoluteUrl()}images/logos/${theme}/widget/disconnected.svg" />';
        userLogged = "disconnected"
      }
    }
  
    const receiveMessage = ({ data }) => {
      const { type, content } = data;
      if (type === 'notifications') {
        handleNotification(content)
      } else if( type === "userLogged"){
        handleUserLogged(content)
      }
    };
  
    // ------------------ EVENTS LISTENERS WIDGET ------------------
    openButton.addEventListener('click', openRizimo);
    closeButton.addEventListener('click', closeRizimo);
    fullscreenButton.addEventListener('click', toggleFullscreen);
    window.addEventListener('message', receiveMessage, false);
  
    // ------------------ DRAGGABLE ROBOT ------------------

    const moveAt = (clientX, clientY) => {
      const positionLeft = clientX - shiftX
      const positionTop = clientY - shiftY


      if(positionLeft > (window.innerWidth - 85)) {
        openButton.style.left = window.innerWidth - 85 + 'px';
      } else if(positionLeft < 0) {
        openButton.style.left = '10px';
      } else {
        openButton.style.left = positionLeft + 'px';
      }

      if(positionTop > (window.innerHeight - 85)) {
        openButton.style.top = window.innerHeight - 85 + 'px';
      } else if(positionTop < 0) {
        openButton.style.top = '10px';
      } else {
        openButton.style.top = positionTop + 'px';
      }
    }

    const onMouseMove = (event) => {
      const contact = event.touches ? event.touches[0] : null;
      const ref = contact || event
      if(dragged){
        moveAt(ref.clientX, ref.clientY);
      }
    }

    const onlongpress = () => {
      dragged = true
      openButton.setAttribute('class', 'lb_widget closed moving');
      document.addEventListener('touchmove', onMouseMove, false);
      document.addEventListener('mousemove', onMouseMove, false);
      if (timer){
        clearTimeout(timer)
      }
    }; 

    window.onresize = () => {
      openButton.style.right = '10px';
      openButton.style.bottom = '10px';
      openButton.style.left = null;
      openButton.style.top = null;
    }

    openButton.onmousedown = function(event) {
      shiftX = event.clientX - openButton.getBoundingClientRect().left;
      shiftY = event.clientY - openButton.getBoundingClientRect().top;

      timer = setTimeout(onlongpress, touchduration); 

      // drop the openButton, remove unneeded handlers
      document.onmouseup = function() {
        if (timer){
          clearTimeout(timer)
        }
        openButton.setAttribute('class', 'lb_widget closed');
        document.removeEventListener('mousemove', onMouseMove);
        document.onmouseup = null;
      };
    };

    openButton.ontouchstart = function(event) {
      const touch = event.touches ? event.touches[0]: null;
      const ref = touch || event
      shiftX = ref.clientX - openButton.getBoundingClientRect().left;
      shiftY = ref.clientY - openButton.getBoundingClientRect().top;

      timer = setTimeout(onlongpress, touchduration); 

      // drop the openButton, remove unneeded handlers
      document.ontouchend = function() {
        if (timer){
          clearTimeout(timer)
        }
        dragged = false
        openButton.setAttribute('class', 'lb_widget closed');
        document.removeEventListener('touchmove', onMouseMove);
        document.ontouchend = null;
      };
    };

    openButton.ondragstart = function () {
      dragged = true
      return false;
    };

  }`;
