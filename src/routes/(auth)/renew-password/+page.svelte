<script lang="ts">
  import { goto } from '$app/navigation';
  import Client from '$lib/client';
  import {
    PASSWORD_MIN_LEN_10,
    PASSWORD_MUST_CONTAINS_CHARS,
    PASSWORD_NOT_USED,
    PASSWORD_STRICT_MESSAGE
  } from '$lib/constants/text';
  import { passwordRegex, passwordRegexNoMin } from '$lib/utils/regexPatterns';
  import notifications from '$stores/notification';
  import { validator } from '@felte/validator-yup';
  import { Button, ButtonSet, FormGroup, InlineLoading, PasswordInput } from 'carbon-components-svelte';
  import { ArrowRight } from 'carbon-icons-svelte';
  import { createForm } from 'felte';
  import { onMount } from 'svelte';
  import * as yup from 'yup';

  const client = new Client();
  let token: string = '';

  const schema = yup.object({
    password: yup.string().matches(passwordRegex, PASSWORD_STRICT_MESSAGE).required(),
    repeat: yup.string().oneOf([yup.ref('password')], 'Passwords must match')
  });

  const { form, isValid, errors, isSubmitting, data } = createForm<yup.InferType<typeof schema>>({
    extend: validator({ schema }),
    initialValues: { password: '', repeat: '' },
    onSubmit: async (values) => {
      try {
        await client.user.renewPassword(values.password, values.repeat, token);
        notifications.notify({ title: 'Your password has been successfully updated', kind: 'success' });
        await goto('/login');
      } catch (error) {
        const msg = error?.response?.data?.message || 'Something went wrong';
        notifications.notify({
          kind: 'error',
          title: msg
        });
      }
    }
  });

  $: passwordMinLengthError = $data.password?.length < 10;
  $: passwordCharactersError = !passwordRegexNoMin.test($data.password || '');

  onMount(() => {
    const { searchParams } = new URL(window.location.href);
    token = searchParams.get('token');
  });
</script>

<form use:form class="flex flex-col">
  <FormGroup>
    <PasswordInput
      type="password"
      labelText="New password"
      placeholder="New password"
      name="password"
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
    <PasswordInput
      type="password"
      labelText="Repeat New Password"
      placeholder="Repeat New Password"
      name="repeat"
      invalidText={$errors.repeat && $errors.repeat[0]}
      invalid={!!$errors.repeat}
    />
  </FormGroup>

  <ButtonSet>
    <Button
      id="login"
      type="submit"
      kind="primary"
      disabled={$isSubmitting || !$isValid}
      icon={$isSubmitting ? InlineLoading : ArrowRight}
    >
      Send
    </Button>
  </ButtonSet>
</form>

<style>
  .validation-text {
    font-size: var(--cds-caption-01-font-size, 0.75rem);
  }
  .validation-error {
    color: var(--cds-text-error, #da1e28) !important;
  }
</style>
