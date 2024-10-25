<script lang="ts">
  import type { Incident, IncidentType } from '$lib/client/services/incidents';
  import type { IssueUserType } from '$lib/client/services/threats';
  import roleStore from '$stores/role';
  import { Button, ComboBox, Dropdown, FormGroup, TextArea, TextInput } from 'carbon-components-svelte';
  import { createEventDispatcher } from 'svelte';
  import { createForm } from 'felte';
  import { validator } from '@felte/validator-yup';
  import * as yup from 'yup';

  const dispatch = createEventDispatcher();

  export let incident: Incident;
  export let issueUsers: IssueUserType[];
  export let incidentTypes: IncidentType[];
  export let isSavingIncident = false;
  export let assignee = '';

  const RISK_TYPES = [
    { id: 'CRITICAL', text: 'Critical' },
    { id: 'HIGH', text: 'High' },
    { id: 'MEDIUM', text: 'Medium' },
    { id: 'LOW', text: 'Low' }
  ];

  $: totalNotifiedThreats = incident.notifications.reduce(
    (acc, notification) => acc + notification.resources.length,
    0
  );
  $: totalTimesPublished = incident.notifications.length;

  function save() {
    dispatch('save');
  }

  function validateFields(value: string) {
    return !value.includes('<');
  }
  const schema = yup.object({
    title: yup
      .string()
      .test('valid', 'Not allowed special caracters', validateFields)
      .required('This field is required'),

    brief: yup
      .string()
      .test('valid', 'Not allowed special caracters', validateFields)
      .required('This field is required'),
    remediation: yup.string().test('valid', 'Not allowed special caracters', validateFields)
  });

  const { form, isValid, data, errors } = createForm<yup.InferType<typeof schema>>({
    extend: validator({ schema })
  });
</script>

<form use:form class="grid gap-4 md:grid-cols-2">
  <div>
    <FormGroup>
      {#if $roleStore.customer}
        <TextInput labelText="Type" readonly={$roleStore.customer} value={incident.typeName} />
      {:else}
        <Dropdown
          titleText="Type"
          bind:selectedId={incident.typeId}
          items={incidentTypes.map((it) => ({ id: it.value, text: it.label }))}
          disabled={$roleStore.customer}
        />
      {/if}
    </FormGroup>
    <FormGroup>
      <TextInput
        name="title"
        labelText="Title"
        invalid={!!$errors.title}
        invalidText={$errors?.title?.[0]}
        bind:value={incident.title}
        readonly={$roleStore.customer}
      />
      <!-- {$isValid} -->
    </FormGroup>
    <FormGroup>
      <TextArea
        name="brief"
        labelText="Brief Description"
        invalid={!!$errors.brief}
        invalidText={$errors?.brief?.[0]}
        bind:value={incident.description}
        readonly={$roleStore.customer}
        rows={5}
      />
    </FormGroup>
  </div>

  <div>
    <FormGroup class="flex gap-4">
      {#if incident?.currentIncompleteNotification}
        <TextInput
          labelText="Unnotified threats"
          readonly
          value={incident.currentIncompleteNotification.resources.length}
        />
      {:else}
        <TextInput labelText="Total notified threats" readonly value={totalNotifiedThreats} />
        <TextInput labelText="Total times published" readonly value={totalTimesPublished} />
      {/if}
    </FormGroup>
    <FormGroup>
      {#if $roleStore.customer}
        <TextInput
          class="capitalize"
          labelText="Risk"
          readonly={$roleStore.customer}
          value={incident.risk.toLocaleLowerCase()}
        />
      {:else}
        <Dropdown titleText="Risk" bind:selectedId={incident.risk} items={RISK_TYPES} />
      {/if}
    </FormGroup>
    <FormGroup>
      <TextArea
        name="remediation"
        labelText="Remediation Tips"
        invalid={!!$errors.remediation}
        invalidText={$errors?.remediation?.[0]}
        readonly={$roleStore.customer}
        bind:value={incident.remediationTips}
        rows={incident.currentIncompleteNotification ? 5 : 9}
      />
    </FormGroup>
    <FormGroup>
      {#if $roleStore.customer}
        <TextInput labelText="Assignee" readonly={$roleStore.customer} value={incident?.user?.username} />
      {:else}
        <ComboBox
          direction="top"
          titleText="Assignee"
          selectedId={incident?.user?.username}
          on:select={(e) => (assignee = e.detail.selectedId)}
          on:clear={() => (assignee = '')}
          items={issueUsers.map((user) => ({ id: user.username, text: user.username }))}
          shouldFilterItem={(item, value) => item.text.toLocaleLowerCase().includes(value.toLowerCase())}
        />
      {/if}
    </FormGroup>
    {#if !$roleStore.customer}
      <FormGroup class="flex flex-row-reverse">
        <Button class="px-3" on:click={save} disabled={isSavingIncident || !$isValid}>Update</Button>
      </FormGroup>
    {/if}
  </div>
</form>
