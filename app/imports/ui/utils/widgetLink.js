import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

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
            console.log(event);
            console.log({ ...data });

            console.log('Recivied files: ', data.files);
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
  }, []);
}
