<script lang="ts">
    import DataTable, {
      Head,
      Body,
      Row,
      Cell,
      Pagination,
      SortValue
    } from '@smui/data-table';
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
    import { getTasks } from './service';
  
    type Task = {
      id: number;
      name: string;
      deadline: Date;
      done: boolean;
    };

    export let data;
    let items: Task[] = data.content;
    let rowsPerPage = 5;
    let currentPage = 0;
    let lastPage = data.totalPages - 1;
    let selected: any[] = [];
    let sort: keyof Task = 'id';
    let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';
    let active = 'Wszystkie';
    let searchName = "";
    let searchDone = true;
    let searchTodo = true;
    let searchFrom = "";
    let searchTo = "";
  
    $: currentPage, rowsPerPage, sort, active, searchName, searchDone, searchTodo;

    $: if (currentPage + 1 > lastPage) {
      currentPage = lastPage;
    }

    let searchParams = new Map<string, string>();
    $: {
      searchParams.clear();
      searchParams.set('page', currentPage.toString());
      searchParams.set('size', rowsPerPage.toString());
      searchParams.set('sortBy', sort);
      searchParams.set('sortOrder', sortDirection === 'ascending' ? 'asc' : 'desc');
      searchParams.set('name', searchName.toLowerCase());

      if (active === 'Wykonane') {
        searchDone = true;
        searchTodo = true;
        searchParams.set('done', 'true');
      }

      if (active === 'Oczekujące') {
        searchParams.set('done', 'false');
        searchParams.set('from', format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"));
      }

      if (active === 'Przeterminowane') {
        searchParams.set('done', 'false');
        searchParams.set('to', format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"));
      }

      if (searchDone == true && searchTodo == false) {
        searchParams.set('done', 'true');
      } else if (searchDone == false && searchTodo == true) {
        searchParams.set('done', 'false');
      }

      if((searchFrom != '' && searchTo != '') && new Date(searchTo) < new Date(searchFrom)) {
        searchTo = searchFrom;
      }

      if (searchFrom != '') {
        searchParams.set('from', format(new Date(searchFrom), "yyyy-MM-dd'T'HH:mm:ss"));
      }

      if (searchTo != '') {
        searchParams.set('to', format(new Date(searchTo), "yyyy-MM-dd'T'HH:mm:ss"));
      }

      getTasks(searchParams).then((data) => {
        items = data.content;
        currentPage = data.pageable.pageNumber;
        rowsPerPage = data.pageable.pageSize;
        lastPage = data.totalPages - 1 >= 0 ? data.totalPages - 1 : 0;
      })
      .catch((error) => {
        console.log(error);
      });
    };

    function isTerminate(date: Date) {
      return new Date(date).getTime() < Date.now();
    }

    function changeDone() {
      if (searchDone == true) {
        searchTodo = true;
      }
    }

    function changeTodo() {
      if (searchTodo == true) {
        searchDone = true;
      }
    }

    function resetSearchFilters() {
      searchName = '';
      searchDone = true;
      searchTodo = true;
      searchFrom = '';
      searchTo = '';
    }
</script>



<div style="margin-bottom: 16px;">
  <TabBar tabs={['Wszystkie', 'Wykonane', 'Oczekujące', 'Przeterminowane']} let:tab bind:active>
    <Tab {tab}>
      <Label>{tab}</Label>
    </Tab>
  </TabBar>
</div>

<div style="margin-bottom: 16px;">
  <Button variant=raised>Dodaj</Button>
  <Button variant=raised>Usuń</Button>
</div>

<div style="margin-bottom: 8px; vertical-align: middle;">
  <Textfield
    type=search
    class="shaped-outlined"
    variant="outlined"
    bind:value={searchName}
    label="Nazwa"
    style="min-width: 300px; margin-right: 8px;"
  />
  <FormField>
    <Checkbox bind:checked={searchDone} on:click={changeDone} disabled={ active === 'Wykonane' }/>
    <span slot="label">Wykonane</span>
  </FormField>
  <FormField style="margin-right: 8px;">
    <Checkbox bind:checked={searchTodo} on:click={changeTodo} disabled={ active === 'Wykonane' }/>
    <span slot="label">Do zrobienia</span>
  </FormField>
  <Textfield 
    type=date
    class="shaped-outlined"
    variant="outlined"
    bind:value={searchFrom}
    label="Od"
  />
  <Textfield
    type=date
    class="shaped-outlined"
    variant="outlined"
    bind:value={searchTo}
    label="Do"
  />
  <Button on:click={resetSearchFilters}>Reset</Button>
</div>

<DataTable
sortable
bind:sort
bind:sortDirection
on:SMUIDataTable:sorted={() => (getTasks(searchParams))}
table$aria-label="Todo list"
style="width: 100%;"
>
    <Head>
      <Row>
        <Cell checkbox sortable={false}></Cell>
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
      {#each items as item (item.id)}
        <Row>
          <Cell checkbox>
            <Checkbox
              bind:group={selected}
              value={item}
              valueKey={item.name}
            />
            <Button color="secondary" variant="outlined">Edytuj</Button>
          </Cell>
          <Cell style="color: { item.done == true ? 'lightgreen' : isTerminate(item.deadline) ? 'lightcoral' : 'black' };" >
            {item.name}
          </Cell>
          <Cell>
            <Checkbox
            checked={item.done}
            />
          </Cell>
          <Cell>{format(new Date(item.deadline), "yyyy-MM-dd HH:mm:ss")}</Cell>
        </Row>
      {/each}
    </Body>
  
    <Pagination slot="paginate">
      <svelte:fragment slot="rowsPerPage">
        <Label>Rows Per Page</Label>
        <Select  variant="outlined" bind:value={rowsPerPage} noLabel>
          <Option value={1}>1</Option>
          <Option value={2}>2</Option>
          <Option value={5}>5</Option>
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
        on:click={() => (currentPage--)}
        disabled={currentPage === 0}>chevron_left</IconButton
      >
      <IconButton
        class="material-icons"
        action="next-page"
        title="Next page"
        on:click={() => (currentPage++)}
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
  