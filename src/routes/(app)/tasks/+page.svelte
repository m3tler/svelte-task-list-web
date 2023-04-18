<script lang="ts">
	import DataTable, { Head, Body, Row, Cell, Pagination, SortValue } from '@smui/data-table';
	import Select, { Option } from '@smui/select';
	import IconButton from '@smui/icon-button';
	import { Label } from '@smui/common';
	import Checkbox from '@smui/checkbox';
	import Tab from '@smui/tab';
	import TabBar from '@smui/tab-bar';
	import { format } from 'date-fns';
	import Button from '@smui/button';
	import { PUBLIC_API_URL } from '$env/static/public';
	import TextField from '$lib/components/TextField.svelte';
	import AlertDialog from '$lib/dialogs/AlertDialog.svelte';
	import ConfirmationDialog from '$lib/dialogs/ConfirmationDialog.svelte';
	import type { Task } from '$lib/types';
	import EditTaskDialog from '$lib/dialogs/task/EditTaskDialog.svelte';
	import AddTaskDialog from '$lib/dialogs/task/AddTaskDialog.svelte';
	import { setContext } from 'svelte';

	export let data;
	setContext('sign', data.userSign);

	let tasks: Task[] = data.tasks.content;
	let rowsPerPage = 5;
	let currentPage = 0;
	let lastPage = data.tasks.totalPages - 1;
	let searchName = '';
	let searchFrom = '';
	let searchTo = '';
	let selectedTasksIds: number[] = [];
	let sort: keyof Task = 'id';
	let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';
	let activeTab = 'Wszystkie';
	let searchDoneOptions = ['Wszystkie', 'Wykonane', 'Do zrobienia'];
	let search = {
		name: '',
		done: searchDoneOptions[0],
		from: '',
		to: ''
	};
	let isDeleteDialogOpen = false;
	let isAddDialogOpen = false;
	let isEditDialogOpen = false;
	let taskToEdit: Task = {
		id: 0,
		name: '',
		done: false,
		deadline: ''
	};
	let isErrorDialogOpen = false;
	let errorMessage = '';
	let time: any;
	let trigger: boolean = false;

	$: if (currentPage + 1 > lastPage) {
		currentPage = lastPage;
	}

	let searchParams = new Map<string, string>();
	$: {
		trigger;
		searchParams.clear();
		searchParams.set('page', currentPage.toString());
		searchParams.set('size', rowsPerPage.toString());
		searchParams.set('sortBy', sort);
		searchParams.set('sortOrder', sortDirection === 'ascending' ? 'asc' : 'desc');
		searchParams.set('name', search.name.toLowerCase());

		if (activeTab === 'Wykonane') {
			search.done = 'Wszystkie';
			searchParams.set('done', 'true');
		}

		if (activeTab === 'Oczekujące') {
			searchParams.set('done', 'false');
			searchParams.set('from', format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"));
		}

		if (activeTab === 'Przeterminowane') {
			searchParams.set('done', 'false');
			searchParams.set('to', format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"));
		}

		if (search.done == searchDoneOptions[1]) {
			searchParams.set('done', 'true');
		} else if (search.done == searchDoneOptions[2]) {
			searchParams.set('done', 'false');
		}

		if (search.from != '' && search.to != '' && new Date(search.to) < new Date(search.from)) {
			search.to = search.from;
		}

		if (search.from != '') {
			searchParams.set('from', format(new Date(search.from), "yyyy-MM-dd'T'HH:mm:ss"));
		}

		if (search.to != '') {
			searchParams.set('to', format(new Date(search.to), "yyyy-MM-dd'T'HH:mm:ss"));
		}

		getTasks();
	}

	async function getTasks() {
		const params = new URLSearchParams(Array.from(searchParams.entries())).toString();

		const options = {
			headers: {
				Authorization: 'Basic ' + data.userSign
			}
		};

		await fetch(PUBLIC_API_URL + '/tasks?' + params, options)
			.then((response) => {
				if (response.ok) {
					return response.json();
				}
				throw new Error('Błąd podczas wczytywania danych');
			})
			.then((data) => {
				tasks = data.content;
				currentPage = data.pageable.pageNumber;
				rowsPerPage = data.pageable.pageSize;
				lastPage = data.totalPages - 1 >= 0 ? data.totalPages - 1 : 0;
			})
			.catch((error) => {
				console.log(error);
				errorMessage = error;
				isErrorDialogOpen = true;
			});
	}

	async function editTask(task: any) {
		await fetch(PUBLIC_API_URL + '/tasks/' + task.id, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Basic ' + data.userSign
			},
			body: JSON.stringify(task)
		})
			.then((response) => {
				if (response.ok) {
					return response.json();
				}
				throw new Error('Błąd podczas edytowania danych');
			})
			.then(() => {
				isEditDialogOpen = false;
				update();
			})
			.catch((error) => {
				console.log(error);
				errorMessage = error;
				isErrorDialogOpen = true;
			});
	}

	async function deleteTasks() {
		await fetch(PUBLIC_API_URL + '/tasks/' + selectedTasksIds.join(','), {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Basic ' + data.userSign
			}
		})
			.then((response) => {
				if (response.ok) {
					return;
				}
				throw new Error('Błąd podczas usuwania danych');
			})
			.then(() => {
				selectedTasksIds = [];
				isDeleteDialogOpen = false;
				update();
			})
			.catch((error) => {
				console.log(error);
				errorMessage = error;
				isErrorDialogOpen = true;
			});
	}

	function changeSelection(id: number) {
		if (selectedTasksIds.includes(id)) selectedTasksIds.splice(selectedTasksIds.indexOf(id), 1);
		else selectedTasksIds.push(id);
	}

	function resetSearchFilters() {
		search.name = '';
		searchName = '';
		search.done = 'Wszystkie';
		search.from = '';
		searchFrom = '';
		search.to = '';
		searchTo = '';
	}

	function isTerminate(date: Date) {
		return new Date(date).getTime() < Date.now();
	}

	function executeAfterTime(fun: Function, duration: number) {
		clearTimeout(time);
		time = setTimeout(fun, duration);
	}

	function update() {
		trigger = !trigger;
	}
