import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, RefreshCw } from 'lucide-react';
import { getBrowser, getStorageItem, setStorageItem } from '../utils/utils';
import { ApiReturnType } from '../service-worker/bookmark-manager-service';
import { Folder, Link } from '../utils/interfaces';

const Options = () => {
  const [host, setHost] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<{isError: boolean; text: string;}>({isError: false, text: ''});
  const [showToken, setShowToken] = useState(false);
  const [linkSort, setLinkSort] = useState('name_ascending');
  const [folderSort, setFolderSort] = useState('name_ascending');
  const [openLinksInNewTab, setOpenLinksInNewTab] = useState(false);

  useEffect(() => {
    getStorageItem('host').then((value) => {
      if(value)
        setHost(value);
    });
    getStorageItem('token').then((value) => {
      if(value)
        setToken(value);
    });
    getStorageItem('sortLinks').then((value) => {
      if(value) {
        setLinkSort(value);
      }
    });
    getStorageItem('sortFolders').then((value) => {
      if(value) {
        setFolderSort(value);
      }
    });
    getStorageItem('openNewTab').then((value) => {
      if(value) {
        setOpenLinksInNewTab(value);
      }
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setStorageItem('host', host).then(() =>
      setStorageItem('token', token))
    .then(() =>
      setStorageItem('sortLinks', linkSort))
    .then(() =>
      setStorageItem('sortFolders', folderSort))
    .then(() =>
      setStorageItem('openNewTab', openLinksInNewTab))
    .then(() =>
      getBrowser().runtime.sendMessage({action: 'reload'})
    ).then(() => {
      setStatus({isError: false, text: 'Options saved successfully.'});
      setTimeout(() => setStatus({isError: false, text: ''}), 3000);
    });
  };

  const handleRefresh = () => {
    setStatus({isError: false, text: 'Refreshing data...'});

    getBrowser().runtime.sendMessage({action: 'fetchAllLinksFromAllFolders'})
    .then((links: ApiReturnType<Link[]>) => {
      console.log(links);
      if(!links.success) {
        setStatus({isError: true, text: 'Error refreshing data. Please check your settings.'});
        setTimeout(() => setStatus({isError: false, text: ''}), 3000);
        return;
      }
      if(links.data) {
        setStorageItem('linksByFolder', links.data);
      }
      return getBrowser().runtime.sendMessage({action: 'fetchFolders'});
    }).then((folders: ApiReturnType<Folder[]>) => {
      if(!folders.success) {
        setStatus({isError: true, text: 'Error refreshing data. Please check your settings.'});
        setTimeout(() => setStatus({isError: false, text: ''}), 3000);
        return;
      }
      if(folders.data) {
        setStorageItem('allFolders', folders.data);
      }
      setStatus({isError: false, text: 'Data refreshed successfully.'});
      setTimeout(() => setStatus({isError: false, text: ''}), 3000);
    }).catch(() => {
      setStatus({isError: true, text: 'Error refreshing data. Please check your settings.'});
      setTimeout(() => setStatus({isError: false, text: ''}), 3000);
    });
  };

  const toggleShowToken = () => setShowToken(!showToken);

  const inputClass = `mt-1 block w-full px-3 py-2 text-sm rounded-md shadow-sm transition duration-150 ease-in-out
    bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50
    dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring dark:focus:ring-blue-400 dark:focus:ring-opacity-50`;

  const labelClassNames = 'block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300';

  return (
    <div
      className={'min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white'}
    >
      <div
        className={'max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden'}
      >
        <div className="px-8 py-10">
          <h1
            className={'text-3xl font-bold text-center mb-8 text-blue-600 dark: text-blue-400'}
          >
            Linkwarden Viewer Options
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="host"
                className={labelClassNames}
              >
                Host
              </label>
              <input
                type="text"
                id="host"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                required
                className={inputClass}
                placeholder="https://your-linkwarden-host.com"
              />
            </div>
            <div>
              <label
                htmlFor="token"
                className={labelClassNames}
              >
                API Token
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type={showToken ? 'text' : 'password'}
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  className={`${inputClass} pr-10`}
                  placeholder="Your API token"
                />
                <button
                  type="button"
                  onClick={toggleShowToken}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showToken ? (
                    <EyeOff
                      className={'h-5 w-5 text-gray-500 dark:text-gray-400'}
                    />
                  ) : (
                    <Eye
                      className={'h-5 w-5 text-gray-500 dark:text-gray-400'}
                    />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="linkSort"
                className={labelClassNames}
              >
                Sort Links
              </label>
              <select
                name="linkSort"
                id="linkSort"
                value={linkSort}
                onChange={(e) => {setLinkSort(e.target.value)}}
                className={`w-full px-1 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm
                  bg-white border-gray-300 text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              >
                <option key="name_ascending" value="name_ascending">Name Ascending</option>
                <option key="name_descending" value="name_descending">Name Descending</option>
                <option key="date_ascending" value="date_ascending">Date Ascending</option>
                <option key="date_descending" value="date_descending">Date Descending</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="folderSort"
                className={labelClassNames}
              >
                Sort Folders
              </label>
              <select
                name="folderSort"
                id="folderSort"
                value={folderSort}
                onChange={(e) => {setFolderSort(e.target.value)}}
                className={`w-full px-1 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm
                  bg-white border-gray-300 text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              >
                <option key="name_ascending" value="name_ascending">Name Ascending</option>
                <option key="name_descending" value="name_descending">Name Descending</option>
                <option key="date_ascending" value="date_ascending">Date Ascending</option>
                <option key="date_descending" value="date_descending">Date Descending</option>
              </select>
            </div>
            <div className='flex space-x-4 pt-4'>
              <input
                type='checkbox'
                id='openLinksInNewTab'
                checked={openLinksInNewTab}
                onChange={(event) => setOpenLinksInNewTab(event.target.checked)}
              />
              <label
                htmlFor='openLinksInNewTab'
                className={labelClassNames}
              >
                Always open Links in new Tabs
              </label>
            </div>
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className={`flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm
                  font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`}
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                className={`flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm
                  font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 bg-green-600 hover:bg-green-700 focus:ring-green-500`}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </button>
            </div>
          </form>
          {status.text && (
            <div
              className={`mt-6 p-3 rounded-md text-center text-sm ${
                status.isError ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}
            >
              {status.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Options;
