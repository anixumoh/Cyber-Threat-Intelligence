<script lang="ts">
  import { page } from '$app/stores';
  import Client from '$lib/client';
  import TwoStepValidation from '$lib/components/TwoStepValidation.svelte';
  import notifications from '$stores/notification';
  import userStore from '$stores/user';
  import { Accordion, AccordionItem, Button, InlineLoading, Toggle } from 'carbon-components-svelte';
  import { Email, Password, TwoFactorAuthentication, User } from 'carbon-icons-svelte';
  import { onMount } from 'svelte';
  import ChangeName from './ChangeName.svelte';
  import ChangePassword from './ChangePassword.svelte';

  const client = new Client();

  let qr = '';
  let secret = '';
  let passwordOpen = false;
  let disabling2FA = false;
  let savingMessaging = false;
  let show2FAcodes = false;

  onMount(() => {
    passwordOpen = $page.url.searchParams.has('password');
    getSecondFactorQR();
  });

  async function getSecondFactorQR() {
    const response = await client.user.getSecondFactorQR();
    qr = response.data.qr;
    secret = response.data.secret;
  }

  async function toggleMessaging(e: PointerEvent) {
    e.preventDefault();
    savingMessaging = true;
    await client.user.setMessaging(!$userStore.eventMessageActivated);
    $userStore.eventMessageActivated = !$userStore.eventMessageActivated;
    savingMessaging = false;
  }

  async function disable2FA() {
    disabling2FA = true;
    show2FAcodes = false;

    try {
      await client.user.disable2FA();
      $userStore.twoFactorAuthentication = false;
      notifications.notify({ kind: 'success', title: 'Two factor was succesefully disabled' });
    } catch (error) {
      notifications.notify({
        kind: 'error',
        title: 'There was a problem disabling two factor authentication. Please try again'
      });
    }

    disabling2FA = false;
  }
</script>

<Accordion class="max-w-3xl mx-auto mt-4">
  <AccordionItem class="[&>button]:items-center">
    <div class="text-xl flex items-center" slot="title">
      <User size={20} />
      <span class="pl-3" data-test="profileAccordeon">Profile</span>
    </div>

    <div class="flex flex-col items-center justify-center mx-auto max-w-lg mt-4">
      <ChangeName />
    </div>
  </AccordionItem>

  <AccordionItem bind:open={passwordOpen} class="[&>button]:items-center">
    <div class="text-xl flex items-center" slot="title">
      <Password size={20} />
      <span class="pl-3">Change password</span>
    </div>

    <div class="flex flex-col items-center justify-center mx-auto max-w-lg mt-4">
      {#if passwordOpen}
        <ChangePassword />
      {/if}
    </div>
  </AccordionItem>

  <AccordionItem class="[&>button]:items-center">
    <div class="text-xl flex items-center" slot="title">
      <TwoFactorAuthentication size={20} />
      <span class="pl-3">2FA</span>
    </div>

    {#if !$userStore?.twoFactorAuthentication || show2FAcodes}
      <div class="flex flex-col items-center justify-center mx-auto mt-4" class:max-w-lg={!show2FAcodes}>
        <TwoStepValidation
          {qr}
          {secret}
          on:enabled={() => {
            $userStore.twoFactorAuthentication = true;
            show2FAcodes = true;
          }}
        />
      </div>
    {/if}
    {#if $userStore?.twoFactorAuthentication}
      <div class="flex flex-col mt-4">
        <Button on:click={disable2FA} disabled={disabling2FA} icon={disabling2FA ? InlineLoading : undefined}>
          Disable
        </Button>
      </div>
    {/if}
  </AccordionItem>

  <AccordionItem class="[&>button]:items-center">
    <div class="text-xl flex items-center" slot="title">
      <Email size={20} />
      <span class="pl-3">Messaging</span>
    </div>

    <div class="relative">
      {#if savingMessaging}
        <InlineLoading class="absolute top-0 left-0 flex items-center justify-center w-full h-full" />
      {/if}
      <Toggle
        disabled={savingMessaging}
        class="whitespace-nowrap"
        toggled={$userStore?.eventMessageActivated}
        on:click={toggleMessaging}
        labelA="Messaging is disabled"
        labelB="Messaging is enabled"
      />
    </div>
  </AccordionItem>
</Accordion>
