<script lang="ts">
	import { PUBLIC_API_URL } from '$env/static/public';
	import TextField from '$lib/components/TextField.svelte';
	import type { Task } from '$lib/types';
	import Button, { Label } from '@smui/button';
	import Checkbox from '@smui/checkbox';
	import Dialog, { Actions, Content, Title } from '@smui/dialog';
	import FormField from '@smui/form-field';
	import AlertDialog from '../AlertDialog.svelte';
	import { getContext } from 'svelte';

	export let open: boolean;
	export let task: Task;
	export let trigger: boolean;

	const ERROR_MESSAGE: string = 'Błąd podczas edytowania danych';
	let isError: boolean = false;

	const userSign = getContext('sign');

	async function editTask() {
		await fetch(PUBLIC_API_URL + '/tasks/' + task.id, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Basic ' + userSign
			},
			body: JSON.stringify(task)
		})
			.then((response) => {
				if (response.ok) {
					return response.json();
				}
				throw new Error(ERROR_MESSAGE);
			})
			.then(() => {
				open = false;
				update();
			})
			.catch((error) => {
				console.log(error);
				isError = true;
			});
	}

	function update() {
		trigger = !trigger;
	}
</script>

<!-- EDIT DIALOG -->
<Dialog bind:open aria-labelledby="simple-title" aria-describedby="simple-content">
	<Title id="simple-title">Edytowanie zadania</Title>
	<Content>
		<div>
			<TextField bind:value={task.name} label="Nazwa" style="min-width: 300px; margin-bottom: 8px;" />
		</div>
		<div>
			<TextField type="datetime-local" bind:value={task.deadline} label="Termin" style="margin-bottom: 8px;" />
		</div>
		<div>
			<FormField>
				<Checkbox bind:checked={task.done} />
				<span slot="label">Wykonane</span>
			</FormField>
		</div>
	</Content>
	<Actions>
		<Button on:click={() => (open = false)}>
			<Label>Cofnij</Label>
		</Button>
		<Button on:click={() => editTask()}>
			<Label>Edytuj</Label>
		</Button>
	</Actions>
</Dialog>

<!-- ALERT DIALOG -->
<AlertDialog bind:open={isError} title="Error" message={ERROR_MESSAGE} />
