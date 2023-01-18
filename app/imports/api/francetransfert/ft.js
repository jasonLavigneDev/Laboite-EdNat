import axios from 'axios';
import url from 'url';

if (process.env.ENABLE_FIDDLER === 'true') {
  const proxyUrl = url.format({
    protocol: 'http:',
    hostname: '127.0.0.1',
    port: 8866,
  });
  process.env.http_proxy = proxyUrl;
  process.env.https_proxy = proxyUrl;
  // Use this only for debugging purposes as it introduces a security issue
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
}

const { apiKey, endpoint } = Meteor.settings?.franceTransfert || {};

export const FT = axios.create({
  proxy:
    process.env.ENABLE_FIDDLER === 'true'
      ? {
          protocol: 'http:',
          hostname: '127.0.0.1',
          port: 8866,
        }
      : false,

  baseURL: endpoint,
  headers: {
    cleAPI: apiKey,
  },
});

function foldTypeToFTTypePli(foldType) {
  if (foldType === 0) return 'COU';
  if (foldType === 1) return 'LIE';

  throw new Error('Unkown foldType');
}

export function initializeFold(sender, { data, files }) {
  const typePli = foldTypeToFTTypePli(data.foldType);

  const body = {
    typePli,
    courrielExpediteur: sender,
    Message: data.message,
    preferences: {
      dateValidite: data?.settings?.expiryDate,
      motDePasse: data?.settings?.password,
      langueCourriel: data?.settings?.language,
      protectionArchive: data?.settings?.encrypt,
    },
    fichiers: files.map((file) => ({
      idFichier: file.id,
      nomFichier: file.name,
      tailleFichier: file.size,
    })),
  };

  if (typePli === 'COU') {
    body.objet = data.subject;
    body.destinataires = data.recipients;
  }
  if (typePli === 'LIE') {
    body.objet = data.title;
  }

  return FT.post(`/api-public/initPli`, body);
}
