import { LinkwardenService } from './linkwarden-service';
import { getBrowser, getStorageItems } from '../utils/utils';

let host: string;
let token: string;

console.log('Background Service Worker Loaded');

getStorageItems(['host', 'token']).then((result) => {
  host = result.host;
  token = result.token;
});


getBrowser().runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('Message received:', request);

  if (request.action === 'hasValidConfiguration') {
    sendResponse(!!host && !!token);
    return false;
  } else if (request.action === 'reload') {
    getStorageItems(['host', 'token']).then((result) => {
      host = result.host;
      token = result.token;
    });
    return false;
  }

  if(!host || !token)
  {
    console.warn('Tried to call Linkwarden API with invalid credentials');
    return false;
  }

  const service: BookmarkManagerService = new LinkwardenService(host, token);
  if (request.action === 'fetchAllLinksFromAllFolders') {
    service.fetchAllLinksFromAllFolders().then(sendResponse);
    return true;
  } else if (request.action === 'fetchFolders') {
    service.fetchFolders().then(sendResponse);
    return true;
  } else if (request.action === 'fetchLinks') {
    service.fetchLinks(request.collectionId).then(sendResponse);
    return true;
  } else if (request.action === 'fetchTags') {
    service.fetchTags().then(sendResponse);
    return true;
  } else if (request.action === 'saveLink') {
    service.saveLink(request.link).then(sendResponse);
    return true;
  } else if (request.action === 'updateLink') {
    service.updateLink(request.data, request.collectionOwnerId).then(sendResponse);
    return true;
  } else if (request.action === 'deleteLink') {
    service.deleteLink(request.id).then(sendResponse);
    return true;
  } else if (request.action === 'createFolder') {
    service.createFolder(request.name, request.parentId).then(sendResponse);
    return true;
  } else if (request.action === 'updateFolder') {
    service.updateFolder(request.id, request.name, request.parentId).then(sendResponse);
    return true;
  } else if (request.action === 'deleteFolder') {
    service.deleteFolder(request.id).then(sendResponse);
    return true;
  }
  return false;
});

export {};
