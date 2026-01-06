// @ts-check
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  site: 'https://atwallis.com',
  base: '/starlight-test',
  integrations: [starlight({
      title: 'Restura',
      lastUpdated: true,
      components: {
        Footer: './src/components/Footer.astro',
      },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/atwallis/starlight-test' }],
      sidebar: [
          {
              label: 'Guides',
              items: [
                  // Each item here is one entry in the navigation menu.
                  { label: 'Example Guide', slug: 'guides/example' },
              ],
          },
          {
              label: 'Reference',
              autogenerate: { directory: 'reference' },
          },
      ],
      customCss: ['./src/styles/global.css'],
  }), svelte()],

  vite: {
    plugins: [tailwindcss()],
  },
});