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
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { Icon as CommonIcon } from '@smui/common';

	export let data;

	type Task = {
		id: number;
		name: string;
		done: boolean;
		deadline: string;
	};

	let tasks: Task[] = data.tasks.content;
	let rowsPerPage = 5;
	let currentPage = 0;
	let lastPage = data.tasks.totalPages - 1;
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

	async function addTask(task: Task) {
		await fetch(PUBLIC_API_URL + '/tasks', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Basic ' + data.userSign
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
		search.done = 'Wszystkie';
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
		<div style="display: flex; flex-direction: row;">
			<CommonIcon
				class="material-icons"
				style="font-size: 1em; line-height: normal; vertical-align: top; margin-right: 4px; display: inline-block; align-self: center"
				>abc</CommonIcon
			>
			<div class="mdc-typography--caption" style="display: inline-block; align-self: center">Nazwa</div>
		</div>
		<Textfield
			type="search"
			class="shaped-outlined"
			variant="outlined"
			bind:value={search.name}
			noLabel="true"
			input$placeholder="Wpisz nazwę"
			style="min-width: 300px; margin-right: 8px;"
		/>
	</div>
	<div style="display: inline-block; align-self: flex-end;">
		<div style="display: flex; flex-direction: row;">
			<CommonIcon
				class="material-icons"
				style="font-size: 1em; line-height: normal; vertical-align: top; margin-right: 4px; display: inline-block; align-self: center"
				>done</CommonIcon
			>
			<div class="mdc-typography--caption" style="display: inline-block; align-self: center">Wykonane</div>
		</div>
		<Select bind:value={search.done} variant="outlined" style="margin-right: 8px;">
			{#each searchDoneOptions as value}
				<Option {value}>{value}</Option>
			{/each}
		</Select>
	</div>
	<div>
		<div style="display: flex; flex-direction: row;">
			<CommonIcon
				class="material-icons"
				style="font-size: 1em; line-height: normal; vertical-align: top; margin-right: 4px; display: inline-block; align-self: center"
				>arrow_forward</CommonIcon
			>
			<div class="mdc-typography--caption">Od</div>
		</div>
		<Textfield
			type="datetime-local"
			class="shaped-outlined"
			variant="outlined"
			bind:value={search.from}
			noLabel="true"
			style="margin-right: 8px;"
		/>
	</div>
	<div>
		<div style="display: flex; flex-direction: row;">
			<CommonIcon
				class="material-icons"
				style="font-size: 1em; line-height: normal; vertical-align: top; margin-right: 4px; display: inline-block; align-self: center"
				>arrow_back</CommonIcon
			>
			<div class="mdc-typography--caption">Do</div>
		</div>
		<Textfield
			type="datetime-local"
			class="shaped-outlined"
			variant="outlined"
			bind:value={search.to}
			noLabel="true"
			style="margin-right: 8px;"
		/>
	</div>
	<Button on:click={resetSearchFilters} style="display: inline-block; align-self: flex-end;">Wyczyść filtry</Button>
</div>

<!-- DATA TABLE -->
<DataTable
	sortable
	bind:sort
	bind:sortDirection
	on:SMUIDataTable:sorted={() => getTasks()}
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
		<Button on:click={() => addTask(taskToAdd)}>
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
		<Button on:click={() => editTask(taskToEdit)}>
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
		<Button on:click={() => deleteTasks()}>
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
