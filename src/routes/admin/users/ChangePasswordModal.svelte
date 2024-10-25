<script lang="ts">
  import { FormGroup, Modal, PasswordInput } from 'carbon-components-svelte';
  import Client from '$lib/client';
  import { passwordRegex } from '$lib/utils/regexPatterns';
  import notifications from '$stores/notification';
  import { validator } from '@felte/validator-yup';
  import { createForm } from 'felte';
  import * as yup from 'yup';
  import { PASSWORD_STRICT_MESSAGE } from '$lib/constants/text';

  export let open = false;
  export let userId: number;

  const client = new Client();

  const schema = yup.object({
    newPassword: yup
      .string()
      .notOneOf([yup.ref('current')], 'New password must be different from previous one')
      .matches(passwordRegex, PASSWORD_STRICT_MESSAGE)
      .required('The password is required'),
    confirm: yup.string().oneOf([yup.ref('newPassword')], 'The confirm password must match')
  });

  const { form, isValid, errors, isSubmitting, reset, handleSubmit } = createForm<yup.InferType<typeof schema>>({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      try {
        await client.admin.changePassword(userId, values.newPassword);
        notifications.notify({
          kind: 'success',
          title: 'Password was succesfully updated.'
        });
        open = false;
      } catch (error) {
        const msg = error?.response?.data?.message || 'Something went wrong';
        notifications.notify({
          kind: 'error',
          title: msg
        });
      }
    }
  });

  $: if (open) reset();
</script>

<Modal
  modalHeading="Change Password"
  bind:open
  primaryButtonText="Update"
  secondaryButtonText="Cancel"
  primaryButtonDisabled={!$isValid}
  hasForm
  on:click:button--secondary={() => (open = false)}
  on:click:button--primary={handleSubmit}
>
  <form use:form class="p-5">
    <FormGroup>
      <PasswordInput
        name="newPassword"
        labelText="New Password"
        invalidText={$errors?.newPassword?.join(', ')}
        invalid={!!$errors.newPassword}
      />
    </FormGroup>
    <FormGroup>
      <PasswordInput
        name="confirm"
        labelText="Repeat Password"
        invalidText={$errors?.confirm?.join(', ')}
        invalid={!!$errors.confirm}
      />
    </FormGroup>
  </form>
</Modal>
