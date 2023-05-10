import { useEffect } from 'react';
// import { useHistory } from 'react-router-dom';

// TODO:
export default function useAppTransfert() {
  // const history = useHistory();
  //   const location = useLocation();

  //   APP Drop to upload
  useEffect(() => {
    // TODO: finish this
    // /**
    //  *
    //  * @param {DragEvent} e
    //  */
    // function handleOver(e) {
    //   e.preventDefault();
    // }
    // /**
    //  *
    //  * @param {DragEvent} e
    //  */
    // function handleDrop(e) {
    //   e.preventDefault();
    //   let node = e.target;
    //   while (node?.parentNode && node?.parentNode !== document.body) {
    //     node = node.parentNode;
    //   }
    //   const files = [];
    //   if (e.dataTransfer.items) {
    //     // Use DataTransferItemList interface to access the file(s)
    //     [...e.dataTransfer.items].forEach((item) => {
    //       // If dropped items aren't files, reject them
    //       if (item.kind === 'file') {
    //         files.push(item.getAsFile());
    //       }
    //     });
    //   } else {
    //     // Use DataTransfer interface to access the file(s)
    //     [...e.dataTransfer.files].forEach((file) => {
    //       files.push(file);
    //     });
    //   }
    //   history.push('/upload', files);
    // }
    // document.body.addEventListener('drop', handleDrop);
    // document.body.addEventListener('dragover', handleOver);
    // return () => {
    //   document.body.removeEventListener('drop', handleDrop);
    //   document.body.removeEventListener('dragover', handleOver);
    // };
  }, []);
}
