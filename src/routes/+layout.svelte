<script>
	import { onMount } from 'svelte';
	import Reveal from 'reveal.js';
	import Markdown from 'reveal.js/plugin/markdown/markdown.esm';

	import 'reveal.js/dist/reveal.css';
	import 'reveal.js/dist/theme/night.css';
	import '../app.pcss';

	onMount(function () {
		let deck = new Reveal({
			plugins: [Markdown]
		});
		deck.initialize({
			hash: true
		});
	});
</script>

<div class="reveal">
	<div class="slides">
		<slot></slot>
	</div>
</div>

<style class="scss">
	@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100..900&display=swap');

	div.reveal > div.slides {
		font-family:
			ui-sans-serif,
			system-ui,
			sans-serif,
			'Noto Sans KR' 'Apple Color Emoji',
			'Segoe UI Emoji',
			'Segoe UI Symbol',
			'Noto Color Emoji';
	}
</style>
