import axios from 'axios';

const { apiKey, endpoint } = Meteor.settings?.franceTransfert || {};

const FT = axios.create({
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
