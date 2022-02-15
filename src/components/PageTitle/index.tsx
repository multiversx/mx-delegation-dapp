import React, { useEffect, memo } from 'react';

const withPageTitle = (title: string, Component: React.ComponentType) => () => {
  const Memoized = memo(Component);
  const setDocumentTitle = () => {
    document.title = title;
  };

  useEffect(setDocumentTitle, []);

  return <Memoized />;
};

export default withPageTitle;
