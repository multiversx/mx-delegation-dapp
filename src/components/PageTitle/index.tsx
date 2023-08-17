import { useEffect, memo, ComponentType } from 'react';

const withPageTitle = (title: string, Component: ComponentType) => () => {
  const Memoized = memo(Component);
  const setDocumentTitle = () => {
    document.title = title;
  };

  useEffect(setDocumentTitle, []);

  return <Memoized />;
};

export default withPageTitle;
