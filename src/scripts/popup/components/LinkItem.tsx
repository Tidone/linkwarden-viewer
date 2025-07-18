import { ApiReturnType } from '@/scripts/service-worker/bookmark-manager-service';
import { Link, NewLink } from '@/scripts/utils/interfaces';
import { getBrowser } from '@/scripts/utils/utils';
import { Edit3, Trash2 } from 'lucide-react';
import React, { MouseEventHandler, useState } from 'react';

interface Props {
  link: Link;
  refreshData: () => void;
  showEditLinkModal: (link: NewLink) => void;
  canShowOverlayButtons: boolean;
  openLinksInNewTab: boolean;
  showCollectionName?: boolean;
}

const MouseButtons = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2
};

export const LinkItem = ({
  link,
  refreshData,
  showEditLinkModal,
  canShowOverlayButtons,
  openLinksInNewTab,
  showCollectionName = false,
}: Props) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    getBrowser().runtime.sendMessage({action: 'deleteLink', id: link.id}).then((response: ApiReturnType<any>) => {
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

  const onMouseUp: MouseEventHandler<HTMLDivElement> = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!event.target || event.detail > 1) {
      return;
    }
    event.preventDefault();

    switch(event.button) {
      case MouseButtons.LEFT:
        if(event.ctrlKey || event.metaKey || openLinksInNewTab) {
          getBrowser().tabs.create({'url': link.url});
        } else {
          getBrowser().tabs.update({'url': link.url});
        }
        break;
      case MouseButtons.MIDDLE:
        getBrowser().tabs.create({'url': link.url});
        break;
    }
  }

  return (
    <div
      className={'flex flex-col p-2 rounded-md mb-2 relative group bg-white dark:bg-gray-800'}
    >
      <div className='cursor-pointer' onMouseUp={onMouseUp}>
        <div className="flex items-center text-sm">
          <img src={`https://icons.duckduckgo.com/ip3/${new URL(link.url).hostname}.ico`} width={16} height={16} loading='lazy' className='mr-1' />
          <div className='truncate'>
            {link.name}
          </div>
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
      </div>
      {showConfirmDelete && (
        <div
          className={'absolute inset-0 bg-white/90 dark:bg-gray-800/90 flex items-center justify-center'}
        >
          <div className="text-center text-sm">
            <p className="mb-1">Are you sure you want to delete this link?</p>
            <button
              onClick={confirmDelete}
              className="px-3 py-1 bg-red-500 text-white rounded-md mr-2 hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={cancelDelete}
              className={'px-3 py-1 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}
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
            className={'text-gray-400 bg-white/90 dark:bg-gray-800/90 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200'}
            title="Edit link"
          >
            <Edit3 size={24} />
          </button>
            <button
              onClick={handleDelete}
              className={'text-gray-400 bg-white/90 dark:bg-gray-800/90 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200'}
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
