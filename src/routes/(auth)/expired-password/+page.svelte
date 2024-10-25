<script lang="ts">
  import { goto } from '$app/navigation';
  import Client from '$lib/client';
  import ReCaptcha from '$lib/components/ReCaptcha.svelte';
  import { PASSWORD_MIN_LEN_10, PASSWORD_MUST_CONTAINS_CHARS, PASSWORD_NOT_USED } from '$lib/constants/text';
  import { passwordRegex, passwordRegexNoMin } from '$lib/utils/regexPatterns';
  import notifications from '$stores/notification';
  import userStore from '$stores/user';
  import { validator } from '@felte/validator-yup';
  import { Button, ButtonSet, FormGroup, InlineLoading, TextInput } from 'carbon-components-svelte';
  import { ArrowRight } from 'carbon-icons-svelte';
  import { createForm } from 'felte';
  import { onMount } from 'svelte';
  import * as yup from 'yup';

  $: if (tries >= 3) {
    showCaptcha = true;
  }

  let tries = 0;
  let showCaptcha = false;
  let userName: string;
  const client = new Client();
  const schema = yup.object({
    oldpassword: yup.string().required('Old password is a required field'),
    password: yup.string().matches(passwordRegex, ' ').required(),
    repeat: yup.string().oneOf([yup.ref('password')], 'Passwords must match')
  });

  const { form, isValid, errors, isSubmitting, reset, data } = createForm<yup.InferType<typeof schema>>({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      try {
        if (userName) {
          await client.user.changeExpiredPassword(userName, values.oldpassword, values.password);
          notifications.notify({
            title: 'Password changed successfully.',
            subtitle: 'You will be redirected to the login page.',
            kind: 'success'
          });
        }
        await goto('/login');
      } catch (error) {
        const msg = error?.response?.data?.message || 'Something went wrong';
        notifications.notify({
          kind: 'error',
          title: msg
        });
        reset();
        tries++;
      }
    }
  });
  onMount(() => {
    if ($userStore) {
      userName = $userStore.username;
      $userStore = undefined;
    } else {
      goto('/login');
    }
  });
  function onSolveCaptcha() {
    tries = 0;
    showCaptcha = false;
  }

  $: passwordMinLengthError = $data.password?.length < 10;
  $: passwordCharactersError = !passwordRegexNoMin.test($data.password || '');
</script>

<form use:form class="flex flex-col">
  <FormGroup>
    <TextInput
      data-test="oldpassword"
      type="password"
      labelText="Old password"
      placeholder="Old password"
      name="oldpassword"
      invalidText={$errors.oldpassword && $errors.oldpassword[0]}
      invalid={!!$errors.oldpassword}
    />
  </FormGroup>
  <FormGroup>
    <TextInput
      data-test="password"
      type="password"
      labelText="New password"
      placeholder="New password"
      name="password"
      invalidText={$errors.password && $errors.password[0]}
      invalid={!!$errors.password}
    />
    <div class="validation-text text-ctip-success mt-1" class:validation-error={passwordMinLengthError}>
      {PASSWORD_MIN_LEN_10}
    </div>
    <div class="validation-text text-ctip-success" class:validation-error={passwordCharactersError}>
      {PASSWORD_MUST_CONTAINS_CHARS}
    </div>
    <div class="validation-text">{PASSWORD_NOT_USED}</div>
  </FormGroup>
  <FormGroup>
    <TextInput
      data-test="passwordrepeat"
      type="password"
      labelText="Repeat New Password"
      placeholder="Repeat New Password"
      name="repeat"
      invalidText={$errors.repeat && $errors.repeat[0]}
      invalid={!!$errors.repeat}
    />
  </FormGroup>
  {#if showCaptcha}
    <div class="mx-auto mb-2">
      <ReCaptcha on:solve={onSolveCaptcha} />
    </div>
  {/if}
  {#if !showCaptcha}
    <ButtonSet>
      <Button
        data-test="changepassword"
        id="change-password"
        type="submit"
        kind="primary"
        disabled={$isSubmitting || !$isValid || showCaptcha}
        icon={$isSubmitting ? InlineLoading : ArrowRight}
      >
        Save password
      </Button>
      <Button href="/login/forgot" kind="ghost" class="justify-end">I forgot my password</Button>
    </ButtonSet>
  {/if}
  <Button class="p-3 mt-4 max-w-full w-full justify-center" href="/login" kind="tertiary">Back to login</Button>
</form>

<style>
  .validation-text {
    font-size: var(--cds-caption-01-font-size, 0.75rem);
  }
  .validation-error {
    color: var(--cds-text-error, #da1e28) !important;
  }
</style>
