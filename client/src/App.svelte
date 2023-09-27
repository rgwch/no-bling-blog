<script lang="ts">
  const prefix = "/api/1.0/";
  let posts = [];
  fetch(`http://localhost:3000${prefix}summary`).then(async (result) => {
    if (result.ok) {
      const ans = await result.json();
      if (ans.status == "ok") posts = ans.result;
    }
  });
  async function create() {
    const post = {
      _id: "nummeroUno",
      heading: "My first Posting",
      teaser: "This is an example of an nbb post",
      fulltext: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam nec maximus est, ac scelerisque tellus. Morbi efficitur venenatis dolor, eu semper leo finibus feugiat. Nam bibendum quam elementum nibh laoreet ultrices. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Maecenas semper sed quam eget volutpat. Duis pretium ipsum in tempus hendrerit. Ut egestas enim at scelerisque dapibus. Donec vehicula turpis tellus, eget consectetur quam tincidunt at. Suspendisse potenti. Suspendisse id nisl ac tortor fermentum faucibus. Aenean et cursus orci. Donec augue dui, posuere vitae ex sed, sollicitudin luctus nunc. Nulla consequat augue id volutpat porttitor.
Duis finibus nulla eget ipsum lobortis, a cursus dolor commodo. Interdum et malesuada fames ac ante ipsum primis in faucibus. Etiam euismod libero eu porttitor facilisis. Proin non ipsum quis justo porta bibendum id vitae ipsum. Cras a leo nec tortor pellentesque pellentesque. In placerat nisl eget lacinia convallis. Morbi vehicula tempus efficitur. Curabitur mollis est et massa elementum, et molestie lacus consequat. Donec fermentum libero justo, et iaculis orci ornare at. Pellentesque tincidunt ultrices hendrerit. Cras pharetra nulla vitae semper posuere. Vivamus consectetur in purus vel faucibus. Aenean nisl quam, convallis nec velit rutrum, bibendum mollis sem. Duis egestas bibendum sapien sed faucibus. Pellentesque accumsan ut sem et faucibus.
In in euismod nisl, vel eleifend tortor. Maecenas sagittis pharetra risus, ac tristique dui condimentum quis. Duis ac mauris pharetra, interdum nibh non, elementum orci. Nunc imperdiet vel est non condimentum. Curabitur consequat id velit id venenatis. Curabitur vehicula bibendum leo id iaculis. Etiam molestie, dui ut pharetra suscipit, ante felis dictum tortor, at lacinia odio nulla dignissim nisi. Maecenas eget suscipit ante, ac tincidunt ex. Proin eu erat eget elit tempor interdum. Quisque finibus mi non volutpat cursus. Morbi et erat molestie, posuere justo sit amet, efficitur ligula.
Donec malesuada suscipit urna, ut venenatis massa interdum non. Duis vel ex aliquet, faucibus lectus vitae, posuere risus. Morbi non dolor lectus. Quisque in libero nunc. Ut vehicula molestie eros. Vestibulum nec pulvinar mi. Duis vitae tellus ornare, sodales diam fermentum, mollis elit. In purus enim, lobortis at metus quis, convallis vestibulum massa. Sed ornare tellus nec vulputate aliquet. Praesent rhoncus tortor ex, id semper justo posuere id. Proin ut magna quis augue laoreet varius.
Sed et viverra dui. Sed congue diam lectus, at semper ex condimentum lobortis. Morbi fermentum suscipit tempus. Mauris eget vulputate lacus. Donec lacinia sit amet quam a cursus. Nam nec porta metus. Integer eu ipsum a mi ultricies feugiat. Duis rutrum ut magna ut venenatis. Ut consectetur congue turpis at interdum. Donec eu quam ut erat malesuada consequat in quis ex. Nunc aliquam, nulla vel hendrerit mattis, nibh ex rhoncus eros, sed placerat diam ante sed libero. Sed sit amet orci non metus bibendum tempus eget vel quam`,
      author: "gerry",
      created: "2023-09-26",
      published: true,
    };
    fetch(`http://localhost:3000${prefix}add`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(post),
    });
  }
</script>

<main>
  <div class="response">
    {#each posts as post}
      <div>{post.heading}</div>
      <div>{post.teaser}</div>
    {/each}
  </div>
  <button role="button" on:click={create}>Send</button>
</main>

<style>
  .response {
    margin-top: 100px;
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .data {
    font-family: "Lato", sans-serif;
    margin: 20px;
    padding: 20px;
    border-radius: 15px;
    background-color: #242d3d;
    color: #1ebad5;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;
    text-align: center;
    width: 25%;
  }
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
