// @ts-check
import starlight from '@astrojs/starlight';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import starlightThemeGalaxy from 'starlight-theme-galaxy';

// https://astro.build/config
export default defineConfig({
	site: 'https://atwallis.com',
	base: '/starlight-test',
	integrations: [
		starlight({
			title: 'Restura',
			components: {
				PageFrame: './src/components/PageFrame.astro'
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/atwallis/starlight-test' }],
			sidebar: [
				{
					label: 'Start Here',
					items: [
						{ label: 'Getting Started', slug: 'getting-started' },
						{ label: 'FAQ', slug: 'faq' }
					]
				},
				{
					label: 'Tutorials',
					autogenerate: { directory: 'tutorials' }
				},
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', slug: 'guides/example' }
					]
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' }
				}
			],
			customCss: ['./src/styles/global.css'],
			plugins: [starlightThemeGalaxy()]
		}),
		svelte()
	],

	vite: {
		plugins: [tailwindcss()]
	}
});
