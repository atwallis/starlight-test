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
						{ label: 'Quickstart', slug: 'quickstart' },
						{ label: 'Run the Visual Editor', slug: 'visual-editor' },
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
						{ label: 'Create a Database Table', slug: 'guides/database-table' },
						{ label: 'Create a Standard Endpoint', slug: 'guides/standard-endpoint' },
						{ label: 'Create a Custom Endpoint', slug: 'guides/custom-endpoint' }
					]
				},
			{
				label: 'Reference',
				items: [
					{ label: 'Config', slug: 'reference/config' },
					{ label: 'Filter', slug: 'reference/filter' },
					{ label: 'Schema', slug: 'reference/schema' },
					{
						label: 'Endpoints',
						collapsed: true,
						items: [
							{ label: 'Overview', slug: 'reference/endpoints/overview' },
							{ label: 'Parameters', slug: 'reference/endpoints/parameters' },
							{ label: 'Responses', slug: 'reference/endpoints/responses' },
							{ label: 'SQL Queries', slug: 'reference/endpoints/sql-queries' },
							{ label: 'Custom Routes', slug: 'reference/endpoints/custom-routes' },
							{ label: 'Permissions', slug: 'reference/endpoints/permissions' }
						]
					},
					{
						label: 'Database',
						collapsed: true,
						items: [
							{ label: 'Tables', slug: 'reference/database/tables' },
							{ label: 'Columns & Types', slug: 'reference/database/columns' },
							{ label: 'Indexes & Foreign Keys', slug: 'reference/database/relationships' },
							{ label: 'Constraints', slug: 'reference/database/constraints' },
							{ label: 'Notifications', slug: 'reference/database/notifications' },
							{ label: 'Permissions', slug: 'reference/database/permissions' }
						]
					}
				]
			},
				{
					label: 'Community',
					autogenerate: { directory: 'community' }
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
