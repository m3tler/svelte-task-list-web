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
    import { Icon, Label } from '@smui/common';
    import Checkbox from '@smui/checkbox';
    import Tab from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import { format } from 'date-fns';
    import Button from '@smui/button';
    import Textfield from '@smui/textfield';
    import FormField from '@smui/form-field';
  
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
    let selected2: any[] = [];
    let sort: keyof Task = 'id';
    let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';
    let active = 'Wszystkie';
    let searchName = "";
    let searchDone = true;
    let searchTodo = true;
  
    $: currentPage, rowsPerPage, sort, active, searchName, getTasks();
  
    $: if (currentPage + 1 > lastPage) {
      currentPage = lastPage;
    }

    async function getTasks() {
        const options = {
            headers: {
                Authorization: "Basic " + btoa("admin@admin.pl" + ":" + "admin")
            }
        }

        const searchParams = [];
        searchParams.push(["page", currentPage.toString()]);
        searchParams.push(["size", rowsPerPage.toString()]);
        searchParams.push(["sortBy", sort]);
        searchParams.push(["sortOrder", sortDirection === 'ascending' ? 'asc' : 'desc']);
        searchParams.push(["name", searchName.toLocaleLowerCase()]);

        if (active === 'Wykonane') {
            searchParams.push(["done", "true"]);
        }

        if (active === 'Oczekujące') {
            searchParams.push(["done", "false"]);
            searchParams.push(["from", format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")]);
        }

        if (active === 'Przeterminowane') {
            searchParams.push(["done", "false"]);
            searchParams.push(["to", format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")]);
        }

        if (searchDone == true && searchTodo == false) {
          searchParams.push(["done", "true"]);
        } else if (searchDone == true && searchTodo == false) {
          searchParams.push(["done", "false"]);
        }
        
        const params = new URLSearchParams(searchParams).toString();

        await fetch('http://localhost:8080/tasks?' + params, options).then((response) => {
        if (response.ok) {
            return response.json();
        }
        throw new Error();
        })
        .then((data) => {
            items = data.content;
            currentPage = data.pageable.pageNumber;
            rowsPerPage = data.pageable.pageSize;
            lastPage = data.totalPages - 1;
        })
        .catch((error) => {
            console.log(error);
        });
    }

    function isTerminate(date: Date) {
      return new Date(date).getTime() < Date.now();
    }

    function changeDone() {
      if (searchDone == false) {
        searchTodo = true;
      }
    }

    function changeTodo() {
      if (searchTodo == false) {
        searchDone = true;
      }
    }

    let valueA = "";
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
    <Checkbox bind:checked={searchDone} on:change={changeDone} />
    <span slot="label">Wykonane</span>
  </FormField>
  <FormField style="margin-right: 8px;">
    <Checkbox bind:checked={searchTodo} on:change={changeTodo} />
    <span slot="label">Do zrobienia</span>
  </FormField>
  <Textfield
    type=date
    class="shaped-outlined"
    variant="outlined"
    bind:value={valueA}
    label="Od"
  />
  <Textfield
    type=date
    class="shaped-outlined"
    variant="outlined"
    bind:value={valueA}
    label="Do"
  />
</div>

<DataTable
sortable
bind:sort
bind:sortDirection
on:SMUIDataTable:sorted={getTasks}
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
  