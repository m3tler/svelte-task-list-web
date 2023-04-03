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
  
    $: currentPage, rowsPerPage, sort, active, getTasks();
  
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
        searchParams.push(["sortBy", "id"]);
        searchParams.push(["sortOrder", sortDirection === 'ascending' ? 'asc' : 'desc']);

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
</script>


<TabBar tabs={['Wszystkie', 'Wykonane', 'Oczekujące', 'Przeterminowane']} let:tab bind:active>
    <Tab {tab}>
      <Label>{tab}</Label>
    </Tab>
</TabBar>
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
        <Cell checkbox sortable={false}>
            <Checkbox />
        </Cell>
        <Cell style="width: 100%;">Nazwa
            <IconButton class="material-icons">arrow_upward</IconButton>
        </Cell>
        <Cell checkbox>Wykonane
            <IconButton class="material-icons">arrow_upward</IconButton>
        </Cell>
        <Cell>Termin
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
          </Cell>
          <Cell>{item.name}</Cell>
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
  