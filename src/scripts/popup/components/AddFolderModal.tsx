import { Folder } from '@/scripts/utils/interfaces';
import { getFullPathName, getParentFolder } from '@/scripts/utils/utils';
import React from 'react';

interface Props {
  newFolder: Folder;
  allFolders: Folder[];
  handleNewFolderChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  saveNewFolder: (e: React.FormEvent) => void;
  closeAddFolderModal: () => void;
  isDarkMode: boolean;
}

export const AddFolderModal = ({
  newFolder,
  allFolders,
  handleNewFolderChange,
  saveNewFolder,
  closeAddFolderModal,
  isDarkMode,
}: Props) => {

  // Filter out any folders that have the edited folder as an extended parent to make sure we don't move a folder into a child of itself.
  // The Linkwarden API has no extended feasibility checks and would allow this, but it would completely break the Linkwarden dashboard.
  // This is a naiive implementation of an algorithm to filter out all children of the folder.
  // An optimized version could be implemented by storing all extended parents for every folder and then checking if the target folder is in any of the arrays.
  // However, since we only need this check once when we are editing a folder, we don't really have to optimize this.
  const checkParentsForPotentialLoop = (folder: Folder, targetId: number) => {
    if(folder.id === targetId) {
      return false;
    }
    if(!!folder.parentId) {
      const parentFolder = getParentFolder(allFolders, folder);
      return checkParentsForPotentialLoop(parentFolder, targetId);
    }
    return true;
  };

  const filteredFolders = newFolder.id !== 0 ? allFolders.filter((folder) => checkParentsForPotentialLoop(folder, newFolder.id)) : allFolders;
  const sortedFolders: Folder[] = filteredFolders.map((folder) =>
     ({id: folder.id, name: getFullPathName(allFolders, folder), ownerId: folder.ownerId, createdAt: folder.createdAt, parentId: folder.parentId})
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-1">
      <div
        className={`rounded-lg w-full max-w-md ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
        }`}
      >
        <form onSubmit={saveNewFolder} className="p-1">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                maxLength={2048}
                value={newFolder.name}
                onChange={handleNewFolderChange}
                className={`w-full px-1 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-black'
                }`}
                placeholder="Folder Name"
              />
            </div>
            {sortedFolders.length > 0 && (
              <div>
                <label
                  htmlFor="parentId"
                  className="block text-sm font-medium mb-1"
                >
                  Parent Folder
                </label>
                <select
                  id="parentId"
                  name="parentId"
                  value={newFolder.parentId ?? 0}
                  onChange={handleNewFolderChange}
                  required
                  className={`w-full px-1 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option key={0} value={0}></option>
                  {sortedFolders
                    .map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
          <div className="mt-1 flex justify-end space-x-3">
            <button
              type="button"
              onClick={closeAddFolderModal}
              className={`px-1 py-1 border rounded-md text-sm font-medium ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-1 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
