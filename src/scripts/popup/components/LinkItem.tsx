import { getBrowser } from '@/scripts/utils/utils';
import { Edit3, LinkIcon, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface Props {
  link: Link;
  refreshData: () => void;
  isDarkMode: boolean;
  showEditLinkModal: (link: NewLink) => void;
  canShowOverlayButtons: boolean;
  showCollectionName?: boolean;
}

export const LinkItem = ({
  link,
  refreshData,
  isDarkMode,
  showEditLinkModal,
  canShowOverlayButtons,
  showCollectionName = false,
}: Props) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    getBrowser().runtime.sendMessage({action: 'deleteLink', id: link.id}).then((response) => {
      if (response.success) {
        refreshData();
      } else {
        alert('Error deleting link. Please try again.');
      }
    });
    setShowConfirmDelete(false);
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const tagsTexts = link.tags.map((tag) => tag.name).join(', ');


  return (
    <div
      className={`flex flex-col p-2 rounded-md mb-2 relative group ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <div className="flex items-center space-x-1">
        <img src={`https://icons.duckduckgo.com/ip3/${new URL(link.url).hostname}.ico`} width={16} height={16} loading='lazy' />
        <a
          href={link.url}
          target="_blank"
          title={link.name}
          rel="noopener noreferrer"
          className={`hover:underline flex-grow truncate ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}
        >
          {link.name}
        </a>
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span title={link.url} className="truncate max-w-[60%]">{link.url}</span>
        {link.tags && link.tags.length > 0 && (
          <span title={tagsTexts} className="truncate max-w-[40%] text-right">
            {tagsTexts}
          </span>
        )}
      </div>
      {showCollectionName && (
        <div className="text-xs text-gray-400 ">{link.folder.name}</div>
      )}
      {showConfirmDelete && (
        <div
          className={`absolute inset-0 ${
            isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
          } flex items-center justify-center`}
        >
          <div className="text-center">
            <p className="mb-1">Are you sure you want to delete this link?</p>
            <button
              onClick={confirmDelete}
              className="px-3 py-1 bg-red-500 text-white rounded-md mr-2 hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={cancelDelete}
              className={`px-3 py-1 rounded-md ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {!showConfirmDelete && canShowOverlayButtons &&(
        <div className='absolute top-0 right-0 z-1 h-full flex'>
          <div className='m-auto space-x-2'>
            <button
            onClick={() => showEditLinkModal({
              id: link.id,
              url: link.url,
              title: link.name,
              collectionId: link.folder.id,
              tags: link.tags.map((tag) => tag.name),
            })}
            className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-80 transition-opacity duration-200"
            title="Edit link"
          >
            <Edit3 size={24} />
          </button>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-80 transition-opacity duration-200"
              title="Delete link"
            >
              <Trash2 size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
