<script lang="ts">
  import Client from '$lib/client';
  import CustomerSearch from '$lib/components/CustomerSearch.svelte';
  import { PASSWORD_STRICT_MESSAGE } from '$lib/constants/text';
  import type { UserPayload } from '$lib/types/admin';
  import type Organization from '$lib/types/organization';
  import { emailRegexp, passwordRegex } from '$lib/utils/regexPatterns';
  import notifications from '$stores/notification';
  import { organizationsStore } from '$stores/organization';
  import roleStore from '$stores/role';
  import { validator } from '@felte/validator-yup';
  import axios from 'axios';
  import {
    Button,
    Checkbox,
    FormGroup,
    InlineLoading,
    Modal,
    PasswordInput,
    RadioButton,
    RadioButtonGroup,
    RadioButtonSkeleton,
    Select,
    SelectItem,
    SkeletonPlaceholder,
    TextInput,
    TextInputSkeleton
  } from 'carbon-components-svelte';
  import { Add, Save } from 'carbon-icons-svelte';
  import { createForm } from 'felte';
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import * as yup from 'yup';
  import PermissionTable from './PermissionTable.svelte';
  import type { Grant, OrganizationSearchGrant } from './types';

  export let open = false;
  export let userId: number | null = null;

  const client = new Client();
  const dispatch = createEventDispatcher<{ saved: void }>();

  const usernameRegex = /^[^\]!?#^\"'%&;()<>/={}|*+~`\[/\s]*$/;
  const phoneRegex = /(^$|^(\\+\\s?[0-9]{2}[\\-\\.\\s]?)?([0-9][\\-\\.\\s]?){9,12}$)/;

  const schema = yup.object({
    id: yup.mixed(),
    name: yup.string().required(),
    firstSurname: yup.string().required(),
    secondSurname: yup.string(),
    username: yup
      .string()
      .matches(usernameRegex, 'Username must not contain white spaces or invalid characters')
      .required(),
    address: yup.string(),
    email: yup.string().matches(new RegExp(emailRegexp), 'Email must be a valid email').required(),
    password: yup.string().test('password', PASSWORD_STRICT_MESSAGE, (password) => {
      if (!!userId) return true;
      return !!password?.match(passwordRegex);
    }),
    telephone: yup.string().nullable(),
    cellphone: yup.string().nullable().matches(phoneRegex, 'Cellphone must be a valid phone'),
    job: yup.string(),
    customerId: yup
      .number()
      .nullable()
      .test('required', 'customer is a required field', (customer) => {
        if ($roleStore.superadmin || $roleStore.master) {
          return !!customer;
        }
        return true;
      }),
    expirationTime: yup.mixed(),
    timezone: yup.string().required(),
    api: yup.boolean()
  });

  const { form, errors, isSubmitting, reset, handleSubmit, data, setInitialValues } = createForm<
    yup.InferType<typeof schema>
  >({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      const userPayload: UserPayload = {
        ...values,
        grants
      };
      if (user_type === 'user' && !grants.superSearchGrants.length) {
        notifications.notify({
          kind: 'error',
          title: 'Error',
          subtitle:
            'To save the modifications or create a new user it is necessary to assign a role, an organization and module permissions'
        });
        return;
      }
      try {
        await client.admin.saveUser(userPayload);
        open = false;
        dispatch('saved');
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error?.response?.data?.field === 'Username already exists') {
            $errors['username'] = ['This username is already in use.'];
          } else if (error?.response?.data?.field === 'Email already exists') {
            $errors['email'] = ['This e-mail is already in use'];
          } else {
            notifications.notify({
              kind: 'error',
              title: 'Error'
            });
          }
        }
      }
    }
  });

  type UserType = 'master' | 'mssp_admin' | 'superadmin' | 'user';

  let organizationSearchGrant: OrganizationSearchGrant[] = [];
  let user_type: UserType = 'user';
  let timezones: string[] = [];
  let organizationModalOpen = false;
  let selectedOrganizations: Organization[] = [];
  let initialGrants: OrganizationSearchGrant[];
  let initialCustomerId: number;
  let loading = false;

  $: grants = setGrants(user_type, organizationSearchGrant);
  $: selectedOrganizationIds = selectedOrganizations.map((o) => o.id);
  $: avaliableOrganizations = $organizationsStore.filter((o) => !selectedOrganizationIds.includes(o.id));
  $: open && getTimezones();

  $: if (open && userId) {
    getUser(userId);
  } else {
    setInitialData();
  }

  function setGrants(user_type: UserType, organizationSearchGrant: OrganizationSearchGrant[]): Grant {
    const grant: Grant = {
      master: user_type === 'master',
      mssp_admin: user_type === 'mssp_admin',
      sales: false,
      superadmin: user_type === 'superadmin',
      superSearchGrants: []
    };
    if (user_type === 'user') {
      grant.superSearchGrants = organizationSearchGrant;
    }
    return grant;
  }

  async function getTimezones() {
    if (timezones.length) return;
    timezones = await client.user.getTimezones();
  }

  async function getUser(userId: number) {
    loading = true;
    const userDetails = await client.admin.getUser(userId);
    setInitialValues({
      id: userDetails.id,
      name: userDetails.name,
      firstSurname: userDetails.firstSurname,
      secondSurname: userDetails.secondSurname,
      username: userDetails.username,
      address: userDetails.address,
      email: userDetails.email,
      password: '',
      telephone: userDetails.telephone,
      cellphone: userDetails.cellphone,
      job: userDetails.job,
      customerId: userDetails.customerId,
      expirationTime: userDetails.expirationTime,
      timezone: userDetails.timezone,
      api: userDetails.api
    });
    reset();

    initialCustomerId = userDetails.customerId;

    if (userDetails.grants.superadmin) {
      user_type = 'superadmin';
    } else if (userDetails.grants.mssp_admin) {
      user_type = 'mssp_admin';
    } else if (userDetails.grants.master) {
      user_type = 'master';
    } else {
      user_type = 'user';
      initialGrants = userDetails.grants.superSearchGrants;
      const orgIds = initialGrants.map((grant) => grant.itemId);
      selectedOrganizations = orgIds.map((id) => $organizationsStore.find((o) => o.id === id)).filter(Boolean);
    }
    loading = false;
  }

  async function setInitialData() {
    loading = true;
    await tick();
    setInitialValues({
      id: '',
      name: '',
      firstSurname: '',
      secondSurname: '',
      username: '',
      address: '',
      email: '',
      password: '',
      telephone: '',
      cellphone: '',
      job: '',
      customerId: null,
      expirationTime: '',
      timezone: 'Europe/Madrid',
      api: false
    });
    reset();
    user_type = 'user';
    selectedOrganizations = [];
    initialCustomerId = null;
    loading = false;
  }

  function selectOrganization(organization: Organization) {
    selectedOrganizations = [...selectedOrganizations, organization];
  }
