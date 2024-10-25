<script lang="ts">
  import Client from '$lib/client';
  import type { CreateIssueType, IssueType, IssueTypeType, IssueUserType } from '$lib/client/services/threats';
  import { currentModule } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import {
    Button,
    FormGroup,
    InlineLoading,
    Modal,
    Select,
    SelectItem,
    Tab,
    TabContent,
    Tabs,
    TextInput
  } from 'carbon-components-svelte';
  import { AddAlt, CloseOutline } from 'carbon-icons-svelte';
  import { createForm } from 'felte';
  import { validator } from '@felte/validator-yup';
  import * as yup from 'yup';
  import { createEventDispatcher } from 'svelte';
  import roleStore from '$stores/role';
  import Autocomplete from './Autocomplete.svelte';

  export let open = false;
  export let resources = [];

  const client = new Client();
  const NEW_INCIDENT_TAB = 0;
  const EXISTING_INCIDENT_TAB = 1;
  const dispatch = createEventDispatcher();

  const schema = yup.object({
    name: yup.string().required(),
    type: yup.string().required(),
    user: yup.string()
  });

  const { form, isValid, data } = createForm<yup.InferType<typeof schema>>({
    extend: validator({ schema })
  });

  let assignMode = false;
  let loading = false;
  let saving = false;
  let selectedTab = 1;
  let selectedExisting: number;
  let assignedIssues: IssueType[] = [];
  let issueTypes: IssueTypeType[] = [];
  let issueUsers: IssueUserType[] = [];
  let existingIssues: IssueType[] = [];

  $: modalHeading = assignMode ? 'Assign to an incident' : 'List of incidents';

  async function load() {
    loading = true;
    if (resources.length === 1 && resources[0].hasIncident) {
      assignMode = false;
      assignedIssues = await client.threats.getResourceIssues(
        resources[0].resourceId,
        $currentOrganizationId,
        $currentModule
      );
      if (assignedIssues.length) {
        loading = false;
        return;
      }
    }
    await changeToAssignMode();
    loading = false;
  }

  async function changeToAssignMode() {
    loading = true;
    assignMode = true;
    selectedTab = 1;
    [issueTypes, issueUsers, existingIssues] = await Promise.all([
      client.threats.getIssueTypes($currentOrganizationId, $currentModule),
      client.threats.getIssueUsers($currentOrganizationId, $currentModule.id),
      client.threats.getExistingIssues($currentOrganizationId, $currentModule)
    ]);
    loading = false;
  }

  async function deleteAssignedIssue(issue: IssueType) {
    const resourceId = resources[0].resourceId;
    await client.threats.deleteAssignedIssue($currentOrganizationId, $currentModule, resourceId, issue.id);
    assignedIssues = await client.threats.getResourceIssues(resourceId, $currentOrganizationId, $currentModule);
    if (assignedIssues.length === 0) {
      dispatch('deleteAll');
      await changeToAssignMode();
    }
  }

  async function save() {
    saving = true;
    const resourceIds = resources.map((resource) => resource.resourceId);
    if (selectedTab === NEW_INCIDENT_TAB) {
      const issue: CreateIssueType = {
        description: '',
        remediationTips: '',
        title: $data.name,
        typeId: $data.type,
        username: $data.user
      };
      const createdIssue = await client.threats.createIssue($currentOrganizationId, $currentModule.id, issue);
      await client.threats.assignIssueToResource(
        $currentOrganizationId,
        $currentModule.id,
        createdIssue.issueId,
        resourceIds
      );
    } else if (selectedTab === EXISTING_INCIDENT_TAB) {
      await client.threats.assignExistingIssueToResources(
        $currentOrganizationId,
        $currentModule,
        selectedExisting,
        resourceIds
      );
    }
    dispatch('save');
    open = false;
    saving = false;
  }
</script>

<Modal
  size="sm"
  bind:open
  {modalHeading}
  secondaryButtonText={assignMode ? 'Cancel' : ''}
  primaryButtonText={assignMode ? 'Save' : 'Cancel'}
  primaryButtonDisabled={!assignMode ? false : selectedTab === NEW_INCIDENT_TAB ? !$isValid : !selectedExisting}
  primaryButtonIcon={saving ? InlineLoading : undefined}
  on:click:button--secondary={() => (open = false)}
  on:open={load}
  on:click:button--primary={assignMode ? save : () => (open = false)}
>
  {#if loading}
    <InlineLoading class="flex items-center justify-center h-full" />
  {:else if assignMode}
    <Tabs bind:selected={selectedTab}>
      <Tab label="New incident" />
      <Tab label="Existing incident" />
      <svelte:fragment slot="content">
        <!-- New Incident -->
        <TabContent>
          <form use:form>
            <FormGroup>
              <TextInput name="name" labelText="Name" />
            </FormGroup>
            <FormGroup>
              <Select name="type" labelText="Select Incident Type">
                <SelectItem value="" />
                {#each issueTypes as issueType}
                  <SelectItem value={issueType.value} text={issueType.label} />
                {/each}
              </Select>
            </FormGroup>
            <FormGroup>
              <Autocomplete
                bind:selectedValue={$data.user}
                direction="top"
                name="user"
                title="Select a user"
                items={issueUsers}
                value="username"
                display="username"
              />
            </FormGroup>
          </form>
        </TabContent>

        <!-- Existing incident -->
        <TabContent>
          <FormGroup>
            <Select data-test="select-incident" bind:selected={selectedExisting} labelText="Select Incident">
              <SelectItem value="" />
              {#each existingIssues as issue}
                <SelectItem value={issue.id} text={issue.title} />
              {/each}
            </Select>
          </FormGroup>
        </TabContent>
      </svelte:fragment>
    </Tabs>
  {:else}
    <div class="px-2 py-10">
      {#each assignedIssues as assignedIssue}
        <div class="flex justify-between border-b-[1px] border-solid border-ctip-border">
          <div class="flex items-center">
            <a
              href="/dashboard/organizations/{assignedIssue.organizationId}/modules/{assignedIssue.moduleId}/incidents/{assignedIssue.id}"
            >
              {assignedIssue.title}
            </a>
          </div>
          <div>
            <Button
              disabled={$roleStore.customer || $roleStore.operator}
              kind="ghost"
              class="text-ctip-dangerThreat"
              on:click={() => deleteAssignedIssue(assignedIssue)}
            >
              <CloseOutline />
            </Button>
          </div>
        </div>
      {/each}
      <div>
        <Button data-test="add-incident" on:click={changeToAssignMode} size="field" kind="ghost" icon={AddAlt}>
          Add incident
        </Button>
      </div>
    </div>
  {/if}
</Modal>
