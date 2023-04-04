<script lang="ts">
	import { goto } from '$app/navigation';
	import Banner from '@smui/banner';
	import Button from '@smui/button';

	const actions = {
		[0]: 'Tasks',
		[1]: 'New feature',
		[2]: 'Logout'
	};
</script>

<Banner open autoClose={false}>
	<svelte:fragment slot="actions">
		<div style="display: flex;">
			<Button on:click={() => goto('tasks')}>{actions[0]}</Button>
			<Button on:click={() => goto('new-feature')}>{actions[1]}</Button>
			<Button on:click={() => goto('login')} style="text-align: end;">{actions[2]}</Button>
		</div>
	</svelte:fragment>
</Banner>
<slot />
