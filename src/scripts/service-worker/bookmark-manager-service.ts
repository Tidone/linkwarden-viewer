interface ApiReturnType {
    success: boolean;
    data?: any;
    error?: any;
}

interface BookmarkManagerService {
    fetchAllLinksFromAllFolders(): Promise<{}>;
    fetchFolders(): Promise<Folder[]>;
    fetchLinks(collectionId: number): Promise<Link[]>;
    fetchTags(): Promise<Tag[]>;
    saveLink(link: NewLink): Promise<ApiReturnType>;
    updateLink(
        link: NewLink,
        collectionOwnerId: string
    ): Promise<ApiReturnType>;
    deleteLink(linkId: number): Promise<ApiReturnType>;
    createFolder(
        name: string,
        parentId: number
    ): Promise<ApiReturnType>;
    updateFolder(
        id: number,
        name: string,
        parentId: number,
    ): Promise<ApiReturnType>;
    deleteFolder(collectionId: number): Promise<ApiReturnType>;
}
