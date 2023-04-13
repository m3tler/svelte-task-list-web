<script lang="ts">
	import Textfield from '@smui/textfield';
	import { Icon as CommonIcon } from '@smui/common';

	let className = '';
	export { className as class };
	export let style: string = '';
	export let value: string;
	export let type: string = '';
	export let label: string = '';
	export let labelIcon: string = '';
	export let name: string = '';
	export let placeholder: string = '';
</script>

<div style="display: flex; flex-direction: row;">
	{#if labelIcon != undefined}
		<CommonIcon
			class="material-icons"
			style="font-size: 1em; line-height: normal; vertical-align: top; margin-right: 4px; display: inline-block; align-self: center"
			>{labelIcon}</CommonIcon
		>
	{/if}
	{#if label != undefined}
		<div class="mdc-typography--caption" style="display: inline-block; align-self: center">{label}</div>
	{/if}
</div>
<Textfield
	{type}
	class={className}
	variant="outlined"
	bind:value
	noLabel={true}
	input$name={name}
	input$placeholder={placeholder}
	{style}
/>
