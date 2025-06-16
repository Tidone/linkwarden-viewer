import { LinkwardenService } from './linkwarden-service';
import { getBrowser, getStorageItems } from '../utils/utils';

let host: string;
let token: string;
let errorFlag: boolean;

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
  } else if (request.action === 'clearErrorFlag') {
    errorFlag = false;
    return false;
  } else if (request.action === 'getErrorFlag') {
    sendResponse(errorFlag);
    return false;
  }

  if(!host || !token)
  {
    console.warn('Tried to call Linkwarden API with invalid credentials');
    return false;
  }

  const service: BookmarkManagerService = new LinkwardenService(host, token);
  if (request.action === 'fetchAllLinksFromAllFolders') {
    service.fetchAllLinksFromAllFolders().then(sendResponse).catch(() => {sendResponse(); errorFlag = true;});
    return true;
  } else if (request.action === 'fetchFolders') {
    service.fetchFolders().then(sendResponse).catch(() => {sendResponse(); errorFlag = true;});
    return true;
  } else if (request.action === 'fetchLinks') {
    service.fetchLinks(request.collectionId).then(sendResponse).catch(() => {sendResponse(); errorFlag = true;});
    return true;
  } else if (request.action === 'fetchTags') {
    service.fetchTags().then(sendResponse).catch(() => {sendResponse(); errorFlag = true;});
    return true;
  } else if (request.action === 'saveLink') {
    service.saveLink(request.link).then(sendResponse).catch(() => {sendResponse(); errorFlag = true;});
    return true;
  } else if (request.action === 'updateLink') {
    service.updateLink(request.data, request.collectionOwnerId).then(sendResponse).catch(() => {sendResponse(); errorFlag = true;});
    return true;
  } else if (request.action === 'deleteLink') {
    service.deleteLink(request.id).then(sendResponse).catch(() => {sendResponse(); errorFlag = true;});
    return true;
  } else if (request.action === 'createFolder') {
    service.createFolder(request.name, request.parentId).then(sendResponse).catch(() => {sendResponse(); errorFlag = true;});
    return true;
  } else if (request.action === 'updateFolder') {
    service.updateFolder(request.id, request.name, request.parentId).then(sendResponse).catch(() => {sendResponse(); errorFlag = true;});
    return true;
  } else if (request.action === 'deleteFolder') {
    service.deleteFolder(request.id).then(sendResponse).catch(() => {sendResponse(); errorFlag = true;});
    return true;
  }
  return false;
});

export {};
