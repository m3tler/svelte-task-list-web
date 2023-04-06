<script lang="ts">
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import { Icon as CommonIcon } from '@smui/common';
	import Button, { Label } from '@smui/button';
	import MenuSurface from '@smui/menu-surface';
	import Paper, { Content } from '@smui/paper';
	import type { ActionData } from '../$types';

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
					<Textfield type="email" input$name="email" variant="outlined" style="min-width: 300px;" bind:value={email}>
						<svelte:fragment slot="label">
							<CommonIcon class="material-icons" style="font-size: 1em; line-height: normal; vertical-align: top;"
								>email</CommonIcon
							> Email
						</svelte:fragment>
						<HelperText slot="helper">Wprowadź email</HelperText>
					</Textfield>
				</div>
				<div style="margin-bottom: 8px;">
					<Textfield
						on:input={() => (form = null)}
						type="password"
						input$name="password"
						variant="outlined"
						style="min-width: 300px;"
						bind:value={password}
					>
						<svelte:fragment slot="label">
							<CommonIcon class="material-icons" style="font-size: 1em; line-height: normal; vertical-align: top;"
								>password</CommonIcon
							> Hasło
						</svelte:fragment>
						<HelperText slot="helper">Wprowadź hasło</HelperText>
					</Textfield>
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
