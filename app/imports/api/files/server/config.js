import Minio from 'minio';

// Instantiate the minio client with the endpoint
// and access keys as shown below.
const { minioEndPoint, minioPort, minioSSL } = Meteor.settings.public;
const { minioAccess } = Meteor.settings.private;
const s3Client = minioEndPoint
  ? new Minio.Client({
      endPoint: minioEndPoint,
      port: minioPort,
      useSSL: minioSSL,
      accessKey: minioAccess,
      secretKey: Meteor.settings.private.minioSecret,
    })
  : null;

export default s3Client;
