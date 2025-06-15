export class LinkwardenService {
  host: string;
  token: string;

  constructor(host: string, token: string) {
    this.host = host;
    this.token = token;
  }

  async fetchFolders() {
    try {
      const response = await fetch(`${this.host}/api/v1/collections`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json();
      if(response.status !== 200) {
        throw 'Could not fetch folders: ' + data.response;
      }
      const result: Folder[] = data.response.map((value) => ({id: value.id, name: value.name, ownerId: value.ownerId, parentId: value.parentId, createdAt: value.createdAt}));
      return result;
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  }

  async _fetchFolder(id: number) {
    try {
      const response = await fetch(`${this.host}/api/v1/collections/${id}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json();
      if(response.status !== 200) {
        throw 'Could not fetch folders: ' + data.response;
      }
      return data.response;
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  }

  async _fetchLinksWithCursor(collectionId: number, cursor: number) {
    try {
      const response = await fetch(
        `${this.host}/api/v1/links?cursor=${cursor}&sort=0&collectionId=${collectionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      );
      const data = await response.json();
      if(response.status !== 200) {
        throw 'Could not fetch links: ' + data.response;
      }
      const result: Link[] = data.response.map((value) => ({
        id: value.id,
        name: value.name,
        url: value.url,
        createdAt: value.importDate || value.createdAt, // the importDate is set if an entry is imported into LinkWarden, it is the date when the link was saved the first time
        tags: value.tags.map((tag) => ({id: tag.id, name: tag.name})),
        folder: ({id: value.collection.id, name: value.collection.name, ownerId: value.collection.ownerId})
      }));
      return result;
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  }

  async fetchLinks(collectionId: number) {
    let cursor = 0;
    let count = 0;
    const allLinks: Link[] = [];

    while(true) {
      const result = await this._fetchLinksWithCursor(collectionId, cursor);
      allLinks.push(...result);
      if(result.length == 0) {  // if the cursor is past the last element in the collection, the fetch request will return an empty array
        break;
      }
      cursor = result.at(-1).id;

      if(count++ >= 200) {  // each request will return at most 50 elements
        console.warn("Aborting link fetch after 10000 elements. Consider moving links into subcollections.");
        break;
      }
    }

    return allLinks;
  }

  async fetchTags() {
    try {
      const response = await fetch(`${this.host}/api/v1/tags`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json();
      if(response.status !== 200) {
        throw 'Could not fetch tags: ' + data.response;
      }
      const result: Tag[] = data.response.map((value) => ({id: value.id, name: value.name}));
      return result;
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }

  async saveLink(link: {
    title: string;
    url: string;
    collectionId: number;
    tags: string[];
  }) {
    try {
      const request = {name: link.title, url: link.url, type: "url", collection: {id: +(link.collectionId)}, tags: link.tags.map((value) => ({id: +value}))};
      const response = await fetch(`${this.host}/api/v1/links`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      const data = await response.json();
      if(response.status !== 200) {
        throw 'Could not save link: ' + data.response;
      }
      return { success: true, data: data.response };
    } catch (error) {
      console.error('Error saving link:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteLink(linkId: number) {
    try {
      const response = await fetch(`${this.host}/api/v1/links/${linkId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json();
      if(response.status !== 200) {
        throw 'Could not delete link: ' + data.response;
      }
      return { success: true, data: data.response };
    } catch (error) {
      console.error('Error deleting link:', error);
      return { success: false, error: error.message };
    }
  }

  async updateLink(
    link: NewLink,
    collectionOwnerId: string
  ) {
    try {
      const request = {id: +(link.id), name: link.title, url: link.url, collection: {id: +(link.collectionId), ownerId: +(collectionOwnerId)}, tags: link.tags.map((value) => ({name: value}))};
      const response = await fetch(`${this.host}/api/v1/links/${link.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      const data = await response.json();
      if(response.status !== 200) {
        throw 'Could not update link: ' + data.response;
      }
      return { success: true, data: data.response };
    } catch (error) {
      console.error('Error updating link:', error);
      return { success: false, error: error.message };
    }
  }

  async fetchAllLinksFromAllFolders() {
    const folders = await this.fetchFolders();
    let allLinks = {};

    await Promise.all(
      folders.map(async (folder) => {
        const links = await this.fetchLinks(folder.id);
        allLinks[folder.id] = links;
      }),
    );
    return allLinks;
  }

  async createFolder(
    name: string,
    parentId: number
  ) {
    try {
      const request = {name: name, parentId: +parentId};
      const response = await fetch(`${this.host}/api/v1/collections`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      const data = await response.json();
      if(response.status !== 200) {
        throw 'Could not create folder: ' + data.response;
      }
      return { success: true, data: data.response };
    } catch (error) {
      console.error('Error creating collection:', error);
      return { success: false, error: error.message };
    }
  }

  async updateFolder(
    id: number,
    name: string,
    parentId: number,
  ) {
    try {
      const oldData = await this._fetchFolder(id);
      // fetch the old folder data first and only update the necessary fields
      // this avoids resetting fields that have been set in the Linkwarden Dashboard
      // also, for some reason this API endpoint needs all fields to be set, not only the updated ones
      const request = {...oldData, id: +id, name: name, parentId: parentId == 0 ? 'root' : +parentId};
      const response = await fetch(`${this.host}/api/v1/collections/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      const data = await response.json();
      if(response.status !== 200) {
        throw 'Could not update folder: ' + data.response;
      }
      return { success: true, data: data.response };
    } catch (error) {
      console.error('Error creating collection:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteFolder(collectionId: number) {
    try {
      const response = await fetch(`${this.host}/api/v1/collections/${collectionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json();
      if(response.status !== 200) {
        throw 'Could not delete folder: ' + data.response;
      }
      return { success: true, data: data.response };
    } catch (error) {
      console.error('Error deleting link:', error);
      return { success: false, error: error.message };
    }
  }
}
