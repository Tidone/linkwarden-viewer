import React from 'react';
import { LinkItem } from './LinkItem';
import { Link, NewLink } from '@/scripts/utils/interfaces';

interface Props {
  links: Link[];
  loadLinksForFolder: (id: number) => void;
  isDarkMode: boolean;
  sortLinks: string;
  showEditLinkModal: (link: NewLink) => void;
  canShowOverlayButtons: boolean;
  openLinksInNewTab: boolean;
}

export const SearchResults = ({
  links,
  loadLinksForFolder,
  isDarkMode,
  sortLinks,
  showEditLinkModal,
  canShowOverlayButtons,
  openLinksInNewTab,
}: Props) => {
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

  return (
    <div>
      {sortedLinks.map((link) => (
        <LinkItem
          key={link.id}
          link={link}
          showCollectionName={true}
          refreshData={() => loadLinksForFolder(link.folder.id)}
          isDarkMode={isDarkMode}
          showEditLinkModal={showEditLinkModal}
          canShowOverlayButtons={canShowOverlayButtons}
          openLinksInNewTab={openLinksInNewTab}
        />
      ))}
    </div>
  );
};
