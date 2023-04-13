<script lang="ts">
	import Button from '@smui/button';
	import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
</script>

<div class="flexy">
	<div class="top-app-bar-container flexor">
		<TopAppBar variant="static" color="primary">
			<Row>
				<Section>
					<Title>Aplikacja</Title>
				</Section>
				<Section align="end" toolbar>
					<form method="POST" action="/logout?/logout">
						<Button on:click={() => history.replaceState(history.state, '', '/logout?/logout')}>Wyloguj</Button>
					</form>
				</Section>
			</Row>
		</TopAppBar>
	</div>
</div>
<slot />
