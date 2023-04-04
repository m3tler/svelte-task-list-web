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
	import Textfield from '@smui/textfield';
	import FormField from '@smui/form-field';
	import { addTask, deleteTasks, getTasks, editTask } from './service';
	import type { Task } from './service';
	import Dialog, { Title, Content, Actions } from '@smui/dialog';

	export let data;
	let tasks: Task[] = data.content;
	let rowsPerPage = 5;
	let currentPage = 0;
	let lastPage = data.totalPages - 1;
	let selectedTasksIds: number[] = [];
	let sort: keyof Task = 'id';
	let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';
	let activeTab = 'Wszystkie';
	let search = {
		name: '',
		done: true,
		todo: true,
		from: '',
		to: ''
	};
	let isDeleteDialogOpen = false;
	let isAddDialogOpen = false;
	let taskToAdd: Task = {
		id: 0,
		name: '',
		done: false,
		deadline: ''
	};
	let isEditDialogOpen = false;
	let taskToEdit: Task = {
		id: 0,
		name: '',
		done: false,
		deadline: ''
	};
	let isErrorDialogOpen = false;
	let errorMessage = '';

	$: currentPage, rowsPerPage, sort, activeTab, search, isDeleteDialogOpen, isAddDialogOpen, isEditDialogOpen;

	$: if (currentPage + 1 > lastPage) {
		currentPage = lastPage;
	}

	let searchParams = new Map<string, string>();
	$: {
		isDeleteDialogOpen;
		isAddDialogOpen;
		isEditDialogOpen;
		isErrorDialogOpen;

		searchParams.clear();
		searchParams.set('page', currentPage.toString());
		searchParams.set('size', rowsPerPage.toString());
		searchParams.set('sortBy', sort);
		searchParams.set('sortOrder', sortDirection === 'ascending' ? 'asc' : 'desc');
		searchParams.set('name', search.name.toLowerCase());

		if (activeTab === 'Wykonane') {
			search.done = true;
			search.todo = true;
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

		if (search.done == true && search.todo == false) {
			searchParams.set('done', 'true');
		} else if (search.done == false && search.todo == true) {
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

		getAllTasks();
	}

	function getAllTasks() {
		getTasks(searchParams)
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

	function addNewTask() {
		addTask(taskToAdd)
			.then((response) => {
				if (response.ok) {
					return response.json();
				}
				throw new Error('Błąd podczas zapisywania danych');
			})
			.then(() => {
				taskToAdd = {
					id: 0,
					name: '',
					done: false,
					deadline: ''
				};
				isAddDialogOpen = false;
			})
			.catch((error) => {
				console.log(error);
				errorMessage = error;
				isErrorDialogOpen = true;
			});
	}

	function modifyTask() {
		editTask(taskToEdit)
			.then((response) => {
				if (response.ok) {
					return response.json();
				}
				throw new Error('Błąd podczas edytowania danych');
			})
			.then(() => {
				isEditDialogOpen = false;
			})
			.catch((error) => {
				console.log(error);
				errorMessage = error;
				isErrorDialogOpen = true;
			});
	}

	function deleteSelectedTasks() {
		deleteTasks(selectedTasksIds)
			.then(() => {
				selectedTasksIds = [];
				isDeleteDialogOpen = false;
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

	function changeDone() {
		if (search.done == true) {
			search.todo = true;
		}
	}

	function changeTodo() {
		if (search.todo == true) {
			search.done = true;
		}
	}

	function resetSearchFilters() {
		search.name = '';
		search.done = true;
		search.todo = true;
		search.from = '';
		search.to = '';
	}

	function isTerminate(date: Date) {
		return new Date(date).getTime() < Date.now();
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
<div style="margin-bottom: 16px;">
	<Button variant="raised" on:click={() => (isAddDialogOpen = true)}>Dodaj</Button>
	<Button
		variant="raised"
		on:click={() => {
			isDeleteDialogOpen = selectedTasksIds.length != 0;
		}}>Usuń</Button
	>
</div>

<!-- SEARCHING BAR -->
<div style="margin-bottom: 8px; vertical-align: middle;">
	<Textfield
		type="search"
		class="shaped-outlined"
		variant="outlined"
		bind:value={search.name}
		label="Nazwa"
		style="min-width: 300px; margin-right: 8px;"
	/>
	<FormField>
		<Checkbox bind:checked={search.done} on:click={changeDone} disabled={activeTab === 'Wykonane'} />
		<span slot="label">Wykonane</span>
	</FormField>
	<FormField style="margin-right: 8px;">
		<Checkbox bind:checked={search.todo} on:click={changeTodo} disabled={activeTab === 'Wykonane'} />
		<span slot="label">Do zrobienia</span>
	</FormField>
	<Textfield type="date" class="shaped-outlined" variant="outlined" bind:value={search.from} label="Od" />
	<Textfield
		type="date"
		class="shaped-outlined"
		variant="outlined"
		bind:value={search.to}
		label="Do"
		style="margin-right: 8px;"
	/>
	<Button on:click={resetSearchFilters}>Wyczyść</Button>
</div>

<!-- DATA TABLE -->
<DataTable
	sortable
	bind:sort
	bind:sortDirection
	on:SMUIDataTable:sorted={() => getTasks(searchParams)}
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
<Dialog bind:open={isAddDialogOpen} aria-labelledby="simple-title" aria-describedby="simple-content">
	<Title id="simple-title">Dodawanie zadania</Title>
	<Content>
		<div>
			<Textfield
				bind:value={taskToAdd.name}
				label="Nazwa"
				style="min-width: 300px; margin-top: 8px; margin-bottom: 8px;"
			/>
		</div>
		<div>
			<Textfield type="datetime-local" bind:value={taskToAdd.deadline} label="Termin" style="margin-bottom: 8px;" />
		</div>
		<div>
			<FormField>
				<Checkbox bind:checked={taskToAdd.done} />
				<span slot="label">Wykonane</span>
			</FormField>
		</div>
	</Content>
	<Actions>
		<Button on:click={() => (isAddDialogOpen = false)}>
			<Label>Cofnij</Label>
		</Button>
		<Button on:click={() => addNewTask()}>
			<Label>Dodaj</Label>
		</Button>
	</Actions>
</Dialog>

<!-- EDIT DIALOG -->
<Dialog bind:open={isEditDialogOpen} aria-labelledby="simple-title" aria-describedby="simple-content">
	<Title id="simple-title">Edytowanie zadania</Title>
	<Content>
		<div>
			<Textfield
				bind:value={taskToEdit.name}
				label="Nazwa"
				style="min-width: 300px; margin-top: 8px; margin-bottom: 8px;"
			/>
		</div>
		<div>
			<Textfield type="datetime-local" bind:value={taskToEdit.deadline} label="Termin" style="margin-bottom: 8px;" />
		</div>
		<div>
			<FormField>
				<Checkbox bind:checked={taskToEdit.done} />
				<span slot="label">Wykonane</span>
			</FormField>
		</div>
	</Content>
	<Actions>
		<Button on:click={() => (isEditDialogOpen = false)}>
			<Label>Cofnij</Label>
		</Button>
		<Button on:click={() => modifyTask()}>
			<Label>Edytuj</Label>
		</Button>
	</Actions>
</Dialog>

<!-- DELETE DIALOG -->
<Dialog bind:open={isDeleteDialogOpen} aria-labelledby="simple-title" aria-describedby="simple-content">
	<Title id="simple-title">Czy chcesz usunąć zaznaczone zadania?</Title>
	<Actions>
		<Button on:click={() => (isDeleteDialogOpen = false)}>
			<Label>Nie</Label>
		</Button>
		<Button on:click={() => deleteSelectedTasks()}>
			<Label>Tak</Label>
		</Button>
	</Actions>
</Dialog>

<!-- ERROR DIALOG -->
<Dialog bind:open={isErrorDialogOpen} aria-labelledby="simple-title" aria-describedby="simple-content">
	<Title id="simple-title">Wystąpił bład</Title>
	<Content>{errorMessage}</Content>
	<Actions>
		<Button on:click={() => (isErrorDialogOpen = false)}>
			<Label>Ok</Label>
		</Button>
	</Actions>
</Dialog>
