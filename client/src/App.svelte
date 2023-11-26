<script lang="ts">
  import { Router, Link, Route, navigate } from 'svelte-routing';
  import Summary from './lib/views/Summary.svelte';
  import Login from './lib/components/Login.svelte';
  import Single from './lib/views/Single.svelte';
  import Create from './lib/views/Create.svelte';
  function key(event: any) {
    if (event.key === 'Enter') {
      navigate('/');
    }
  }
</script>

<main>
  <div class="container mx-auto">
    <div
      class="bg-blue-200 flex flex-col md:flex-row flex-nowrap items-center px-5">
      <div
        class="py-1 mr-2"
        on:click={() => navigate('/')}
        on:keypress={key}
        tabindex="0"
        role="button">
        <img src="/nbb_logo.png" alt="NBB Logo" width="64" />
      </div>
      <a href="/"><div class="text-2xl">The No Bling Blog</div></a>
      <div class="flex-1" />
      <Login />
    </div>
    <Router>
      <Route path="/" component={Summary} />
      <Route path="/post/:id" let:params>
        <Single id={params.id} />
      </Route>
      <Route path="/new" component={Create} />
      <Route path="/time/:year" let:params>
        <Summary yearFrom={params.year} yearUntil={params.year} />
      </Route>
      <Route path="/cat/:category" let:params>
        <Summary currentCategory={params.category} />
      </Route>
    </Router>
  </div>
</main>
