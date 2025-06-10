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
  isDarkMode: boolean;
}

export const AddLinkModal = ({
  newLink,
  allTags,
  allFolders,
  handleNewLinkChange,
  handleTagChange,
  saveNewLink,
  closeAddLinkModal,
  isDarkMode,
}: Props) => {
  const allTagOptions = allTags.map((tag) => ({value: tag.id, label: tag.name}));
  const selectedTags = allTagOptions.filter((tag) => newLink.tags.includes(tag.label))
  const sortedFolders: Folder[] = allFolders.map((folder) =>
    ({id: folder.id, name: getFullPathName(allFolders, folder), ownerId: folder.ownerId, createdAt: folder.createdAt, parentId: folder.parentId})
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-1">
      <div
        className={`rounded-lg w-full max-w-md ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
        }`}
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
                className={`w-full px-1 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-black'
                }`}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-xs font-medium mb-1">
                Title
              </label>
              <input
                type="text"
                id="name"
                name="name"
                maxLength={2048}
                value={newLink.title}
                onChange={handleNewLinkChange}
                className={`w-full px-1 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-black'
                }`}
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
                  className={`w-full px-1 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-black'
                  }`}
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
            {allTags.length > 0 && (
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
                  styles={{control: (styles) => ({
                    ...styles,
                    backgroundColor: isDarkMode ? '#4a5568' : 'white',
                    borderColor: isDarkMode ? '#718096' : '#e2e8f0',
                    color: isDarkMode ? 'white' : '#black',
                  }), dropdownIndicator: (styles) => ({
                    ...styles,
                    color: isDarkMode ? 'white' : '#black',
                  }), clearIndicator: (styles) => ({
                    ...styles,
                    color: isDarkMode ? 'white' : '#black',
                  }), placeholder: (styles) => ({
                    ...styles,
                    color: isDarkMode ? 'white' : '#black',
                  }), option: (styles, {data, isDisabled, isFocused, isSelected}) => ({
                    ...styles,
                    backgroundColor: isFocused
                      ? isDarkMode ? '#2d3748' : '#e2e8f0'
                      : isDarkMode ? '#4a5568' : 'white',
                    borderColor: isDarkMode ? '#718096' : '#e2e8f0',
                    color: isDarkMode ? 'white' : '#black',
                    fontSize:'0.75rem'
                  }), multiValueLabel: (styles) => ({
                    ...styles,
                    backgroundColor: isDarkMode ? '#2d3748' : '#edf2f7',
                    borderColor: isDarkMode ? '#718096' : '#e2e8f0',
                    color: isDarkMode ? 'white' : '#black',
                    fontSize:'0.75rem'
                  }),  multiValueRemove: (styles) => ({
                    ...styles,
                    backgroundColor: isDarkMode ? '#2d3748' : '#edf2f7',
                    borderColor: isDarkMode ? '#718096' : '#e2e8f0',
                    color: isDarkMode ? 'white' : '#black',
                    ':hover': {
                      backgroundColor: isDarkMode ? '#1a202c' : '#e2e8f0',
                    }
                  }), menu: (styles) => ({
                    ...styles,
                    backgroundColor: isDarkMode ? '#4a5568' : 'white',
                  }), input: (styles) => ({
                    ...styles,
                    color: isDarkMode ? 'white' : 'black',
                    fontSize:'0.875rem'
                  })}}
                />
              </div>
            )}
          </div>
          <div className="mt-1 flex justify-end space-x-3">
            <button
              type="button"
              onClick={closeAddLinkModal}
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
