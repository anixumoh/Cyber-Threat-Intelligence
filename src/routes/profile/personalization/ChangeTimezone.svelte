<script lang="ts">
  import Client from '$lib/client';
  import userStore from '$stores/user';
  import { Button, FormGroup, InlineLoading, TextInput } from 'carbon-components-svelte';
  import { onMount } from 'svelte';
  import notifications from '$stores/notification';
  import Autocomplete from '$lib/components/Autocomplete.svelte';
  import * as yup from 'yup';
  import { createForm } from 'felte';
  import { validator } from '@felte/validator-yup';

  onMount(() => {
    loadForm();
  });

  let timezones: string[] = [];

  const client = new Client();
  const minMaxError = 'Timeout must be between 1 and 99';
  const schema = yup.object({
    timezone: yup
      .string()
      .required('This field is required')
      .test('valid-timezone', 'Invalid timezone', (tz) => timezones.indexOf(tz) !== -1),
    timeout: yup.number().required(minMaxError).min(1, minMaxError).max(99, minMaxError)
  });

  const { form, isValid, errors, isSubmitting, data, createSubmitHandler } = createForm<yup.InferType<typeof schema>>({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      try {
        await Promise.all([client.user.setTimeOut(values.timeout), client.user.setTimeZones(values.timezone)]);

        $userStore = {
          ...$userStore,
          timezone: values.timezone,
          sessionTimeout: values.timeout
        };

        notifications.notify({
          kind: 'success',
          title: 'Your account was updated successfully!',
          subtitle: 'Account update successful'
        });
      } catch (error) {
        const msg = error?.response?.data?.message || 'Something went wrong';
        notifications.notify({
          kind: 'error',
          title: msg
        });
      }
    }
  });
  const submit = createSubmitHandler();

  async function loadForm() {
    timezones = await client.user.getTimezones();
    $data.timezone = $userStore.timezone || '';
    $data.timeout = $userStore.sessionTimeout;
  }
</script>

<form use:form class="w-full">
  <FormGroup class="w-full flex">
    <div class="w-full">
      <Autocomplete
        name="timezone"
        bind:selectedValue={$data.timezone}
        items={timezones.map((tz) => ({ id: tz }))}
        display="id"
        value="id"
        titleText="Country Time Zone"
        invalidText={$errors?.timezone?.join(', ')}
        invalid={!!$errors.timezone}
      />
    </div>
  </FormGroup>

  <FormGroup class="w-full">
    <TextInput
      name="timeout"
      type="number"
      label="Session Timeout (minutes)"
      min={1}
      max={99}
      required
      bind:value={$data.timeout}
      invalidText={$errors?.timeout?.join(', ')}
      invalid={!!$errors.timeout}
    />
  </FormGroup>

  <Button
    on:click={submit}
    type="button"
    icon={$isSubmitting ? InlineLoading : undefined}
    disabled={$isSubmitting || !$isValid}
  >
    Submit
  </Button>
</form>
