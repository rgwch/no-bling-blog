<script lang="ts">
  import { Router, Link, Route, navigate } from "svelte-routing";
  import Summary from "./lib/views/Summary.svelte";
  import Login from "./lib/components/Login.svelte";
  import Single from "./lib/views/Single.svelte";
  import Edit from "./lib/views/Edit.svelte";
  function key(event: any) {
    if (event.key === "Enter") {
      navigate("/");
    }
  }
</script>

<main>
  <div class="container mx-auto">
    <div
      class="bg-blue-200 flex flex-col md:flex-row flex-nowrap items-center mx-5 px-5">
      <div
        class="py-1 mr-2"
        on:click={() => navigate("/")}
        on:keypress={key}
        tabindex="0"
        role="button">
        <img src="/nbb_logo.png" alt="NBB Logo" width="64" />
      </div>
      <div class="text-2xl">The No Bling Blog</div>
      <div class="flex-1" />
      <Login />
    </div>
    <Router>
      <Route path="/" component={Summary} />
      <Route path="/post/:id" let:params>
        <Single id={params.id} />
      </Route>
      <Route path="/new" component={Edit} />
      <Route path="/filter/:from/:until" let:params>
        <Summary yearFrom={params.from} yearUntil={params.until} />
      </Route>
    </Router>
  </div>
</main>
