<script lang="ts">
  import DefaultAlert from '$lib/components/Alerts/DefaultAlert.svelte';
  import AlertsTable from '$lib/components/Alerts/AlertsTable.svelte';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import ModuleHeading from '$lib/components/module/ModuleHeading.svelte';
  import { type ModuleNameType, MODULE_NAME } from '$lib/constants/modules';
  import { currentModule } from '$stores/module';
  import { currentOrganization } from '$stores/organization';

  import roleStore from '$stores/role';
  import { NotificationFilled } from 'carbon-icons-svelte';
  import { RECIEVE_DEFAULT_ALERTS_TOOLTIP } from '$lib/constants/text';

  const MODULES_WITH_ALERTS: ModuleNameType[] = [
    MODULE_NAME.CREDENTIAL,
    MODULE_NAME.CREDIT_CARD,
    MODULE_NAME.DARK_WEB,
    MODULE_NAME.DATA_LEAKAGE,
    MODULE_NAME.DOMAIN_PROTECTION,
    MODULE_NAME.HACKTIVISM,
    MODULE_NAME.MEDIA_TRACKER,
    MODULE_NAME.MALWARE,
    MODULE_NAME.EXPLORER
  ];

  let openDefaultAlert = false;

  $: showAlerts =
    MODULES_WITH_ALERTS.includes($currentModule.moduleName) && (!$roleStore.customer || !$roleStore.operator);
</script>

<ModuleHeading title="ALERTS">
  {#if showAlerts}
    <GenericButton
      hasTooltip
      tooltipAlign="end"
      iconDescription={RECIEVE_DEFAULT_ALERTS_TOOLTIP}
      kind="primary"
      disabled={!$currentOrganization.enabled}
      on:click={() => (openDefaultAlert = true)}
    >
      <NotificationFilled class="fill-white mr-1"/>
      <span class="font-bold">Receive default alert</span>
    </GenericButton>
  {/if}
</ModuleHeading>
<AlertsTable module={$currentModule} />
<DefaultAlert
  isOpen={openDefaultAlert}
  on:clickAway={() => {
    openDefaultAlert = false;
  }}
/>
