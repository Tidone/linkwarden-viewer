import { Folder, Link, LinksByFolder, NewLink, Tag } from "../utils/interfaces";
import { normalizeColor } from "../utils/utils";
import { ApiReturnType, BookmarkManagerService } from "./bookmark-manager-service";

interface FetchFolderInfo {
  id: number;
  name: string;
  ownerId: number;
  parentId: number;
  createdAt: string;
  icon?: string;
  iconWeight?: string;
  color: string;
}

interface FetchFoldersResponse {
  response: FetchFolderInfo[];
}

interface FetchFolderResponse {
  response: FetchFolderInfo;
}

interface FetchLinksResponse {
  response: {
    id: number;
    name: string;
    url: string;
    importDate?: string;
    createdAt: string;
    tags: {
      id: number;
      name: string;
    }[];
    collection: FetchFolderInfo;
  }[];
}

interface FetchTagsResponse {
  response: {
    id: number;
    name: string;
  }[];
}

interface CreateLinkRequest {
  name: string;
  url: string;
  type: string;
  collection: {
    id: number;
  };
  tags: {
    name: string;
  }[];
}

interface UpdateLinkRequest extends Omit<CreateLinkRequest, 'type'> {
  id: number;
  collection: {
    id: number;
    ownerId: number;
  };
}

interface CreateFolderRequest {
  name: string;
  parentId: number;
}

interface UpdateFolderRequest extends Omit<CreateFolderRequest, 'parentId'> {
  id: number;
  parentId: string | number;
}

export class LinkwardenService implements BookmarkManagerService {
  host: string;
  token: string;

  constructor(host: string, token: string) {
    this.host = host;
    this.token = token;
  }

