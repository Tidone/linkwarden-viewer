import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, RefreshCcw, FolderPlus, Settings } from 'lucide-react';
import { BarLoader } from 'react-spinners';
import Button from '@mui/material/Button';
import { AddLinkModal } from './components/AddLinkModal';
import { FolderStructure } from './components/FolderStructure';
import { SearchResults } from './components/SearchResults';
import { getBrowser, getCurrentTabInfo, getStorageItem, openOptions, setStorageItem } from '../utils/utils';
import { IconButton } from '@mui/material';
import { DeleteFolderModal } from './components/DeleteFolderModal';
import { AddFolderModal } from './components/AddFolderModal';
import { Folder, Link, NewLink, Tag } from '../utils/interfaces';
import { ApiReturnType } from '../service-worker/bookmark-manager-service';

const Popup = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [linksByFolder, setLinksByFolder] = useState<Link[][]>([]);
  const [openFolders, setOpenFolders] = useState(new Set<number>());
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [showEditLinkModal, setShowEditLinkModal] = useState(false);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [showEditFolderModal, setShowEditFolderModal] = useState(false);
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);
  const [newFolder, setNewFolder] = useState<Folder>({
    id: 0,
    name: '',
    createdAt: '',
    ownerId: 0
  });
  const [newLink, setNewLink] = useState<NewLink>({
    id: 0,
    url: '',
    title: '',
    collectionId: 0,
    tags: [],
  });
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasValidConfiguration, setHasValidConfiguration] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [linkSort, setLinkSort] = useState("name_ascending");
  const [folderSort, setFolderSort] = useState("name_ascending");
  const [openLinksInNewTab, setOpenLinksInNewTab] = useState(false);
  const updateInterval = 60000; //update links for open folders every 60 seconds if the popup is open

  const loadAllLinks = useCallback(() => {
    console.log("Updating all links");
    setIsLoading(true);
    getBrowser().runtime.sendMessage({action: 'fetchAllLinksFromAllFolders'}).then((links: ApiReturnType<Link[][]>) => {
      console.log("loadAllLinks -> linksByFolder: " + JSON.stringify(links));
      setStorageItem('lastUpdate', Date.now());
      if(links && links.success && links.data) {
        setLinksByFolder(links.data);
        setStorageItem('linksByFolder', links.data);
      }
      return getBrowser().runtime.sendMessage({action: 'fetchFolders'});
    }).then((folders: ApiReturnType<Folder[]>) => {
      console.log("loadAllLinks -> allFolders: " + JSON.stringify(folders));
      if(folders && folders.success && folders.data) {
        setFolders(folders.data);
        setStorageItem('allFolders', folders.data);
      }
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    let timerId;
    console.log('Popup Loaded');

    getBrowser().runtime.sendMessage({action: 'hasValidConfiguration'}).then(setHasValidConfiguration);

    getStorageItem('sortLinks').then(setLinkSort);
    getStorageItem('sortFolders').then(setFolderSort);
    getStorageItem('openFolders').then((openFoldersTemp) => {
      console.log("Open Folders: " + JSON.stringify(openFoldersTemp));
      if(openFoldersTemp) {
        setOpenFolders(new Set(openFoldersTemp));
      }
    });
    getStorageItem('openNewTab').then(setOpenLinksInNewTab);

    getStorageItem('linksByFolder').then((linksByFolderTemp) => {
      if(linksByFolderTemp) {
        setLinksByFolder(linksByFolderTemp);
      }
      return getStorageItem('allFolders');  // these Promises should be resolved in this order to avoid overwriting the states in the wrong order
    }).then((foldersTemp) => {
      if(foldersTemp) {
        setFolders(foldersTemp);
      }
      return getStorageItem('lastUpdate');
    }).then((lastUpdateTemp) => {
      // this has to be the last Promise to be resolved to make sure the API call overwrites the cached values
      // otherwise this could lead to wrong states if the API call is for some reason faster than the storage read
      if(!!lastUpdateTemp) {
        if (Date.now() - lastUpdateTemp >= updateInterval) {
          console.log("Should update all links");
          setTimeout(() => loadAllLinks(), 100);  // we have to defer the call to make sure host and token are set
        }
      }
      else {
        console.log("lastUpdate not set - Should update all links");
        setTimeout(() => loadAllLinks(), 100);
      }
    });

    timerId = setInterval(() => loadAllLinks(), updateInterval);

    const darkModeMediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)',
    );
    setIsDarkMode(darkModeMediaQuery.matches);

    const listener = (e) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener("change", listener);

    return () => {
      darkModeMediaQuery.removeEventListener("change", listener);
      clearInterval(timerId);
    };
  }, [loadAllLinks]);

  const openAddLinkModal = useCallback(() => {
    getCurrentTabInfo().then((tabinfo) => {
      const unorganized = folders.find(
        (folder) => folder.name === 'Unorganized',
      );
      setNewLink({
        url: tabinfo.url,
        title: tabinfo.title || '',
        collectionId: unorganized ? unorganized.id : folders[0]?.id ?? 0,
        tags: [],
        id: 0,
      });

      return getBrowser().runtime.sendMessage({action: 'fetchTags'});
    }).then((tags: ApiReturnType<Tag[]>) => {
      if(tags.success && tags.data) {
        setAllTags(tags.data);
      }
      setShowAddLinkModal(true);
    });
  }, [folders]);

  const openAddFolderModal = useCallback(() => {
    setNewFolder({
      id: 0,
      name: '',
      createdAt: '',
      ownerId: 0,
      parentId: 0,
    });

    getBrowser().runtime.sendMessage({action: 'fetchFolders'}).then((newFolders: ApiReturnType<Folder[]>) => {
      if(newFolders.success && newFolders.data) {
        setFolders(newFolders.data);
      }
      setShowAddFolderModal(true);
    });
  }, []);

  const loadLinksForFolder = useCallback((folderId: number) => {
    console.log("loadLinksForFolder");
    setIsLoading(true);
    getBrowser().runtime.sendMessage({action: 'fetchLinks', collectionId: folderId}).then((links: ApiReturnType<Link[]>) => {
      if (links.success && links.data) {
        setLinksByFolder((prev) => {
          const newLinksByFolder = ({
            ...prev,
            [folderId]: links.data,
          });
          setStorageItem('linksByFolder', newLinksByFolder);
          console.log("loadLinksForFolder -> linksByFolder:" + JSON.stringify(newLinksByFolder));
          return newLinksByFolder;
        });
      }
      setIsLoading(false);
    });
  }, []);

  const toggleFolder = useCallback(
    (folderId: number) => {
      setOpenFolders((prevOpenFolders) => {
        const newOpenFolders = new Set(prevOpenFolders);
        if (newOpenFolders.has(folderId)) {
          newOpenFolders.delete(folderId);
        } else {
          newOpenFolders.add(folderId);
          loadLinksForFolder(folderId);
        }
        setStorageItem('openFolders', Array.from(newOpenFolders));
        return newOpenFolders;
      });
    },
    [loadLinksForFolder],
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };


  const filteredLinks = Object.values(linksByFolder).flat().filter(
    (link: { name: string; url: string; tags?: { name: string }[] }) =>
      link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (link.tags &&
        link.tags.some((tag) =>
          tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )),
  );

  const closeAddLinkModal = () => {
    setShowAddLinkModal(false);
  };

  const closeEditLinkModal = () => {
    setShowEditLinkModal(false);
  };

  const closeAddFolderModal = () => {
    setShowAddFolderModal(false);
  };

  const closeDeleteFolderModal = () => {
    setShowDeleteFolderModal(false);
  };

  const closeEditFolderModal = () => {
    setShowEditFolderModal(false);
  };

  const handleNewLinkChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setNewLink({ ...newLink, [e.target.name]: e.target.value });
  };

  const handleNewFolderChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setNewFolder({ ...newFolder, [e.target.name]: e.target.value });
  };

  const handleTagChange = (newTags: string[]) => {
    console.log("handleTagChange: " + newTags);
    newTags.forEach((newTag) => {
      if(newTag.length <= 50 && allTags.filter((tag) => tag.name === newTag).length == 0) { // tag names can have a max length of 50 characters
        setAllTags((prevAllTags) => {
          let newAllTags = [...prevAllTags, {id: 0, name: newTag}];
          return newAllTags;
        });
      }
    });
    setNewLink({ ...newLink, tags: newTags });
  };

  const saveNewLink = (e: React.FormEvent) => {
    e.preventDefault();
    getBrowser().runtime.sendMessage({action: 'saveLink', link: newLink}).then((result: ApiReturnType<any>) => {
      if (result.success) {
          closeAddLinkModal();
          if(newLink.collectionId > 0) {
            loadLinksForFolder(newLink.collectionId);
          } else {
            loadAllLinks();
          }
        } else {
          alert('Error saving link. Please try again.');
        }
    });
  };

  const saveNewFolder = (e: React.FormEvent) => {
    e.preventDefault();
    getBrowser().runtime.sendMessage({action: 'createFolder', name: newFolder.name, parentId: newFolder.parentId}).then((result: ApiReturnType<any>) => {
      if (result.success) {
          closeAddFolderModal();
          loadAllLinks();
        } else {
          alert('Error saving folder. Please try again.');
        }
    });
  };

  const openEditLinkModal = useCallback((link: NewLink) => {
    setNewLink(link);

    getBrowser().runtime.sendMessage({action: 'fetchTags'}).then((tags: ApiReturnType<Tag[]>) => {
      if (tags.success && tags.data) {
        setAllTags(tags.data);
      }
      setShowEditLinkModal(true);
    });
  }, []);

  const openEditFolderModal = useCallback((folder: Folder) => {
    setNewFolder(folder);

    getBrowser().runtime.sendMessage({action: 'fetchFolders'}).then((newFolders: ApiReturnType<Folder[]>) => {
      if(newFolders.success && newFolders.data) {
        setFolders(newFolders.data);
      }
      setShowEditFolderModal(true);
    });
  }, []);

  const openDeleteFolderModal = useCallback((folder: Folder) => {
    setNewFolder(folder);
    setShowDeleteFolderModal(true);
  }, []);

  const saveEditLink = (e: React.FormEvent) => {
    e.preventDefault();
    getBrowser().runtime.sendMessage({action: 'updateLink', data: newLink, collectionOwnerId: folders.filter((folder) => folder.id == newLink.collectionId)[0].ownerId}).then((response: ApiReturnType<any>) => {
      if (response.success) {
        closeEditLinkModal();
        loadAllLinks();
      } else {
        alert('Error updating link. Please try again.');
      }
    });
  };

  const saveEditFolder = (e: React.FormEvent) => {
    e.preventDefault();
    getBrowser().runtime.sendMessage({action: 'updateFolder', id: newFolder.id, name: newFolder.name, parentId: newFolder.parentId ?? 0}).then((response: ApiReturnType<any>) => {
      if (response.success) {
        closeEditFolderModal();
        loadAllLinks();
      } else {
        alert('Error updating folder. Please try again.');
      }
    });
  };

  const openLinkwarden = () => {
    getStorageItem('host').then((host) => {
      getBrowser().tabs.create({'url': host});
    });
  };

  const isAnyModalShown = showAddLinkModal || showDeleteFolderModal || showEditLinkModal || showAddFolderModal || showEditFolderModal;

  if(hasValidConfiguration) {
    return (
      <div
        className={`w-[500px] ${isAnyModalShown ? 'h-[500px]' : ''} p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}
      >
        <div className="flex items-center">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search links..."
              value={searchQuery}
              onChange={handleSearch}
              className={`w-full pl-10 pr-4 py-2 rounded-md border text-sm ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-black'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
          <button
            onClick={openAddLinkModal}
            title='Add link'
            className={`ml-2 p-2 rounded-md ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <Plus size={20} />
          </button>
          <button
            onClick={openAddFolderModal}
            title='Add new folder'
            className={`ml-2 p-2 rounded-md ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <FolderPlus size={20} />
          </button>
          <button
            onClick={loadAllLinks}
            title='Refresh'
            className={`ml-2 p-2 rounded-md ${
              isDarkMode
                ? 'bg-gray-800 hover:bg-gray-700'
                : 'bg-gray-200 hover:bg-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-gray-500`}
          >
            <RefreshCcw size={20} />
          </button>
          <button
            onClick={openOptions}
            title='Open Settings'
            className={`ml-2 p-2 rounded-md ${
              isDarkMode
                ? 'bg-gray-800 hover:bg-gray-700'
                : 'bg-gray-200 hover:bg-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-gray-500`}
          >
            <Settings size={20} />
          </button>
          <IconButton
            onClick={openLinkwarden}
            title='Open LinkWarden Dashboard'
            className={`ml-2 p-2 rounded-md ${
              isDarkMode
                ? 'bg-gray-800 hover:bg-gray-700'
                : 'bg-gray-200 hover:bg-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-gray-500`}
          >
            <img src='/assets/icon-48.png' width='32' height='32' alt='Open Linkwarden' />
          </IconButton>
        </div>
        <div className="flex justify-center mb-4 h-[4px]">
          <BarLoader width={"350px"} loading={isLoading} color={isDarkMode ? '#9d9d9d': '#000000'} />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {searchQuery ? (
            <SearchResults
              links={filteredLinks}
              loadLinksForFolder={loadLinksForFolder}
              isDarkMode={isDarkMode}
              sortLinks={linkSort}
              showEditLinkModal={openEditLinkModal}
              canShowOverlayButtons={!isAnyModalShown}
              openLinksInNewTab={openLinksInNewTab}
            />
          ) : (
            <FolderStructure
              folders={folders}
              openFolders={openFolders}
              toggleFolder={toggleFolder}
              linksByFolder={linksByFolder}
              isDarkMode={isDarkMode}
              loadLinksForFolder={loadLinksForFolder}
              sortLinks={linkSort}
              sortFolders={folderSort}
              showEditLinkModal={openEditLinkModal}
              showEditFolderModal={openEditFolderModal}
              showDeleteFolderModal={openDeleteFolderModal}
              canShowOverlayButtons={!isAnyModalShown}
              openLinksInNewTab={openLinksInNewTab}
            />
          )}
        </div>
        {showAddLinkModal && (
          <AddLinkModal
            newLink={newLink}
            allTags={allTags}
            allFolders={folders}
            handleNewLinkChange={handleNewLinkChange}
            handleTagChange={handleTagChange}
            saveNewLink={saveNewLink}
            closeAddLinkModal={closeAddLinkModal}
            isDarkMode={isDarkMode}
          />
        )}
        {showEditLinkModal && (
          <AddLinkModal
            newLink={newLink}
            allTags={allTags}
            allFolders={folders}
            handleNewLinkChange={handleNewLinkChange}
            handleTagChange={handleTagChange}
            saveNewLink={saveEditLink}
            closeAddLinkModal={closeEditLinkModal}
            isDarkMode={isDarkMode}
          />
        )}
        {showAddFolderModal && (
          <AddFolderModal
            newFolder={newFolder}
            allFolders={folders}
            handleNewFolderChange={handleNewFolderChange}
            saveNewFolder={saveNewFolder}
            closeAddFolderModal={closeAddFolderModal}
            isDarkMode={isDarkMode}
          />
        )}
        {showDeleteFolderModal && (
          <DeleteFolderModal
            folder={newFolder}
            refreshData={loadAllLinks}
            closeModal={closeDeleteFolderModal}
            isDarkMode={isDarkMode}
          />
        )}
        {showEditFolderModal && (
          <AddFolderModal
            newFolder={newFolder}
            allFolders={folders}
            handleNewFolderChange={handleNewFolderChange}
            saveNewFolder={saveEditFolder}
            closeAddFolderModal={closeEditFolderModal}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    );
  }
  else {
    return (
    <div style={{textAlign:"center"}} className={`w-96 p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div style={{fontSize:"16px"}}>Please configure the extension first!</div>
      <br></br>
      <Button variant="contained" onClick={openOptions}>Open Options</Button>
    </div>
    );
  }
};

export default Popup;
