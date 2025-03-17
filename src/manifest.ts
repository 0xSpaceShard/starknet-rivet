import { defineManifest } from '@crxjs/vite-plugin';
import packageData from '../package.json';

// @ts-ignore
// const isDev = process.env.NODE_ENV === 'development';

export default defineManifest({
  name: packageData.displayName,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'icons/icon16.png',
    32: 'icons/icon32.png',
    48: 'icons/icon48.png',
    128: 'icons/icon128.png',
  },
  action: {
    default_popup: 'popup.html',
    default_icon: 'icons/icon48.png',
  },
  background: {
    service_worker: 'build/src/background/index.js',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['build/src/contentScript/index.js', 'build/src/contentScript/inpage.js'],
      run_at: 'document_start',
      all_frames: true,
    },
  ],
  side_panel: {
    default_path: 'sidepanel.html',
  },
  web_accessible_resources: [
    {
      resources: [
        'icons/icon16.png',
        'icons/icon32.png',
        'icons/icon48.png',
        'icons/icon128.png',
        'contentScript.js',
        'inpage.js',
        'assets/*',
      ],
      matches: ['<all_urls>'],
    },
  ],
  permissions: ['storage', 'alarms'],
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
  },
});
