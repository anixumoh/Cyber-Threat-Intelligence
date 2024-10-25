<script lang="ts">
  import { validator } from '@felte/validator-yup';
  import {
    Checkbox,
    FormGroup,
    Select,
    SelectItem,
    SkeletonPlaceholder,
    Tag,
    TextInput,
    TooltipIcon
  } from 'carbon-components-svelte';
  import { createForm } from 'felte';
  import * as yup from 'yup';
  import { Information } from 'carbon-icons-svelte';
  import { orgToEdit, organizationsStore } from '$stores/organization';
  import { createEventDispatcher, onMount } from 'svelte';
  import Client from '$lib/client';
  import notifications from '$stores/notification';
  import { emailRegexp, phoneRegexp } from '$lib/utils/regexPatterns';
  import CustomerSearch from '$lib/components/CustomerSearch.svelte';

  const MAX_ORG_NAME_LENGTH = 45;
  let loadingCountries = false;
  let countries = [];
  const dispatch = createEventDispatcher<{ save: void }>();

  const schema = yup.object({
    title: yup.string(),
    customerId: yup.number().required('Customer is mandatory'),
    phone: yup.string().matches(new RegExp(phoneRegexp), 'Phone must have a valid format'),
    email: yup.string().matches(new RegExp(emailRegexp), 'Email must be a valid email').required(),
    firstName: yup.string().required(),
    name: yup.string().required(),
    surname: yup.string().required(),
    country: yup.string().required(),
    enabled: yup.boolean(),
    trial: yup.boolean(),
    twoFA: yup.boolean(),
    userWorkedOnLevel: yup.boolean()
  });

  $: setInitialValues({
    customerId: $orgToEdit.customerId,
    name: $orgToEdit.name,
    title: $orgToEdit.contact.firstContact.title,
    phone: $orgToEdit.contact.firstContact.phone,
    email: $orgToEdit.contact.firstContact.email,
    firstName: $orgToEdit.contact.firstContact.firstName,
    surname: $orgToEdit.contact.firstContact.lastName,
    country: $orgToEdit.contact.firstContact.country,
    enabled: $orgToEdit.enabled,
    trial: $orgToEdit.trial,
    twoFA: $orgToEdit.enabledMfa,
    userWorkedOnLevel: $orgToEdit.userWorkedOn
  });

  export const { form, isValid, errors, isSubmitting, data, handleSubmit, setTouched, setInitialValues } = createForm<
    yup.InferType<typeof schema>
  >({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      try {
        await organizationsStore.editOrgInfo({ ...values });
        notifications.notify({ kind: 'success', title: 'Success', subtitle: 'Changes applied correctly' });
        dispatch('save');
      } catch (error) {
        const errorMessage = error.response?.data?.errorMessages?.[0].message
          ? error.response?.data?.errorMessages?.[0]?.message
          : 'There was a problem while editing the organization, please try again later.';

        notifications.notify({
          kind: 'error',
          title: 'Error',
          subtitle: errorMessage
        });
      }
    }
  });
  onMount(async () => {
    await loadCountries();
  });

  async function loadCountries() {
    loadingCountries = true;
    const client = new Client();
    countries = await client.settings.getCountries();
    loadingCountries = false;
  }
</script>

<form use:form>
  <FormGroup>
    <div class="flex flex-col">
      <div class="flex justify-between">
        <div class="flex justify-start gap-2 items-center">
          <span>Created:</span>
          <Tag>
            {new Date($orgToEdit.createdAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </Tag>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative top-[-12px] right-3">
            <TooltipIcon
              class="absolute  "
              direction="right"
              tooltipText="If checked, only the user that is working on a threat will be able to see the `Worked on` checkmark."
              icon={Information}
            />
          </div>
          <Checkbox
            name="userWorkedOnLevel"
            checked={$data.userWorkedOnLevel}
            id="userWorkedOnLevel"
            labelText="User Worked On Level"
          />
          <Checkbox name="enabled" checked={$data.enabled} id="enabled" labelText="Enabled" />
          <Checkbox name="trial" checked={$data.trial} id="trial" labelText="Trial" />
          <Checkbox name="twoFA" checked={$data.twoFA} id="twoFA" labelText="2FA" />
        </div>
      </div>
      <div class="flex mt-6 justify-center">
        <TextInput
          invalid={!!$errors.name}
          invalidText="Name is mandatory"
          maxlength={MAX_ORG_NAME_LENGTH}
          id="name"
          name="name"
          labelText="Name"
          placeholder="Enter name..."
        />
        <div class="mb-2 ml-1 mr-4 pt-9">
          {$data.name ? $data.name.length : 0} / {MAX_ORG_NAME_LENGTH}
        </div>

        <div>
          <CustomerSearch
            bind:customerId={$data.customerId}
            initialCustomerId={$orgToEdit.customerId}
            on:select={(e) => ($orgToEdit.customerId = e.detail.selectedId)}
            on:clear={() => ($orgToEdit.customerId = null)}
            on:blur={() => setTouched('customerId', true)}
            invalid={!!$errors?.customerId?.[0]}
            invalidText={$errors?.customerId?.[0]}
          />
        </div>
      </div>
      <div class="mt-6">
        <div class="flex items-center border-solid border-b">
          <h6 class="mb-0 mr-3 font-[500] leading-[1.2] text-[22px]">First Contact</h6>
        </div>
      </div>
      <div class="mt-6">
        <div class="flex gap-10">
          <div>
            <TextInput name="title" id="title" labelText="Title" placeholder="Enter title..." />
          </div>
          <div class="grow-[10]">
            <TextInput
              name="firstName"
              invalid={!!$errors.firstName}
              invalidText="First Name is mandatory"
              id="fname"
              labelText="First Name (*)"
              placeholder="Enter first name..."
            />
          </div>
        </div>
      </div>
      <div class="mt-6">
        <div class="flex gap-6">
          <TextInput
            name="surname"
            invalid={!!$errors.surname}
            invalidText="Surname is mandatory"
            id="surname"
            labelText="Surname (*)"
            placeholder="Enter surname..."
          />
          <TextInput
            name="phone"
            invalid={!!$errors.phone}
            invalidText="Phone must have a valid format"
            id="phone"
            labelText="Phone"
            placeholder="Enter phone..."
          />
        </div>
      </div>
      <div class="mt-6">
        <div class="flex gap-6">
          <TextInput
            name="email"
            invalid={!!$errors.email}
            invalidText="Email should be correct and not empty"
            id="email"
            labelText="Email (*)"
            placeholder="Enter email..."
          />

          {#if loadingCountries}
            <div class="flex items-end flex-1">
              <SkeletonPlaceholder class="w-full h-[42px]" />
            </div>
          {:else}
            <Select
              class="flex-1 mt-1"
              name="country"
              bind:selected={$orgToEdit.contact.firstContact.country}
              labelText="Country"
            >
              {#each countries as country}
                <SelectItem value={country.id} text={country.name} />
              {/each}
            </Select>
          {/if}
        </div>
      </div>
    </div>
  </FormGroup>
</form>