</script>

<Modal
  bind:open
  modalHeading={userId ? 'Edit User' : 'Create User'}
  size="lg"
  primaryButtonText={userId ? 'Save' : 'Create'}
  secondaryButtonText="Close"
  primaryButtonIcon={$isSubmitting ? InlineLoading : Save}
  primaryButtonDisabled={$isSubmitting}
  on:submit={handleSubmit}
  on:click:button--secondary={() => (open = false)}
  preventCloseOnClickOutside
>
  <div class="px-4 py-2">
    <form use:form>
      <div class="grid grid-cols-1 gap-x-8 md:grid-cols-3 items-center justify-center">
        <FormGroup>
          {#if loading}
            <TextInputSkeleton />
          {:else}
            <TextInput
              bind:value={$data.name}
              name="name"
              labelText="Name (*)"
              invalidText={$errors?.name?.join(', ')}
              invalid={!!$errors.name}
            />
          {/if}
        </FormGroup>

        <FormGroup>
          {#if loading}
            <TextInputSkeleton />
          {:else}
            <TextInput
              bind:value={$data.firstSurname}
              name="firstSurname"
              labelText="Surname (*)"
              invalidText={$errors?.firstSurname?.join(', ')}
              invalid={!!$errors.firstSurname}
            />
          {/if}
        </FormGroup>

        <FormGroup>
          {#if loading}
            <TextInputSkeleton />
          {:else}
            <TextInput
              bind:value={$data.username}
              name="username"
              labelText="Username (*)"
              invalidText={$errors?.username?.join(', ')}
              invalid={!!$errors.username}
            />
          {/if}
        </FormGroup>

        <FormGroup>
          {#if loading}
            <TextInputSkeleton />
          {:else}
            <TextInput
              bind:value={$data.address}
              name="address"
              labelText="Address"
              invalidText={$errors?.address?.join(', ')}
              invalid={!!$errors.address}
            />
          {/if}
        </FormGroup>

        <FormGroup>
          {#if loading}
            <TextInputSkeleton />
          {:else}
            <TextInput
              bind:value={$data.email}
              name="email"
              labelText="Email (*)"
              invalidText={$errors?.email?.join(', ')}
              invalid={!!$errors.email}
            />
          {/if}
        </FormGroup>

        {#if !userId}
          <FormGroup>
            {#if loading}
              <TextInputSkeleton />
            {:else}
              <PasswordInput
                bind:value={$data.password}
                name="password"
                labelText="Password (*)"
                invalidText={$errors?.password?.join(', ')}
                invalid={!!$errors.password}
                helperText={PASSWORD_STRICT_MESSAGE}
                tooltipAlignment="end"
              />
            {/if}
          </FormGroup>
        {/if}

        <FormGroup>
          {#if loading}
            <TextInputSkeleton />
          {:else}
            <TextInput
              bind:value={$data.cellphone}
              name="cellphone"
              labelText="Cellphone"
              invalidText={$errors?.cellphone?.join(', ')}
              invalid={!!$errors.cellphone}
            />
          {/if}
        </FormGroup>

        <FormGroup>
          {#if loading}
            <TextInputSkeleton />
          {:else}
            <TextInput
              bind:value={$data.job}
              name="job"
              labelText="Company"
              invalidText={$errors?.job?.join(', ')}
              invalid={!!$errors.job}
            />
          {/if}
        </FormGroup>

        {#if $roleStore.superadmin || $roleStore.master}
          <FormGroup>
            <CustomerSearch
              bind:customerId={$data.customerId}
              {initialCustomerId}
              invalidText={$errors?.customerId?.join(', ')}
              invalid={!!$errors.customerId}
            />
          </FormGroup>
        {/if}

        <FormGroup>
          {#if loading}
            <TextInputSkeleton />
          {:else}
            <Select
              labelText="Timezone (*)"
              name="timezone"
              bind:selected={$data.timezone}
              invalidText={$errors?.timezone?.join(', ')}
              invalid={!!$errors.timezone}
            >
              <SelectItem disabled value="--- Select ---" />
              {#each timezones as timezone}
                <SelectItem value={timezone} />
              {/each}
            </Select>
          {/if}
        </FormGroup>

        {#if $roleStore.superadmin || $roleStore.master}
          <FormGroup class="{userId ? '' : 'mt-6'} [&_label]:m-0">
            <Checkbox skeleton={loading} bind:checked={$data.api} name="api" labelText="API user" />
          </FormGroup>
        {/if}
      </div>
    </form>

    <div class="p-3 border bg-ctip-hover-ui">User type</div>

    <RadioButtonGroup
      bind:selected={user_type}
      class="mt-2 [&>fieldset]:w-full [&>fieldset]:flex [&>fieldset]:flex-col [&>fieldset]:gap-2 [&>fieldset]:md:flex-row [&>fieldset]:basis-0 [&>fieldset]:grow [&>fieldset]:md:gap-8"
    >
      {#if $roleStore.master}
        <div class="flex items-center justify-start p-2 border rounded basis-0 grow w-full">
          {#if loading}
            <RadioButtonSkeleton />
          {:else}
            <RadioButton name="user-type" value="master" labelText="Master" />
          {/if}
        </div>
      {/if}
      {#if $roleStore.master || $roleStore.superadmin}
        <div class="flex items-center justify-start p-2 border rounded basis-0 grow w-full">
          {#if loading}
            <RadioButtonSkeleton />
          {:else}
            <RadioButton name="user-type" value="superadmin" labelText="Superadmin" />
          {/if}
        </div>
      {/if}
      <div class="flex items-center justify-start p-2 border rounded basis-0 grow w-full">
        {#if loading}
          <RadioButtonSkeleton />
        {:else}
          <RadioButton name="user-type" value="mssp_admin" labelText="Administrator" />
        {/if}
      </div>
      <div class="flex items-center justify-start p-2 border rounded basis-0 grow w-full">
        {#if loading}
          <RadioButtonSkeleton />
        {:else}
          <RadioButton name="user-type" value="user" labelText="User" />
        {/if}
      </div>
    </RadioButtonGroup>

    {#if user_type === 'user'}
      <div class="flex items-center justify-between p-3 mt-4 border bg-ctip-hover-ui">
        <div>Permissions to Organizations/Modules</div>
        <Button on:click={() => (organizationModalOpen = true)} class="rounded" size="small" icon={Add} kind="primary">
          Add Organization
        </Button>
      </div>

      {#if loading}
        <SkeletonPlaceholder class="w-full" />
      {:else}
        <PermissionTable
          {initialGrants}
          bind:organizations={selectedOrganizations}
          bind:searchGrant={organizationSearchGrant}
        />
      {/if}
    {/if}
  </div>
</Modal>

<Modal
  bind:open={organizationModalOpen}
  size="xs"
  modalHeading="Organizations"
  primaryButtonText="Close"
  on:click:button--primary={() => (organizationModalOpen = false)}
>
  <div class="grid p-3">
    {#each avaliableOrganizations as organization}
      <Button
        on:click={() => selectOrganization(organization)}
        class="w-full min-w-full border"
        kind="ghost"
        icon={Add}
        title={organization.name}
      >
        <span class="overflow-hidden text-ellipsis whitespace-nowrap">
          {organization.name}
        </span>
      </Button>
    {:else}
      There are no more organizations
    {/each}
  </div>
</Modal>
