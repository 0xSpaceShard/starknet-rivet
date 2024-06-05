import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

//@ts-ignore
const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  name: 'starknet_rivet',
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'img/logo-16.png',
    32: 'img/logo-34.png',
    48: 'img/logo-48.png',
    128: 'img/logo-128.png',
  },
  action: {
    default_popup: 'popup.html',
    default_icon: 'img/logo-48.png',
  },
  options_page: 'options.html',
  devtools_page: 'devtools.html',
  background: {
    service_worker: 'build/src/background/index.js',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['build/src/contentScript/index.js', 'build/src/contentScript/inpage.js'],
      run_at: "document_start",
      all_frames: true,
    },
  ],
  side_panel: {
    default_path: 'sidepanel.html',
  },
  web_accessible_resources: [
    {
      resources: ['img/logo-16.png', 'img/logo-34.png', 'img/logo-48.png', 'img/logo-128.png', 'contentScript.js', 'inpage.js', 'assets/*' ],
      matches: ["<all_urls>"],
    },
  ],
  permissions: ['storage', 'activeTab', 'tabs', 'scripting', 'http://localhost:3000/*', 'http://localhost:3000/referral/', 'http://localhost:3000'],
  chrome_url_overrides: {
    newtab: 'newtab.html',
  },
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
  },
})