</script>

<!-- TABS -->
<div style="margin-bottom: 16px;">
	<TabBar tabs={['Wszystkie', 'Wykonane', 'Oczekujące', 'Przeterminowane']} let:tab bind:active={activeTab}>
		<Tab {tab}>
			<Label>{tab}</Label>
		</Tab>
	</TabBar>
</div>

<!-- ADD AND DELETE ACTIONS -->
<div style="margin-bottom: 8px;">
	<Button variant="raised" on:click={() => (isAddDialogOpen = true)}>Dodaj</Button>
	<Button
		variant="raised"
		on:click={() => {
			isDeleteDialogOpen = selectedTasksIds.length != 0;
		}}>Usuń</Button
	>
</div>

<!-- SEARCHING BAR -->
<div style="display: flex; flex-direction: row; margin-bottom: 8px; height: 100%;">
	<div>
		<TextField
			type="search"
			bind:value={searchName}
			label="Nazwa"
			placeholder="Wprowadź nazwę"
			class="shaped-outlined"
			style="min-width: 300px; margin-right: 8px;"
			on:input={() =>
				executeAfterTime(() => {
					search.name = searchName;
					update();
				}, 500)}
		/>
	</div>
	<div style="display: inline-block; align-self: flex-end;">
		<div style="display: flex; flex-direction: row;">
			<div class="mdc-typography--caption" style="display: inline-block; align-self: center">Wykonane</div>
		</div>
		<Select bind:value={search.done} variant="outlined" style="margin-right: 8px;">
			{#each searchDoneOptions as value}
				<Option {value}>{value}</Option>
			{/each}
		</Select>
	</div>
	<div>
		<TextField
			type="datetime-local"
			bind:value={searchFrom}
			label="Od"
			class="shaped-outlined"
			style="margin-right: 8px;"
			on:input={() =>
				executeAfterTime(() => {
					search.from = searchFrom;
					update();
				}, 500)}
		/>
	</div>
	<div>
		<TextField
			type="datetime-local"
			bind:value={searchTo}
			label="Do"
			class="shaped-outlined"
			style="margin-right: 8px;"
			on:input={() =>
				executeAfterTime(() => {
					search.to = searchTo;
					update();
				}, 500)}
		/>
	</div>
	<Button on:click={resetSearchFilters} style="display: inline-block; align-self: flex-end;">Wyczyść filtry</Button>
</div>

<!-- DATA TABLE -->
<DataTable
	sortable
	bind:sort
	bind:sortDirection
	on:SMUIDataTable:sorted={update}
	table$aria-label="Todo list"
	style="width: 100%;"
>
	<Head>
		<Row>
			<Cell checkbox sortable={false} />
			<Cell columnId="name" style="width: 100%;">
				<Label>Nazwa</Label>
				<IconButton class="material-icons">arrow_upward</IconButton>
			</Cell>
			<Cell columnId="isDone" checkbox>
				<Label>Wykonane</Label>
				<IconButton class="material-icons">arrow_upward</IconButton>
			</Cell>
			<Cell columnId="deadline">
				<Label>Termin</Label>
				<IconButton class="material-icons">arrow_upward</IconButton>
			</Cell>
		</Row>
	</Head>
	<Body>
		{#each tasks as task (task.id)}
			<Row style="background-color: white; ">
				<Cell>
					<Checkbox value={task} valueKey={task.name} on:change={() => changeSelection(task.id)} />
					<Button
						color="secondary"
						variant="outlined"
						on:click={() => {
							taskToEdit = task;
							isEditDialogOpen = true;
						}}>Edytuj</Button
					>
				</Cell>
				<Cell
					style="color: {task.done == true
						? 'lightgreen'
						: isTerminate(new Date(task.deadline))
						? 'lightcoral'
						: 'black'};"
				>
					{task.name}
				</Cell>
				<Cell>
					<Checkbox bind:checked={task.done} on:change={() => editTask(task)} />
				</Cell>
				<Cell>{format(new Date(task.deadline), 'yyyy-MM-dd HH:mm:ss')}</Cell>
			</Row>
		{/each}
	</Body>

	<Pagination slot="paginate">
		<svelte:fragment slot="rowsPerPage">
			<Label>Rows Per Page</Label>
			<Select variant="outlined" bind:value={rowsPerPage} noLabel>
				<Option value={5}>5</Option>
				<Option value={10}>10</Option>
				<Option value={20}>20</Option>
			</Select>
		</svelte:fragment>
		<svelte:fragment slot="total">
			{currentPage + 1}-{lastPage + 1} of {lastPage + 1}
		</svelte:fragment>

		<IconButton
			class="material-icons"
			action="first-page"
			title="First page"
			on:click={() => (currentPage = 0)}
			disabled={currentPage === 0}>first_page</IconButton
		>
		<IconButton
			class="material-icons"
			action="prev-page"
			title="Prev page"
			on:click={() => currentPage--}
			disabled={currentPage === 0}>chevron_left</IconButton
		>
		<IconButton
			class="material-icons"
			action="next-page"
			title="Next page"
			on:click={() => currentPage++}
			disabled={currentPage === lastPage}>chevron_right</IconButton
		>
		<IconButton
			class="material-icons"
			action="last-page"
			title="Last page"
			on:click={() => (currentPage = lastPage)}
			disabled={currentPage === lastPage}>last_page</IconButton
		>
	</Pagination>
</DataTable>

<!-- ADD DIALOG -->
<AddTaskDialog bind:open={isAddDialogOpen} bind:trigger />

<!-- EDIT DIALOG -->
<EditTaskDialog bind:open={isEditDialogOpen} bind:task={taskToEdit} bind:trigger />

<!-- DELETE DIALOG -->
<ConfirmationDialog
	bind:open={isDeleteDialogOpen}
	title="Czy chcesz usunąć zaznaczone zadania?"
	on:click={() => deleteTasks()}
/>

<!-- ERROR DIALOG -->
<AlertDialog bind:open={isErrorDialogOpen} title="Wystąpił błąd" message={errorMessage} />
