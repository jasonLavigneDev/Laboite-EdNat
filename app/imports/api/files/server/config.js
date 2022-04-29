import Minio from 'minio';

// Instantiate the minio client with the endpoint
// and access keys as shown below.

let client = null;
const { minioEndPoint, minioPort, minioSSL } = Meteor.settings.public;
if (!Meteor.isTest && !!minioEndPoint) {
  const { minioAccess } = Meteor.settings.private;
  client = minioEndPoint
    ? new Minio.Client({
        endPoint: minioEndPoint,
        port: minioPort,
        useSSL: minioSSL,
        accessKey: minioAccess,
        secretKey: Meteor.settings.private.minioSecret,
      })
    : null;
}
const s3Client = client;

export default s3Client;
