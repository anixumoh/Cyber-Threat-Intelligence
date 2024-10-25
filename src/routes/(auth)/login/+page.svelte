<script lang="ts">
  import notifications from '$stores/notification';
  import {
    Button,
    ButtonSet,
    ComposedModal,
    FormGroup,
    InlineLoading,
    ModalBody,
    ModalHeader,
    PasswordInput,
    TextInput
  } from 'carbon-components-svelte';
  import { ArrowRight } from 'carbon-icons-svelte';
  import { onMount, tick } from 'svelte';
  import { goto, preloadCode } from '$app/navigation';
  import userStore from '$stores/user';
  import tokenStore from '$stores/token';
  import { safeSendEvent } from '$lib/utils/angularCommunication';
  import axios from 'axios';
  import TwoStepValidation from '$lib/components/TwoStepValidation.svelte';
  import ReCaptcha from '$lib/components/ReCaptcha.svelte';
  import type User from '$lib/types/user';
  import Client from '$lib/client';
  import { currentOrganizationId, organizationsStore } from '$stores/organization';
  import preferencesStore from '$stores/preferences';
  import logout from '$lib/utils/logout';

  const client = new Client();

  let submitting = false;
  let mounted = false;
  let usernameInput: HTMLInputElement;
  let passwordInput: HTMLInputElement;
  let code2faInput: HTMLInputElement;
  let username = '';
  let password = '';
  let tries = 0;
  let showCaptcha = false;

  let enter2fa = false;
  let code2fa = '';
  let modalEnable2fa = false;
  let qr: string = '';
  let secret: string = '';

  $: code2fa = (code2fa.match(/\d/g) || []).join(''); // allow only numbers
  $: if (tries >= 3) {
    showCaptcha = true;
  }

  onMount(() => {
    mounted = true;
    usernameInput.focus();
    check2fa();
    const interval = setInterval(() => {
      // Allow fill with pasword managers that complete fields without touching them
      if (username || password) {
        clearInterval(interval);
      }
      if (usernameInput?.value !== username) {
        username = usernameInput?.value;
        password = passwordInput?.value;
        clearInterval(interval);
      }
    }, 333);
    return () => clearInterval(interval);
  });

  async function check2fa() {
    if ($userStore) {
      const user = await userStore.getUser();
      if (user?.licenseAccepted && !user?.twoFactorAuthentication) {
        if ($userStore?.password && $userStore?.password !== '*') {
          $userStore = { ...user, password: $userStore?.password };
        }

        username = $userStore?.username || '';
        password = $userStore?.password || '';

        const enabling = await shouldEnable2FA();
        if (enabling) return;
      }
    }
  }

  async function submit() {
    try {
      submitting = true;
      const url = '/api/v2/auth';
      const data = {
        username,
        password
      };
      if (enter2fa) {
        data['code'] = code2fa;
      }

      const instance = axios.create();
      const response = await instance
        .post(url, data, {
          headers: {
            'Content-Type': 'application/json',
            uirequest: 'true'
          }
        })
        .catch((error) => {
          const status = error?.response?.status;
          const messageKey = error?.response?.data?.message;
          const message = error?.response?.data?.field || error?.response?.data?.message;
          if (messageKey === 'error.password.expired') {
            $userStore = { ...$userStore, username };
            goto('/expired-password/');
            throw new Error(
              'Your password has expired, change it to continue using the platform. You can use the form below.'
            );
          }
          if (messageKey === 'login.two_factor_authentication_code_error') {
            throw new Error('Sorry, the code you have entered is not correct. Please try again.');
          }
          if (status === 409) {
            return error.response;
          }
          if (status === 401) {
            throw new Error(
              'Sorry! It looks like there is a problem with your credentials. Please try again with no typos. If the problem persists, contact our support team.'
            );
          }

          throw new Error(message);
        });

      if (response.status === 409) {
        enter2fa = true;
        await tick();
        code2faInput.focus();
        return;
      }
      return await onValidLogin(response.data.token);
    } catch (error) {
      tries++;
      notifications.notify({
        title: 'Error',
        subtitle: error?.message ?? 'An internal server error occurred.'
      });
    } finally {
      submitting = false;
    }
  }

  async function onValidLogin(token: string) {
    localStorage.setItem('TOKEN', token);
    $tokenStore = token;

    const user = await userStore.getUser();
    $userStore = user;

    await safeSendEvent('send-token', { token });
    if (!$userStore?.licenseAccepted) {
      if ($userStore?.password === '*') {
        $userStore.password = password || '*';
      }
      return await goto('/privacityTerms');
    }

    if (!modalEnable2fa && !$userStore?.twoFactorAuthentication) {
      const enabling = await shouldEnable2FA();
      if (enabling) return;
    }

    const [url, landingOrganization] = getUrlRedirection($userStore);
    preloadCode(url);

    $userStore?.password && ($userStore.password = '*');

    const [organizations, _] = await Promise.all([
      client.modules.getOrganizations(),
      preferencesStore.loadPreferences()
    ]);
    $organizationsStore = organizations;

    let expectedOrgIndex = 0;
    if (landingOrganization) {
      const idx = organizations.findIndex((org) => org.id === +landingOrganization);
      if (idx !== -1) {
        expectedOrgIndex = idx;
      }
    }
    if (!expectedOrgIndex) {
      const idx = organizations.findIndex((org) => org.enabled);
      if (idx !== -1) {
        expectedOrgIndex = idx;
      }
    }
    $currentOrganizationId = $organizationsStore[expectedOrgIndex]?.id;
    await goto(url);
    showTimeLeftUntilPasswordExpiration();
  }

  function showTimeLeftUntilPasswordExpiration() {
    if ($userStore?.daysToPasswordChange <= 15) {
      notifications.notify({
        timeout: 0,
        kind: 'warning',
        title: 'Change password required',
        subtitle: `Your password will expire in ${$userStore.daysToPasswordChange} days and your access will be blocked. Please, access to your account settings profile and change your password`,
        link: {
          href: '/profile/account?password',
          title: 'Go to change password'
        }
      });
    }
  }

  function getUrlRedirection(user: User) {
    const landingPage = user?.landingPage;
    let landingOrganization: string;
    let result = '/dashboard';

    if (landingPage && landingPage.includes(',')) {
      const split = landingPage.split(',');
      landingOrganization = split[1];
      if (split[3] === 'dashboard') {
        result = `/dashboard/organizations/${split[1]}`;
      } else if (split[3] === 'summary') {
        result = `/dashboard/organizations/${split[1]}/summary`;
      } else if (split[3] === 'indexed') {
        result = `/dashboard/organizations/${split[1]}/indexed`;
      } else if (split[3] === 'reports') {
        result = `/dashboard/organizations/${split[1]}/reports`;
      } else if (split[3] === 'admin') {
        const currentUsrGrants = user.grants;
        const isAnalyst = currentUsrGrants?.superSearchGrants.some((org) => org.analyst);
        const isAdminOrAnalyst = currentUsrGrants?.superadmin || currentUsrGrants?.mssp_admin || isAnalyst;
        if (isAdminOrAnalyst) {
          result = '/admin';
        }
      } else if (split[2] === 'Threat Context') {
        result = `/dashboard/organizations/${split[1]}/modules/${split[3]}/threat_context/actors`;
      } else if (split[2] === 'Explorer') {
        result = `/dashboard/organizations/${split[1]}/modules/${split[3]}/cve`;
      } else {
        result = `/dashboard/organizations/${split[1]}/modules/${split[3]}`;
      }
    }

    return [result, landingOrganization];
  }

  async function shouldEnable2FA() {
    const response = await client.user.shouldEnable2FA();
    const forced = response.data ?? false;
    if (forced) {
      const response = await client.user.getSecondFactorQR();
      modalEnable2fa = true;
      qr = response.data.qr;
      secret = response.data.secret;
    }
    return forced;
  }

  function onSolveCaptcha() {
    tries = 0;
    showCaptcha = false;
  }

  async function onClose2faModal() {
    if (!enter2fa) {
      await logout();
    }
  }
