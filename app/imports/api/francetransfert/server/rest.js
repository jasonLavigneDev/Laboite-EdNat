// import { PassThrough } from 'stream';
// import meter from 'stream-meter';
import { FT } from '../ft';

const { apiKey } = Meteor.settings?.franceTransfert || {};

/**
 *
 * @param {import('connect').IncomingMessage} request
 * @param {import('http').ServerResponse} response
 * @param {import('connect').NextFunction} next
 * @returns
 */
export default function ftUploadProxy(request, response) {
  // const passTroughStream = new PassThrough();
  // request.pipe(meter(1e7)).pipe(passTroughStream, { end: false });

  const chunks = [];
  request.on('data', (chunk) => chunks.push(chunk));
  request.on('end', () => {
    const data = Buffer.concat(chunks);

    FT({
      method: 'POST',
      url: '/api-public/chargementPli',
      headers: {
        accept: request.headers.accept,
        'content-type': request.headers['content-type'],
        'content-length': request.headers['content-length'],
        cleAPI: apiKey,
      },
      data,
      // data: passTroughStream,
    })
      .then((res) => {
        response.writeHead(res.status, res.statusText, res.headers);
        response.end(JSON.stringify(res.data));
      })
      .catch((err) => {
        response.writeHead(err.response.status, err.response.statusText, err.response.headers);
        response.end(JSON.stringify(err.response.data));
      });
  });
}
