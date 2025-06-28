import { Folder, NewLink, Tag } from '@/scripts/utils/interfaces';
import { getFullPathName } from '@/scripts/utils/utils';
import React from 'react';
import CreatableSelect from 'react-select/creatable';

interface Props {
  newLink: NewLink;
  allTags: Tag[];
  allFolders: Folder[];
  handleNewLinkChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleTagChange: (e: string[]) => void;
  saveNewLink: (e: React.FormEvent) => void;
  closeAddLinkModal: () => void;
}

export const AddLinkModal = ({
  newLink,
  allTags,
  allFolders,
  handleNewLinkChange,
  handleTagChange,
  saveNewLink,
  closeAddLinkModal,
}: Props) => {
  const allTagOptions = allTags.map((tag) => ({value: tag.id, label: tag.name}));
  const selectedTags = allTagOptions.filter((tag) => newLink.tags.includes(tag.label))
  const sortedFolders: Folder[] = allFolders
    .map((folder) => ({...folder, name: getFullPathName(allFolders, folder)}))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-1">
      <div
        className={`rounded-lg w-full max-w-md bg-white text-black dark:bg-gray-800 dark:text-white`}
      >
        <form onSubmit={saveNewLink} className="p-1">
          <div className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-xs font-medium mb-1">
                URL
              </label>
              <input
                type="url"
                id="url"
                name="url"
                maxLength={2048}
                value={newLink.url}
                onChange={handleNewLinkChange}
                required
                className={`w-full px-1 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs
                  bg-white border-gray-300 text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label htmlFor="title" className="block text-xs font-medium mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                maxLength={2048}
                value={newLink.title}
                onChange={handleNewLinkChange}
                className={`w-full px-1 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs
                  bg-white border-gray-300 text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                placeholder="Link Title"
              />
            </div>
            {sortedFolders.length > 0 && (
              <div>
                <label
                  htmlFor="collectionId"
                  className="block text-xs font-medium mb-1"
                >
                  Folder
                </label>
                <select
                  id="collectionId"
                  name="collectionId"
                  value={newLink.collectionId}
                  onChange={handleNewLinkChange}
                  required
                  className={`w-full px-1 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs
                    bg-white border-gray-300 text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                >
                  {sortedFolders
                    .map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
            <div>
              <label
                htmlFor="tagIds"
                className="block text-xs font-medium mb-1"
              >
                Tags
              </label>
              <CreatableSelect
                isMulti
                name='tagIds'
                id='tagIds'
                options={allTagOptions}
                value={selectedTags}
                maxMenuHeight={120}
                onChange={(values) => {handleTagChange(values.map((value) => value.label))}}
                className='custom-react-select-container'
                classNamePrefix='custom-react-select'
              />
            </div>
          </div>
          <div className="mt-1 flex justify-end space-x-3">
            <button
              type="button"
              onClick={closeAddLinkModal}
              className={`px-1 py-1 border rounded-md text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-50
                dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-1 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
