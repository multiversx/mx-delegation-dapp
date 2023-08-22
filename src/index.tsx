import { createRoot } from 'react-dom/client';

import { App } from './App';
import './index.css';
import './assets/sass/theme.scss';

(() => {
  const container = document.getElementById('root');
  const root = createRoot(container as HTMLElement);

  root.render(<App />);
})();
