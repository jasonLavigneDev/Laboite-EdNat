import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { postMessage } from './widget';

export default function useWidgetLink() {
  const history = useHistory();

  //   APP Drop to upload
  useEffect(() => {
    /**
     *
     * @param {MessageEvent<any>} event
     */
    function handle(event) {
      const { data } = event;
      if (data.type === 'widget') {
        switch (data.event) {
          case 'upload':
            console.log(event, data.files);
            history.push('/upload', data.files);
            break;
          default:
            break;
        }
      }
    }
    window.addEventListener('message', handle);
    return () => {
      window.removeEventListener('message', handle);
    };
  }, [history]);

  useEffect(() => {
    postMessage({
      type: 'ready',
    });
  }, []);
}
