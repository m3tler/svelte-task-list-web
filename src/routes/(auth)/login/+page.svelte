<script lang="ts">
	import Button, { Label } from '@smui/button';
	import MenuSurface from '@smui/menu-surface';
	import Paper, { Content } from '@smui/paper';
	import type { ActionData } from '../$types';
	import { Icon as CommonIcon } from '@smui/common';
	import TextField from '$lib/components/TextField.svelte';

	export let form: ActionData;
	let email = '';
	let password = '';
</script>

<div style="display: flex; justify-content: center; padding: 25px;">
	<MenuSurface static style="max-width: 350px;">
		<div class="columns margins" style="padding: 25px;">
			<form method="POST" action="?/login">
				<div class="mdc-typography--headline5" style="margin-bottom: 16px; text-align: center;">Logowanie</div>
				<div style=" margin-top: 8px; margin-bottom: 8px;">
					<TextField
						name="email"
						type="email"
						bind:value={email}
						labelIcon="email"
						label="Email"
						placeholder="Wprowadź email"
						style="min-width: 300px;"
					/>
				</div>
				<div style="margin-bottom: 8px;">
					<TextField
						name="password"
						type="password"
						bind:value={password}
						labelIcon="password"
						label="Hasło"
						placeholder="Wprowadź hasło"
						style="min-width: 300px;"
					/>
				</div>
				<div style="text-align: end;">
					<Button type="submit" variant="raised">
						<Label>Zaloguj</Label>
					</Button>
				</div>
				{#if form?.error == true}
					<div style="color: red;">
						<Paper variant="outlined" style="border-color: red; margin-top: 25px; padding: 5px;">
							<Content>
								<CommonIcon
									class="material-icons"
									style="font-size: 1.2em; line-height: normal; vertical-align: middle;">error</CommonIcon
								>
								{form?.errorMessage}
							</Content>
						</Paper>
					</div>
				{/if}
			</form>
		</div>
	</MenuSurface>
</div>
