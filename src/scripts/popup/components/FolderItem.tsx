import { FolderOpen, Folder, ChevronRight, Trash2, Edit3 } from 'lucide-react';
import React, { useEffect } from 'react';
import { LinkItem } from './LinkItem';
import { Folder as FolderInterface, Link, NewLink } from '@/scripts/utils/interfaces';

interface Props {
  folder: FolderInterface;
  openFolders: Set<number>;
  toggleFolder: (id: number) => void;
  links: Link[];
  subFolders: FolderInterface[];
  renderFolder: (folder: FolderInterface) => React.JSX.Element;
  isDarkMode: boolean;
  loadLinksForFolder: (id: number) => void;
  sortLinks: string;
  showEditLinkModal: (link: NewLink) => void;
  showEditFolderModal: (folder: FolderInterface) => void;
  showDeleteFolderModal: (folder: FolderInterface) => void;
  canShowOverlayButtons: boolean;
  openLinksInNewTab: boolean;
}

export const FolderItem = ({
  folder,
  openFolders,
  toggleFolder,
  links,
  subFolders,
  renderFolder,
  isDarkMode,
  loadLinksForFolder,
  sortLinks,
  showEditLinkModal,
  showEditFolderModal,
  showDeleteFolderModal,
  canShowOverlayButtons,
  openLinksInNewTab,
}: Props) => {
  const isOpen: boolean = openFolders.has(folder.id);
  // set the sorting function depending on the parameter
  // do not pull the condition into the function to make sure the performance is not impacted when sorting a huge number of links
  const sortFunction = sortLinks == 'name_ascending'
    ? (a: Link, b: Link) => a.name.localeCompare(b.name)
    : sortLinks == 'name_descending'
      ? (a: Link, b: Link) => b.name.localeCompare(a.name)
      : sortLinks == 'date_ascending'
        ? (a: Link, b: Link) => new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf()
        : (a: Link, b: Link) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf();
  const sortedLinks = [...links].sort(sortFunction);

  useEffect(() => {
    if (isOpen && links.length === 0) {
      // this doesn't seem to work
      loadLinksForFolder(folder.id);
    }
  }, [isOpen, folder.id, links.length, loadLinksForFolder]);

  return (
    <div className="mb-2">
      <div
        className={`flex items-center p-2 rounded-md cursor-pointer relative group ${
          isDarkMode
            ? 'bg-gray-800 hover:bg-gray-700'
            : 'bg-white hover:bg-gray-200'
        }`}
        onClick={() => toggleFolder(folder.id)}
      >
        {isOpen ? (
          <FolderOpen size={20} className="mr-2 text-blue-500" />
        ) : (
          <Folder size={20} className="mr-2 text-blue-500" />
        )}
        <span className="flex-grow text-sm truncate">{folder.name}</span>
        <ChevronRight
          size={20}
          className={`text-gray-400 transform transition-transform ${isOpen ? 'rotate-90' : ''}`}
        />
        {canShowOverlayButtons && (
          <div className='absolute top-0 right-[20px] z-10 h-full flex mr-4'>
            <div className='m-auto space-x-2'>
              <button
                className={`text-gray-400 ${isDarkMode ? 'bg-gray-700/90' : 'bg-gray-200/90'} hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                title="Edit folder"
                onClick={(e) => {
                  e.stopPropagation();
                  showEditFolderModal(folder);
                }}
              >
                <Edit3 size={20} />
              </button>
              <button
                className={`text-gray-400 ${isDarkMode ? 'bg-gray-700/90' : 'bg-gray-200/90'} hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                title="Delete folder"
                onClick={(e) => {
                  e.stopPropagation();
                  showDeleteFolderModal(folder);
                }}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
      {isOpen && (
        <div className="ml-4 mt-2">
          {subFolders.map(renderFolder)}
          {sortedLinks.map((link) => (
            <LinkItem
              key={link.id}
              link={link}
              refreshData={() => loadLinksForFolder(folder.id)}
              isDarkMode={isDarkMode}
              showEditLinkModal = {showEditLinkModal}
              canShowOverlayButtons = {canShowOverlayButtons}
              openLinksInNewTab = {openLinksInNewTab}
            />
          ))}
        </div>
      )}
    </div>
  );
};
