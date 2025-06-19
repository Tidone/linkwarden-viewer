import { Folder, Link, NewLink, Tag } from "../utils/interfaces";

export interface ApiReturnType<T> {
    success: boolean;
    data: T;
}

export interface BookmarkManagerService {
    fetchAllLinksFromAllFolders(): Promise<ApiReturnType<{}>>;
    fetchFolders(): Promise<ApiReturnType<Folder[]>>;
    fetchLinks(collectionId: number): Promise<ApiReturnType<Link[]>>;
    fetchTags(): Promise<ApiReturnType<Tag[]>>;
    saveLink(link: NewLink): Promise<ApiReturnType<any>>;
    updateLink(
        link: NewLink,
        collectionOwnerId: string
    ): Promise<ApiReturnType<any>>;
    deleteLink(linkId: number): Promise<ApiReturnType<any>>;
    createFolder(
        name: string,
        parentId: number
    ): Promise<ApiReturnType<any>>;
    updateFolder(
        id: number,
        name: string,
        parentId: number,
    ): Promise<ApiReturnType<any>>;
    deleteFolder(collectionId: number): Promise<ApiReturnType<any>>;
}
