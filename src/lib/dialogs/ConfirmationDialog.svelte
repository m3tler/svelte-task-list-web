<script lang="ts">
	import Button, { Label } from '@smui/button';
	import Dialog, { Actions, Title } from '@smui/dialog';

	export let open: boolean = false;
	export let title: string = '';
</script>

<Dialog bind:open aria-labelledby="simple-title" aria-describedby="simple-content">
	<Title id="simple-title">{title}</Title>
	<Actions>
		<Button on:click={() => (open = false)}>
			<Label>Nie</Label>
		</Button>
		<Button on:click>
			<Label>Tak</Label>
		</Button>
	</Actions>
</Dialog>
