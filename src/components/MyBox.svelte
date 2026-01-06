<script lang="ts">
	interface MyBoxProps {
		title: string;
	}

	let { title }: MyBoxProps = $props();
</script>

<div class="p-4 bg-accent/10 rounded border border-accent">
	<h3 class="text-accent font-bold mb-2">{title}</h3>
</div>
