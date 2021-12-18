{
  // const DEV_DOMAIN = 'http://localhost:3000';
  const STAGING_RIZOMO = 'https://rizomo-staging.osc-fr1.scalingo.io';
  const RIZOMO_DOMAIN = STAGING_RIZOMO;

  const CONFIG = Object.freeze({
    URI: RIZOMO_DOMAIN,
  });

  const styles = `
	<style>
			.rizomo {
				position: fixed;
				bottom: 5px;
				right: 5px;
				width: 75px;
				height: 75px;
			}

			.rizomo {
        display: flex;
        justify-content: center;
        align-items: center;
				width: 75px;
				height: 75px;
        border-radius: 50%;
        color: white;
        border: none;
        cursor: pointer;
        font-size: 25px;
        box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%), 
                    0px 6px 10px 0px rgb(0 0 0 / 14%), 
                    0px 1px 18px 0px rgb(0 0 0 / 12%);
			}

			.rizomo > img {
				width: 75px;
				height: 75px;
			}

      .rizomo .notifications {
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

      .rizomo.opened {
        display: none;
      }

      .rizomo-container.closed {
        display: none;
      }


      .rizomo-container.opened.fullscreen {
        height: calc(100% - 10px);
        width: calc(100% - 10px);
      }

      .rizomo-container.opened {
        position: absolute;
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

      .rizomo-container.opened iframe {
        flex: 1;
        width: 100%;
        border: none;
        border-radius: 8px;
      }

      .rizomo-container .rizomo-header {
        height: 35px;
        background-color: #000091;
        display: flex;
        padding: 5px;
        justify-content: space-between;
      }
      .rizomo-container img {
        height: 35px;
      }

      .rizomo-container .buttons-container {
        display: flex;
      }

      .rizomo-container .buttons-container button {
        margin: 0;
        padding: 0;
        border: 0;
        background: none;
        position: relative;
        width: 25px;
        height: 25px;
        cursor: pointer;
      }

      .rizomo-container .cross-stand-alone:before, .cross-stand-alone:after {
        content: "";
        position: absolute;
        top: 18px;
        left: 0;
        right: 0;
        height: 2px;
        background: #fff;
        border-radius: 4px;
      }
      .rizomo-container .cross-stand-alone:before {
        transform: rotate(45deg);
      }
      .rizomo-container .cross-stand-alone:after {
        transform: rotate(-45deg);
      }

      .rizomo-container button.full-screen {
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

  // ------------------ VARIABLES RIZOMO ------------------
  let notifications = 0;

  // ------------------ HEADER RIZOMO ------------------
  // Create Header
  const rizomoHeader = document.createElement('div');
  rizomoHeader.setAttribute('class', 'rizomo-header');

  // create Logo
  const rizomoLogo = document.createElement('img');
  rizomoLogo.setAttribute('src', `${CONFIG.URI}/images/logos/rizomo/RobotR_Blc.svg`);

  // Create buttons container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.setAttribute('class', 'buttons-container');

  // Create Close Button
  const closeButton = document.createElement('button');
  closeButton.setAttribute('class', 'cross-stand-alone');
  closeButton.title = 'Fermer Rizomo';

  // Create fullscreen Icon
  const fullscreenButton = document.createElement('button');
  fullscreenButton.setAttribute('class', 'full-screen');
  fullscreenButton.innerHTML = '⛶';
  fullscreenButton.title = 'Plein écran';

  // Insert logo and buttons into hedaer
  buttonsContainer.append(fullscreenButton);
  buttonsContainer.append(closeButton);
  rizomoHeader.append(rizomoLogo);
  rizomoHeader.append(buttonsContainer);

  // ------------------ CONTAINER RIZOMO ------------------
  // Create Iframe
  const iframeContainer = document.createElement('iframe');
  iframeContainer.setAttribute('class', 'iframe-rizomo');
  iframeContainer.setAttribute('iframe-state', 'closed');
  iframeContainer.setAttribute('src', CONFIG.URI);

  // Create Container for Rizomo
  const rizomoContainer = document.createElement('div');
  rizomoContainer.setAttribute('class', 'rizomo-container closed');

  // Insert Header and Iframe into container
  rizomoContainer.append(rizomoHeader);
  rizomoContainer.append(iframeContainer);

  // ------------------ ROBOT RIZOMO ------------------
  // Create open button with the robot
  const openButton = document.createElement('button');
  openButton.setAttribute('class', 'rizomo closed');
  openButton.title = 'Ouvrir Rizomo';
  openButton.innerHTML = `<img src="${CONFIG.URI}/images/logos/rizomo/robot_button.svg" />`;

  // Get header and body from the page
  const target = document.body || document.querySelector('body');
  const head = document.head || document.querySelector('head');
  head.innerHTML += styles;

  // ------------------ INSERT RIZOMO ------------------
  // insert root
  target.append(openButton);
  target.append(rizomoContainer);

  // ------------------ FUNCTIONS RIZOMO ------------------
  const openRizimo = () => {
    rizomoContainer.setAttribute('class', 'rizomo-container opened');
    iframeContainer.setAttribute('iframe-state', 'opened');
    openButton.setAttribute('class', 'rizomo opened');
  };
  const closeRizimo = () => {
    rizomoContainer.setAttribute('class', 'rizomo-container closed');
    iframeContainer.setAttribute('iframe-state', 'closed');
    openButton.setAttribute('class', 'rizomo closed');
  };
  const toggleFullscreen = () => {
    rizomoContainer.classList.toggle('fullscreen');
  };

  const receiveMessage = ({ data }) => {
    const { type, content } = data;
    if (type === 'notifications') {
      notifications = content;
      if (notifications > 0) {
        openButton.innerHTML = `
        <img src="${CONFIG.URI}/images/logos/rizomo/robot_button_notifs.svg" />
        <div class="notifications">
          ${notifications}
        </div>
        `;
      } else {
        openButton.innerHTML = `<img src="${CONFIG.URI}/images/logos/rizomo/robot_button.svg" />`;
      }
    }
  };

  // ------------------ EVENTS LISTENERS RIZOMO ------------------
  openButton.addEventListener('click', openRizimo);
  closeButton.addEventListener('click', closeRizimo);
  fullscreenButton.addEventListener('click', toggleFullscreen);
  window.addEventListener('message', receiveMessage, false);
}
