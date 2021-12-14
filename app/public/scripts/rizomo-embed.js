{
  const styles = `
	<style>
			[data-app="rizomo"] {
				position: fixed;
				bottom: 5px;
				right: 5px;
			}
			[data-app="rizomo"] > button {
				width: 75px;
				height: 75px;
        border-radius: 50%;
        background-color: #000091;
        color: white;
        border: none;
        cursor: pointer;
        font-size: 25px;
        box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%), 
                    0px 6px 10px 0px rgb(0 0 0 / 14%), 
                    0px 1px 18px 0px rgb(0 0 0 / 12%);
			}

			[data-app="rizomo"] > button > img {
				width: 75px;
				height: 75px;
			}
      .iframe-rizomo.closed {
        display: none;
      }
      .iframe-rizomo.opened {
        position: absolute;
				bottom: 90px;
				right: 5px;
        height: 600px;
        width: 900px;
        max-width: 100%;
        border-width: 2px;
        border-style: solid;
        border-color: #000091;
        border-radius: 8px;
        background:rgba(0,0,0,.0);
        animation: fadeIn 0.7s;
        box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%), 
                    0px 6px 10px 0px rgb(0 0 0 / 14%), 
                    0px 1px 18px 0px rgb(0 0 0 / 12%);
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
  const target = document.body || document.querySelector('body');
  const head = document.head || document.querySelector('head');
  head.innerHTML += styles;

  const iframe = document.createElement('iframe');
  iframe.setAttribute('class', 'iframe-rizomo closed');
  iframe.setAttribute('src', 'https://rizomo-staging.osc-fr1.scalingo.io/');

  const root = document.createElement('div');
  root.setAttribute('data-app', 'rizomo');

  const button = document.createElement('button');
  button.title = 'Ouvrir Rizomo';
  button.innerHTML = 'R';

  const openRizimo = () => {
    button.innerHTML = 'X';
    iframe.setAttribute('class', 'iframe-rizomo opened');
  };
  const closeRizimo = () => {
    button.innerHTML = 'R';
    iframe.setAttribute('class', 'iframe-rizomo closed');
  };

  const toggleRizomo = () => {
    if (button.innerHTML === 'R') {
      openRizimo();
    } else {
      closeRizimo();
    }
  };

  button.addEventListener('click', toggleRizomo);

  root.append(button);
  target.append(root);
  target.append(iframe);
}
