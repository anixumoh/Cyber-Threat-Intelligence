<script lang="ts">
  import Client from '$lib/client';
  import { PASSWORD_MIN_LEN_10, PASSWORD_MUST_CONTAINS_CHARS, PASSWORD_NOT_USED } from '$lib/constants/text';
  import { passwordRegex, passwordRegexNoMin } from '$lib/utils/regexPatterns';
  import notifications from '$stores/notification';
  import { validator } from '@felte/validator-yup';
  import { Button, FormGroup, InlineLoading, PasswordInput } from 'carbon-components-svelte';
  import { ArrowRight } from 'carbon-icons-svelte';
  import { createForm } from 'felte';
  import { createEventDispatcher } from 'svelte';
  import * as yup from 'yup';

  const dispatch = createEventDispatcher<{ changed: void }>();

  const client = new Client();
  const schema = yup.object({
    current: yup.string().required('The current password is required'),
    password: yup
      .string()
      .notOneOf([yup.ref('current')], 'New password must be different from previous one')
      .matches(passwordRegex, ' ')
      .required(' '),
    confirm: yup.string().oneOf([yup.ref('password')], 'The confirm password must match')
  });
  const { form, isValid, errors, isSubmitting, reset, data } = createForm<yup.InferType<typeof schema>>({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      try {
        await client.user.changePassword(values.current, values.password);
        notifications.notify({
          kind: 'success',
          title: 'Your account was updated successfully!',
          subtitle: 'Account update successful'
        });
        reset();
        dispatch('changed');
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
</script>

<form use:form class="flex flex-col w-full">
  <FormGroup class="flex w-full">
    <PasswordInput
      name="current"
      labelText="Current password"
      invalidText={$errors?.current?.join(', ')}
      invalid={!!$errors.current}
    />
  </FormGroup>

  <FormGroup class="grid w-full">
    <PasswordInput
      name="password"
      labelText="New password"
      invalid={!!$errors.password}
      invalidText={$errors?.password?.[0]}
    />
    <div class="validation-text text-ctip-success mt-1" class:validation-error={passwordMinLengthError}>
      {PASSWORD_MIN_LEN_10}
    </div>
    <div class="validation-text text-ctip-success" class:validation-error={passwordCharactersError}>
      {PASSWORD_MUST_CONTAINS_CHARS}
    </div>
    <div class="validation-text">{PASSWORD_NOT_USED}</div>
  </FormGroup>

  <FormGroup class="flex w-full">
    <PasswordInput
      name="confirm"
      labelText="Confirm password"
      invalidText={$errors?.confirm?.join(', ')}
      invalid={!!$errors.confirm}
    />
  </FormGroup>

  <Button
    data-test="changePasswordButton"
    type="submit"
    kind="primary"
    disabled={$isSubmitting || !$isValid}
    icon={$isSubmitting ? InlineLoading : ArrowRight}
  >
    Change password
  </Button>
</form>

<style>
  .validation-text {
    font-size: var(--cds-caption-01-font-size, 0.75rem);
  }
  .validation-error {
    color: var(--cds-text-error, #da1e28) !important;
  }
</style>
