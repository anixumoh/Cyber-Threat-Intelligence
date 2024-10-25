<script lang="ts">
  import { Modal } from 'carbon-components-svelte';
  export let open = false;
</script>

<Modal
  on:click:button--primary={() => (open = false)}
  primaryButtonText="Close"
  bind:open
  modalHeading="SEARCH SYNTAX"
  size="lg"
  hasScrollingContent
>
  <div class="[&_p]:text-base">
    <div class="m-4">
      <h5 class="font-bold">Basics</h5>
      <p class="mb-1">Different Dorks can be used in the search box for advanced queries.</p>
      <p class="mb-1">If no dorks are used, your keyword will be searched at the title, content and url.</p>
      <p class="mb-1">
        The search is not sensitive for case
        <span class="tag">( M,m )</span>, underscore
        <span class="tag">( _ )</span>
        or space
        <span class="tag">( ' ' )</span>
      </p>
      <p class="mb-1">
        For exact search use quotation marks
        <span class="tag">(i.e. "Blueliv Barcelona")</span>, and for regex use bars
        <span class="tag">(i.e. /[aZ]{'{'}12{'}'}/)</span>
      </p>
    </div>
    <div class="m-4">
      <h5 class="font-bold">Operators</h5>
      <p class="mb-1">
        Operators
        <span class="tag">AND</span>,
        <span class="tag">OR</span>
        and
        <span class="tag">NOT</span>
        are the only supported boolean operators.
      </p>

      <p class="mb-1">Brackets are supported as well:</p>
      <pre class="p-1 border rounded bg-ctip-ui text-ctip-text">(url:blue or url:liv)</pre>
      <p class="mb-1">And scaping with backslash ( \ ) is also supported:</p>
      <pre class="p-1 border rounded bg-ctip-ui text-ctip-text">url:blue\/</pre>
    </div>
    <div class="m-4">
      <h5 class="font-bold">Dorks</h5>
      <table>
        <thead>
          <tr>
            <th>DORK</th>
            <th>EXAMPLES</th>
            <th>DESCRIPTION</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="4">content<br />url<br />title</td>
            <td>Hello world</td>
            <td>Searches hello world on all fields</td>
          </tr>
          <tr>
            <td>"Hello world"</td>
            <td>Searches exact matches of "Hello world" on all fields</td>
          </tr>
          <tr>
            <td>all:"Hello world"</td>
            <td>Same as above</td>
          </tr>
          <tr>
            <td>all:/[aZ]{'{'}20{'}'}/</td>
            <td>Searches by regex on all fields</td>
          </tr>
          <tr>
            <td rowspan="3">content</td>
            <td>content: Hello world</td>
            <td>Searches hello world on the content field</td>
          </tr>
          <tr>
            <td>content: "Hello world"</td>
            <td>Searches exact matches of "Hello world" on the content field</td>
          </tr>
          <tr>
            <td>all: /[aZ]{'{'}20{'}'}/</td>
            <td>Searches by regex on content field</td>
          </tr>
          <tr>
            <td rowspan="2">title</td>
            <td>title: Hello world</td>
            <td>Searches hello world on the content field</td>
          </tr>
          <tr>
            <td>title: "Hello world"</td>
            <td>Searches exact matches of "Hello world" on the content field</td>
          </tr>
          <tr>
            <td rowspan="4">site_readable</td>
            <td>site_readable: facebookcorewwwi</td>
            <td>Matches urls from site facebookcorewwwi.onion</td>
          </tr>
          <tr>
            <td>site_readable: facebookcorewwwi.onion\:8080</td>
            <td>Matches urls from site facebookcorewwwi.onion:8080 (scaping needed)</td>
          </tr>
          <tr>
            <td>site_readable: facebookcorewwwi.onion</td>
            <td>Matches urls from site facebookcorewwwi.onion</td>
          </tr>
          <tr>
            <td>site_readable: facebook*</td>
            <td>Matches urls whose onion starts with facebook</td>
          </tr>
          <tr>
            <td rowspan="4">last_update</td>
            <td>updated:-1w</td>
            <td>Matches urls updated less than a week ago</td>
          </tr>
          <tr>
            <td>updated:+1week</td>
            <td>Matches urls updated more than a week ago</td>
          </tr>
          <tr>
            <td>updated:-1Y updated:+1M</td>
            <td>Matches urls updated between a year ago and a month ago</td>
          </tr>
          <tr>
            <td>updated:-3days</td>
            <td>Matches urls updated less than three days ago</td>
          </tr>
          <tr>
            <td rowspan="6">mime</td>
            <td>mime:text/html</td>
            <td>Finds urls whose content_type is text/html</td>
          </tr>
          <tr>
            <td>mime:application-x/*</td>
            <td>Finds urls whose content type starts with application-x/</td>
          </tr>
          <tr>
            <td>screenshot:</td>
            <td>Matches only urls that have screenshot</td>
          </tr>
          <tr>
            <td>has_screenshot:</td>
            <td>Matches only urls that have screenshot</td>
          </tr>
          <tr>
            <td>no_screenshot:</td>
            <td>Matches only urls that dont have screenshot</td>
          </tr>
          <tr>
            <td>!screenshot:</td>
            <td>Matches only urls that dont have screenshot</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</Modal>

<style lang="scss">
  table {
    @apply border-[1px] border-solid border-ctip-borderTable w-full;
    th,
    td {
      @apply border-[0.5px] border-solid border-ctip-borderTable;
    }
    th {
      @apply p-[0.3rem];
    }
    td {
      @apply p-1;
    }
    thead {
      @apply bg-ctip-ui border-b-2 border-b-ctip-interactive border-solid;
    }
    tbody {
      @apply text-ctip-text;
    }
  }
  span.tag {
    @apply inline-block bg-ctip-ui border-[1px] border-ctip-border border-solid rounded py-[2px] px-1 font-bold text-xs whitespace-nowrap;
  }
</style>
