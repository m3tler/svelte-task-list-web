<script lang="ts">
	import Button, { Label } from '@smui/button';
	import Dialog, { Actions, Content, Title } from '@smui/dialog';

	export let open: boolean = false;
	export let title: string = '';
	export let message: string = '';
</script>

<Dialog bind:open aria-labelledby="simple-title" aria-describedby="simple-content">
	<Title id="simple-title">{title}</Title>
	<Content>{message}</Content>
	<Actions>
		<Button on:click={() => (open = false)}>
			<Label>Ok</Label>
		</Button>
	</Actions>
</Dialog>
