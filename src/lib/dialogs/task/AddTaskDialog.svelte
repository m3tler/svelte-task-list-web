<script lang="ts">
	import AlertDialog from '../AlertDialog.svelte';
	import TextField from '$lib/components/TextField.svelte';
	import type { Task } from '$lib/types';
	import Button, { Label } from '@smui/button';
	import Checkbox from '@smui/checkbox';
	import Dialog, { Actions, Content, Title } from '@smui/dialog';
	import FormField from '@smui/form-field';
	import { getContext } from 'svelte';
	import { PUBLIC_API_URL } from '$env/static/public';

	export let open: boolean;
	export let trigger: boolean;
	let task: Task = {
		id: 0,
		name: '',
		deadline: '',
		done: false
	};

	const ERROR_MESSAGE = 'Błąd podczas zapisywania danych';
	let isError = false;

	const userSign = getContext('sign');

	async function addTask() {
		await fetch(PUBLIC_API_URL + '/tasks', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Basic ' + userSign
			},
			body: JSON.stringify({
				name: task.name,
				done: task.done,
				deadline: new Date(task.deadline)
			})
		})
			.then((response) => {
				if (response.ok) {
					return response.json();
				}
				throw new Error(ERROR_MESSAGE);
			})
			.then(() => {
				task = {
					id: 0,
					name: '',
					deadline: '',
					done: false
				};

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

<!-- ADD TASK DIALOG -->
<Dialog bind:open aria-labelledby="simple-title" aria-describedby="simple-content">
	<Title id="simple-title">Dodawanie zadania</Title>
	<Content>
		<div>
			<TextField
				bind:value={task.name}
				label="Nazwa"
				placeholder="Wprowadź nazwę"
				style="min-width: 300px; margin-bottom: 8px;"
			/>
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
		<Button on:click={addTask}>
			<Label>Dodaj</Label>
		</Button>
	</Actions>
</Dialog>

<!-- ALERT DIALOG -->
<AlertDialog bind:open={isError} title="Error" message={ERROR_MESSAGE} />
