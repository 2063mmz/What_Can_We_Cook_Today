import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Bundled OFL pixel faces, used when the preferred licensed fonts are not
// installed on the user's system. See README for the font story.
import '@fontsource/silkscreen/400.css';
import '@fontsource/silkscreen/700.css';
import '@fontsource/press-start-2p/400.css';

import './styles/tokens.css';
import './styles/global.css';
import './styles/components.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
