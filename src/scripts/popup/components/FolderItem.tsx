import { FolderOpen, Folder, ChevronRight, Trash2, Edit3 } from 'lucide-react';
import React, { useEffect } from 'react';
import { LinkItem } from './LinkItem';
import { Folder as FolderInterface, Link, NewLink } from '@/scripts/utils/interfaces';
import { IconWeight } from '@phosphor-icons/react';
import FolderIcon from './FolderIcon';

interface Props {
  folder: FolderInterface;
  openFolders: Set<number>;
  toggleFolder: (id: number) => void;
  links: Link[];
  subFolders: FolderInterface[];
  renderFolder: (folder: FolderInterface) => React.JSX.Element;
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

  const FallbackIcon = ({isOpen}) => (isOpen ? <FolderOpen size={20} color={folder.color} className="mr-2" /> : <Folder size={20} color={folder.color} className="mr-2" />);

  return (
    <div className="mb-2">
      <div
        className={'flex items-center p-2 rounded-md cursor-pointer relative group transition-colors duration-200 bg-white hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'}
        onClick={() => toggleFolder(folder.id)}
        style={{
          backgroundImage: `linear-gradient(to right, ${folder.color}20 0%, #FFFFFF00 25%)`,
        }}
      >
        {folder.icon && (
          <FolderIcon
            icon={folder.icon}
            weight={(folder.iconWeight || "regular") as IconWeight}
            isOpen={isOpen}
            size={20}
            color={folder.color}
            className="mr-2"
          />
        ) ||
          <FallbackIcon isOpen={isOpen} />
        }

        <span className="flex-grow text-sm truncate">{folder.name}</span>
        <ChevronRight
          size={20}
          className={`text-gray-400 transform transition-transform ${isOpen ? 'rotate-90' : ''}`}
        />
        {canShowOverlayButtons && (
          <div className='absolute top-0 right-[20px] z-10 h-full flex mr-4'>
            <div className='m-auto space-x-2'>
              <button
                className={'text-gray-400 bg-gray-200/90 dark:bg-gray-700/90 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200'}
                title="Edit folder"
                onClick={(e) => {
                  e.stopPropagation();
                  showEditFolderModal(folder);
                }}
              >
                <Edit3 size={20} />
              </button>
              <button
                className={'text-gray-400 bg-gray-200/90 dark:bg-gray-700/90 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200'}
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
