import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Starknet Rivet',
  tagline: 'Starknet Devnet Wallet for Developers',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  // TODO: Check if we're going to have a site
  url: 'https://starknet-rivet.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  // TODO: Check if we're going to do it like this
  baseUrl: '/starknet-rivet/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: '0xSpaceShard', // Usually your GitHub org/user name.
  projectName: 'starknet-rivet', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    // image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Home',
      logo: {
        alt: 'Starknet Rivet Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          label: 'Guide',
          docId: 'getting_started',
          type: 'doc',
          position: 'left',
        },
        {
          label: 'GitHub',
          href: 'https://github.com/0xSpaceShard/starknet-rivet',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Guide',
              to: '/docs/getting_started',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Twitter',
              href: 'https://x.com/0xSpaceShard',
            },
            {
              label: 'Discord',
              // TODO: Check if we're going to create a Discord for Rivet
              href: 'TBD',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/0xSpaceShard/starknet-rivet',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} SpaceShard`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