  async fetchFolders(): Promise<ApiReturnType<Folder[]>> {
    try {
      const response = await fetch(`${this.host}/api/v1/collections`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        credentials: "omit",
      });
      const data: FetchFoldersResponse = await response.json();
      if(response.status !== 200) {
        throw 'Could not fetch folders: ' + data.response;
      }
      const result: Folder[] = data.response.map((value) => ({
        id: value.id,
        name: value.name,
        ownerId: value.ownerId,
        parentId: value.parentId,
        createdAt: value.createdAt,
        icon: value.icon,
        iconWeight: value.iconWeight,
        color: normalizeColor(value.color)
      }));
      return {success: true, data: result};
    } catch (error) {
      console.error('Error fetching folders: ', error);
      return {success: false, data: error.message};
    }
  }

  async _fetchFolderData(id: number): Promise<ApiReturnType<any>> {
    try {
      const response = await fetch(`${this.host}/api/v1/collections/${id}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        credentials: "omit",
      });
      const data: FetchFolderResponse = await response.json();
      if(response.status !== 200) {
        throw 'Could not fetch folders: ' + data.response;
      }
      return {success: true, data: data.response};
    } catch (error) {
      console.error('Error fetching folders: ', error);
      return {success: false, data: error.message};
    }
  }

  async _fetchLinksWithCursor(collectionId: number, cursor: number): Promise<ApiReturnType<Link[]>> {
    try {
      const response = await fetch(
        `${this.host}/api/v1/links?cursor=${cursor}&sort=0&collectionId=${collectionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          credentials: "omit",
        },
      );
      const data: FetchLinksResponse = await response.json();
      if(response.status !== 200) {
        throw 'Could not fetch links: ' + data.response;
      }
      const result: Link[] = data.response.map((value) => ({
        id: value.id,
        name: value.name,
        url: value.url,
        createdAt: value.importDate || value.createdAt, // the importDate is set if an entry is imported into LinkWarden, it is the date when the link was saved the first time
        tags: value.tags.map((tag) => ({id: tag.id, name: tag.name})),
        folder: ({
          id: value.collection.id,
          name: value.collection.name,
          ownerId: value.collection.ownerId,
          createdAt: value.collection.createdAt,
          icon: value.collection.icon,
          iconWeight: value.collection.iconWeight,
          color: normalizeColor(value.collection.color)
        })
      }));
      return {success: true, data: result};
    } catch (error) {
      console.error('Error fetching links: ', error);
      return {success: false, data: error.message};
    }
  }

  async fetchLinks(collectionId: number): Promise<ApiReturnType<Link[]>> {
    let cursor = 0;
    let count = 0;
    const allLinks: Link[] = [];

    while(true) {
      const result = await this._fetchLinksWithCursor(collectionId, cursor);
      if (!result.success) {
        return {success: false, data: result.data, additionalData: collectionId};
      }
      allLinks.push(...result.data);

      if(result.data.length == 0) {  // if the cursor is past the last element in the collection, the fetch request will return an empty array
        break;
      }
      cursor = result.data.at(-1).id;

      if(count++ >= 200) {  // each request will return at most 50 elements
        console.warn("Aborting link fetch after 10000 elements. Consider moving links into subcollections.");
        break;
      }
    }

    return {success: true, data: allLinks, additionalData: collectionId};
  }

  async fetchTags(): Promise<ApiReturnType<Tag[]>> {
    try {
      const response = await fetch(`${this.host}/api/v1/tags`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        credentials: "omit",
      });
      const data: FetchTagsResponse = await response.json();
      if(response.status !== 200) {
        throw 'Could not fetch tags: ' + data.response;
      }
      const result: Tag[] = data.response.map((value) => ({id: value.id, name: value.name}));
      return {success: true, data: result};
    } catch (error) {
      console.error('Error fetching tags: ', error);
      return {success: false, data: error.message};
    }
  }

  async saveLink(link: NewLink): Promise<ApiReturnType<any>> {
    try {
      const request: CreateLinkRequest = {name: link.title, url: link.url, type: "url", collection: {id: +(link.collectionId)}, tags: link.tags.map((value) => ({name: value}))};
      const response = await fetch(`${this.host}/api/v1/links`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        credentials: "omit",
        body: JSON.stringify(request),
      });
      const data = await response.json();
      if(response.status !== 200) {
        throw 'Could not save link: ' + data.response;
      }
      return { success: true, data: data.response };
    } catch (error) {
      console.error('Error saving link: ', error);
      return { success: false, data: error.message };
    }
  }

  async deleteLink(linkId: number): Promise<ApiReturnType<any>> {
    try {
      const response = await fetch(`${this.host}/api/v1/links/${linkId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        credentials: "omit",
      });
      const data = await response.json();
      if(response.status !== 200) {
        throw 'Could not delete link: ' + data.response;
      }
      return { success: true, data: data.response };
    } catch (error) {
      console.error('Error deleting link: ', error);
      return { success: false, data: error.message };
    }
  }

  async updateLink(
    link: NewLink,
    collectionOwnerId: string
  ): Promise<ApiReturnType<any>> {
    try {
      const request: UpdateLinkRequest = {id: +(link.id), name: link.title, url: link.url, collection: {id: +(link.collectionId), ownerId: +(collectionOwnerId)}, tags: link.tags.map((value) => ({name: value}))};
      const response = await fetch(`${this.host}/api/v1/links/${link.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        credentials: "omit",
        body: JSON.stringify(request),
      });
      const data = await response.json();
      if(response.status !== 200) {
        throw 'Could not update link: ' + data.response;
      }
      return { success: true, data: data.response };
    } catch (error) {
      console.error('Error updating link: ', error);
      return { success: false, data: error.message };
    }
  }

  async fetchAllLinksFromAllFolders(): Promise<ApiReturnType<LinksByFolder|any>> {
    const folders = await this.fetchFolders();
    let allLinks = {};

    if(!folders.success) {
      return { success: false, data: folders.data };
    }
    try {
      const allData = await Promise.all(folders.data.map((folder) => this.fetchLinks(folder.id)));

      allData.forEach((data) => {
        if (!data.success) {
          throw data.data;
        }
        allLinks[data.additionalData] = data.data;
      });

      return {success: true, data: allLinks};
    } catch (error) {
      console.error('Error fetching links: ', error);
      return {success: false, data: error.message};
    }
  }

  async createFolder(
    name: string,
    parentId: number
  ): Promise<ApiReturnType<any>> {
    try {
      const request: CreateFolderRequest = {name: name, parentId: +parentId};
      const response = await fetch(`${this.host}/api/v1/collections`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        credentials: "omit",
        body: JSON.stringify(request),
      });
      const data = await response.json();
      if(response.status !== 200) {
        throw 'Could not create folder: ' + data.response;
      }
      return { success: true, data: data.response };
    } catch (error) {
      console.error('Error creating collection: ', error);
      return { success: false, data: error.message };
    }
  }

  async updateFolder(
    id: number,
    name: string,
    parentId: number,
  ): Promise<ApiReturnType<any>> {
    try {
      const oldData = await this._fetchFolderData(id);
      if(!oldData.success) {
        throw 'Could not fetch old collection data: ' + oldData.data;
      }
      // fetch the old folder data first and only update the necessary fields
      // this avoids resetting fields that have been set in the Linkwarden Dashboard
      // also, for some reason this API endpoint needs all fields to be set, not only the updated ones
      const request: UpdateFolderRequest = {...oldData.data, id: +id, name: name, parentId: parentId == 0 ? 'root' : +parentId};
      const response = await fetch(`${this.host}/api/v1/collections/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        credentials: "omit",
        body: JSON.stringify(request),
      });
      const data = await response.json();
      if(response.status !== 200) {
        throw 'Could not update collection: ' + data.response;
      }
      return { success: true, data: data.response };
    } catch (error) {
      console.error('Error creating collection: ', error);
      return { success: false, data: error.message };
    }
  }

  async deleteFolder(collectionId: number): Promise<ApiReturnType<any>> {
    try {
      const response = await fetch(`${this.host}/api/v1/collections/${collectionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        credentials: "omit",
      });
      const data = await response.json();
      if(response.status !== 200) {
        throw 'Could not delete folder: ' + data.response;
      }
      return { success: true, data: data.response };
    } catch (error) {
      console.error('Error deleting link: ', error);
      return { success: false, data: error.message };
    }
  }
}
