<script>
  import { page } from '$app/stores';
  import token from '$stores/token';
  import user from '$stores/user';
</script>

<div>
  <a href="/dashboard/organizations/{$page.params.organizationId}/modules/{$page.params.moduleId}"> Go to Threats </a>
  <a href="/dashboard/organizations/{$page.params.organizationId}/modules/{$page.params.moduleId}/notfound"> Not found </a>
  <a href="/dashboard/organizations/{$page.params.organizationId}/modules/{$page.params.moduleId}/test"> Test </a>

  <h2>OTHER</h2>
 
  
  <h4>We can include angular component inside svelte with this code in the module file</h4>
  <pre>
    {`constructor(private injector: Injector) {
      const el = createCustomElement(ExampleComponent, { injector });
      customElements.define('app-example', el);
    }
    ngDoBootstrap() {}`}
  </pre>
  
  <h4>My user</h4>
  <div>
    <pre>
      {#if $user}
      {JSON.stringify($user, null, 2)}
      {/if}
    </pre>
  </div>
  <h4>Token</h4>
  <p>{$token}</p>
</div>

<p>
  {JSON.stringify($page.params)}
</p>
