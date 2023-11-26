<script lang="ts">
  import { request } from "../io";
  import type { post } from "../types";

  let posts: Array<post>;
  function reset() {
    posts = [];
    load();
  }
  async function load() {
    posts = await request("summary", ["featured=true"]);
  }
  reset();
</script>
