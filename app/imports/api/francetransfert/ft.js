import i18n from 'meteor/universe:i18n';
import axios from 'axios';
import url from 'url';
import logServer, { levels, scopes } from '../logging';

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

export function throwFTError(error, functionContext) {
  if (axios.isAxiosError(error)) {
    let details;
    // Log error
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      details = {
        headers: error.response.headers,
        data: error.response.data,
        status: error.response.status,
        message: error.message,
      };
      console.error('Error from FT:', JSON.stringify(details, null, 2));
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      details = {
        config: error.config,
        message: error.message,
      };
      console.error('Error requesting FT:', details);
    } else {
      // Something happened in setting up the request that triggered an Error
      details = {
        config: error.code,
        message: error.message,
      };
      console.error('Error', details);
    }

    logServer(`FRANCE-TRANSFER - FT - UPDATE - ${functionContext} - message`, levels.ERROR, scopes.ADMIN, details);

    if (error.response?.data?.erreurs?.[0]?.libelleErreur) {
      return new Meteor.Error(
        'api.francetransfert.initFold.franceTransfertError',
        error.response?.data?.erreurs?.[0]?.libelleErreur || JSON.stringify(),
        details,
      );
    }

    return new Meteor.Error(
      'api.francetransfert.franceTransfertError',
      i18n.__('api.franceTransfert.FTError'),
      details,
    );
  }

  console.error(error);
  return new Meteor.Error('Unkown FT error');
}

function foldTypeToFTTypePli(foldType) {
  if (foldType === 0) return 'COU';
  if (foldType === 1) return 'LIE';

  throw new Error('Unkown foldType');
}

async function wrapError(promise, functionContext) {
  try {
    return await promise;
  } catch (error) {
    throw throwFTError(error, functionContext);
  }
}

// Calls

export function initFold(sender, { data, files }) {
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
      envoiMdpDestinataires: true,
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

  return wrapError(FT.post(`/api-public/initPli`, body), 'initFold');
}

export function getFoldStatus(id, sender) {
  const params = {
    idPli: id,
    courrielExpediteur: sender,
  };

  return wrapError(FT.get(`/api-public/statutPli`, { params }), 'getFoldStatus');
}

export function getFoldData(id, sender) {
  const params = {
    idPli: id,
    courrielExpediteur: sender,
  };

  return wrapError(FT.get(`/api-public/donneesPli`, { params }), 'getFoldData');
}