</script>

{#if enter2fa}
  <form class="flex flex-col" on:submit|preventDefault={submit}>
    <FormGroup>
      <TextInput
        bind:ref={code2faInput}
        bind:value={code2fa}
        name="code2fa"
        labelText="Enter second factor authentication code:"
        placeholder="Secret Number"
        autocomplete="off"
        minlength={6}
        maxlength={10}
      />
    </FormGroup>

    <ButtonSet stacked>
      <Button
        type="submit"
        kind="primary"
        disabled={submitting || !code2fa}
        icon={submitting ? InlineLoading : ArrowRight}
        class="!max-w-full"
      >
        Login
      </Button>
    </ButtonSet>
  </form>
{:else}
  <form class="flex flex-col" on:submit|preventDefault={submit}>
    <FormGroup>
      <TextInput
        bind:ref={usernameInput}
        bind:value={username}
        data-test="username"
        name="username"
        labelText="Username"
        placeholder="Username"
        autocomplete="username"
      />
    </FormGroup>
    <FormGroup>
      <PasswordInput
        bind:ref={passwordInput}
        bind:value={password}
        data-test="password"
        name="password"
        labelText="Password"
        placeholder="Password"
        autocomplete="password"
      />
    </FormGroup>

    {#if showCaptcha}
      <div class="mx-auto mb-2">
        <ReCaptcha on:solve={onSolveCaptcha} />
      </div>
    {/if}

    <ButtonSet>
      <Button
        type="submit"
        kind="primary"
        disabled={!mounted || submitting || !username || !password || showCaptcha}
        icon={submitting ? InlineLoading : ArrowRight}
      >
        Login
      </Button>
      <Button href="/login/forgot" kind="ghost" class="justify-end">I forgot my password</Button>
    </ButtonSet>
  </form>
{/if}

<ComposedModal bind:open={modalEnable2fa} on:close={onClose2faModal}>
  <ModalHeader title="Enable 2FA" />
  <ModalBody>
    <TwoStepValidation {qr} {secret} on:enabled={() => (enter2fa = true)} />
  </ModalBody>
</ComposedModal>
