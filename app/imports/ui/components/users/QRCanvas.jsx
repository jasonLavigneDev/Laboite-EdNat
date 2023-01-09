import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode';

function QRCanvas({ url }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (url) {
      QRCode.toCanvas(canvasRef.current, url, function (error) {
        if (error) console.log(error);
      });
    }
  }, [url]);
  return <canvas ref={canvasRef} id="qrCanvas" />;
}

QRCanvas.propTypes = {
  url: PropTypes.string.isRequired,
};

export default QRCanvas;
