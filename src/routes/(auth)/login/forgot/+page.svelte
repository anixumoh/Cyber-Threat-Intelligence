<script lang="ts">
  import { Button, ButtonSet, FormGroup, InlineLoading, TextInput } from 'carbon-components-svelte';
  import { ArrowRight } from 'carbon-icons-svelte';
  import { createForm } from 'felte';
  import { validator } from '@felte/validator-yup';
  import * as yup from 'yup';
  import ReCaptcha from '$lib/components/ReCaptcha.svelte';
  import notifications from '$stores/notification';
  import axios from 'axios';
  import { goto } from '$app/navigation';

  const schema = yup.object({
    email: yup.string().email().required(),
    repeat: yup.string().oneOf([yup.ref('email')], 'Mail must match'),
    captchaSolved: yup.boolean().required().oneOf([true])
  });

  const { form, isValid, errors, isSubmitting, data, reset } = createForm<yup.InferType<typeof schema>>({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      const url = '/api/v2/user/forgot_password';
      const payload = {
        email: values.email,
        url: `${window.location.origin}/renew-password`
      };
      const instance = axios.create();
      await instance
        .post(url, payload, {
          headers: {
            'Content-Type': 'application/json',
            uirequest: 'true'
          }
        })
        .then((response) => {
          if (response.status === 200) {
            notifications.notify({ title: 'An email has been sent, please check your inbox', kind: 'success' });
          }
        })
        .catch((error) => {
          const message = error?.response?.data?.field || 'An error has occurred';
          notifications.notify({ title: message, kind: 'error' });
        })
        .finally(() => {
          goto('/login');
        });
    }
  });
</script>

<form use:form class="flex flex-col">
  <FormGroup>
    <TextInput
      type="email"
      labelText="Email"
      placeholder="example@organization.com"
      name="email"
      invalidText={$errors.email && $errors.email[0]}
      invalid={!!$errors.email}
    />
  </FormGroup>
  <FormGroup>
    <TextInput
      type="email"
      labelText="Repeat Email"
      placeholder="example@organization.com"
      name="repeat"
      invalidText={$errors.repeat && $errors.repeat[0]}
      invalid={!!$errors.repeat}
    />
  </FormGroup>

  <div class="mx-auto mb-2">
    <ReCaptcha
      on:solve={() => {
        $data.captchaSolved = true;
      }}
    />
  </div>

  <ButtonSet>
    <Button
      id="login"
      type="submit"
      kind="primary"
      disabled={$isSubmitting || !$isValid}
      icon={$isSubmitting ? InlineLoading : ArrowRight}
    >
      Recover
    </Button>
    <Button href="/login" kind="ghost" class="justify-end">Go back to login</Button>
  </ButtonSet>
</form>
