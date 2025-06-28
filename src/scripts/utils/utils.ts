import { Folder } from "./interfaces";

export interface TabInfo {
  url: string;
  title: string;
}

export async function getCurrentTabInfo(): Promise<{ title: string | undefined; url: string | undefined }> {
  const tabs = await getBrowser().tabs.query({ active: true, currentWindow: true });
  const { url, title } = tabs[0];
  return { url, title };
}

export function getBrowser() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  return typeof browser !== 'undefined' ? browser : chrome;
}

export function getChromeStorage() {
  return typeof chrome !== 'undefined' && !!chrome.storage;
}

export async function getStorageItem(key: string) {
  if (getChromeStorage()) {
    const result = await getBrowser().storage.local.get([key]);
    return result[key];
  } else {
    return getBrowser().storage.local.get(key);
  }
}

export async function getStorageItems(key: string[]) {
  if (getChromeStorage()) {
    const result = await getBrowser().storage.local.get(key);
    return result;
  } else {
    return getBrowser().storage.local.get(key);
  }
}

export async function setStorageItem(key: string, value: any) {
  if (getChromeStorage()) {
    return await chrome.storage.local.set({ [key]: value });
  } else {
    await getBrowser().storage.local.set({ [key]: value });
    return Promise.resolve();
  }
}

export function openOptions() {
  getBrowser().runtime.openOptionsPage();
}

export function getParentFolder(allFolders: Folder[], targetFolder: Folder) {
  return allFolders.filter((parent) => parent.id === targetFolder.parentId)[0];
}

export function getFullPathName(allFolders: Folder[], targetFolder: Folder) {
	if(!!targetFolder.parentId) {
		return `${getFullPathName(allFolders, getParentFolder(allFolders, targetFolder))}/${targetFolder.name}`;
	}
	return targetFolder.name;
}

export const defaultFolderColor = '#0ea5e9';

export function normalizeColor(color: string) {
  if (!color || !/^#([A-Fa-f0-9]{3}$|[A-Fa-f0-9]{6}$|[A-Fa-f0-9]{8}$)/.test(color)) {
    return defaultFolderColor;
  }

  if (color.length == 9) {
    return color.substring(0, color.length-2);
  }
  if (color.length == 4) {
    return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  }

  return color;
}
