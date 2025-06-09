interface Link {
    id: number;
    name: string;
    url: string;
    createdAt: string;
    tags: Tag[];
    folder: Folder;
}

interface Tag {
    id: number;
    name: string;
}

interface Folder {
    id: number;
    name: string;
    ownerId: number;
    parentId?: number;
    createdAt: string;
}

interface NewLink {
    id: number;
    url: string;
    title: string;
    collectionId: number;
    tags: string[];
}
