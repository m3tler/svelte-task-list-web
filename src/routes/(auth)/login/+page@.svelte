<script>
	import { goto } from "$app/navigation";

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

<main>
    <h1>Login</h1>
    <form on:submit|preventDefault={login}>
      <label>
        Username:
        <input type="text" bind:value={username} />
      </label>
      <label>
        Password:
        <input type="password" bind:value={password} />
      </label>
      <button type="submit">Login</button>
    </form>
    {#if errorMessage}
      <p>{errorMessage}</p>
    {/if}
  </main>