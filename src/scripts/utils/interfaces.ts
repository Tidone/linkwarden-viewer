export interface Link {
    id: number;
    name: string;
    url: string;
    createdAt: string;
    tags: Tag[];
    folder: Folder;
}

export interface Tag {
    id: number;
    name: string;
}

export interface Folder {
    id: number;
    name: string;
    ownerId: number;
    parentId?: number;
    createdAt: string;
}

export interface NewLink {
    id: number;
    url: string;
    title: string;
    collectionId: number;
    tags: string[];
}
