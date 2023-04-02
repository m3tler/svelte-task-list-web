<script>
  import Textfield from '@smui/textfield';
  import HelperText from '@smui/textfield/helper-text';
  import { Icon as CommonIcon } from '@smui/common';
	import { goto } from "$app/navigation";
  import Button, { Label } from '@smui/button';
  import MenuSurface from '@smui/menu-surface';
  import Paper, { Title, Content } from '@smui/paper';

    let username = "";
    let password = "";
    let errorMessage = "";
  
    async function login() {
      const response = await fetch("http://localhost:8080/auth", {
        headers: {
          Authorization: "Basic " + btoa(username + ":" + password)
        }
      });
  
      if (response.ok) {
        goto("tasks");
      } else {
        errorMessage = "Invalid username or password";
      }
    }
</script>

<div style="display: flex; justify-content: center;">
  <MenuSurface static style="max-width: 350px;">
    <div class="columns margins" style="padding: 25px;">
      <form on:submit|preventDefault={login}>
        <div class="mdc-typography--headline5" style="margin-bottom: 16px; text-align: center;">Login</div>
        <div style=" margin-top: 8px; margin-bottom: 8px;">
          <Textfield on:input={() => errorMessage = ""} type="email" variant="outlined" style="min-width: 300px;" bind:value={username}>
            <svelte:fragment slot="label">
              <CommonIcon
                class="material-icons"
                style="font-size: 1em; line-height: normal; vertical-align: top;"
                >email</CommonIcon
              > Email
            </svelte:fragment>
            <HelperText slot="helper">Enter the email</HelperText>
          </Textfield>
        </div>
        <div style="margin-bottom: 8px;">
          <Textfield on:input={() => errorMessage = ""} type="password" variant="outlined" style="min-width: 300px;" bind:value={password}>
            <svelte:fragment slot="label">
              <CommonIcon
                class="material-icons"
                style="font-size: 1em; line-height: normal; vertical-align: top;"
                >password</CommonIcon
              > Password
            </svelte:fragment>
            <HelperText slot="helper">Enter the password</HelperText>
          </Textfield>
        </div>
        <div style="text-align: end;">
          <Button type="submit" variant="raised">
          <Label>Submit</Label>
        </Button>
        </div>
      </form>
      {#if errorMessage}
      <Paper color="error" variant="outlined" style="margin-top: 25px;">
        <Content>
          <CommonIcon class="material-icons" style="font-size: 1.2em; line-height: normal; vertical-align: middle;">error</CommonIcon>
           {errorMessage}
        </Content>
      </Paper>
      {/if}
    </div>
  </MenuSurface>
</div>