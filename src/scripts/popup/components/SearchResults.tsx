import React from 'react';
import { LinkItem } from './LinkItem';

interface Props {
  links: Link[];
  refreshData: () => void;
  isDarkMode: boolean;
  sortLinks: string;
  showEditLinkModal: (link: NewLink) => void;
  canShowOverlayButtons: boolean;
}

export const SearchResults = ({
  links,
  refreshData,
  isDarkMode,
  sortLinks,
  showEditLinkModal,
  canShowOverlayButtons,
}: Props) => {
  // set the sorting function depending on the parameter
  // do not pull the condition into the function to make sure the performance is not impacted when sorting a huge number of links
  const sortFunction = sortLinks == 'name_ascending'
    ? (a, b) => a.name.localeCompare(b.name)
    : sortLinks == 'name_descending'
      ? (a, b) => b.name.localeCompare(a.name)
      : sortLinks == 'date_ascending'
        ? (a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
        : (a, b) => new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf();
  const sortedLinks = [...links].sort(sortFunction);

  return (
    <div>
      {sortedLinks.map((link) => (
        <LinkItem
          key={link.id}
          link={link}
          showCollectionName={true}
          refreshData={refreshData}
          isDarkMode={isDarkMode}
          showEditLinkModal={showEditLinkModal}
          canShowOverlayButtons={canShowOverlayButtons}
        />
      ))}
    </div>
  );
};
