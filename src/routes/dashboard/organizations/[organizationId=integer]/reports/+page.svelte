<script lang="ts">
  import { MODULE_NAME } from '$lib/constants/modules';
  import { modulesStore } from '$stores/module';
  import { currentOrganization, currentOrganizationId } from '$stores/organization';
  import axios from 'axios';
  import { InlineLoading, Button, DatePicker, DatePickerInput, Dropdown } from 'carbon-components-svelte';
  import { Download } from 'carbon-icons-svelte';
  import dayjs from 'dayjs';
  import ReportTile from './ReportTile.svelte';
  import * as FileSaver from 'file-saver';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getSinceOrToDate } from '$lib/utils/functions';

  onMount(() => {
    const selected = $page.url.searchParams.get('selected');
    if (selected) {
      const report = reports.find((report) => report.key === selected);
      if (report) {
        selectReport(report);
      }
    }
  });

  type Report = {
    key: 'threats' | 'all-incidents' | 'credentials' | 'threat_context';
    errorValue: 'threats' | 'incidents' | 'credentials' | 'threat context';
    iconClass: string;
    title: string;
    description: string;
    reportName?: string;
    href?: string;
  };

  const credentialModules = $modulesStore.filter((module) => module.moduleName === MODULE_NAME.CREDENTIAL);
  const threatContextModule = $modulesStore.find((module) => module.moduleName === MODULE_NAME.THREAT_CONTEXT);

  const reports: Report[] = [
    {
      key: 'threats',
      errorValue: 'threats',
      iconClass: 'icon-blv-allthreats',
      title: 'All threats',
      description: 'Terms report',
      reportName: 'terms-report'
    },
    {
      key: 'all-incidents',
      errorValue: 'incidents',
      iconClass: 'icon-blv-warning',
      title: 'All incidents',
      description: 'Monthly report',
      reportName: 'incidents-monthly-report'
    },
    ...(credentialModules.length
      ? [
          {
            key: 'credentials',
            errorValue: 'credentials',
            iconClass: 'icon-blv-credentials',
            title: 'Credentials',
            description: 'Credentials report',
            reportName: 'credentials-report'
          } as Report
        ]
      : []),
    ...(threatContextModule
      ? [
          {
            key: 'threat_context',
            errorValue: 'threat context',
            iconClass: 'icon-blv-threatcontext',
            title: 'Threat Context',
            description: 'Threat Actors report',
            href: `/dashboard/organizations/${$currentOrganizationId}/modules/${threatContextModule.id}/threat_context/actors`
          } as Report
        ]
      : [])
  ];

  let selected: Report = reports[0];
  let selectedModuleId = credentialModules.length ? credentialModules[0].id : undefined;
  let since: dayjs.Dayjs;
  let to: dayjs.Dayjs;
  let loading = false;
  let error = '';

  $: moreThan31Days = since && to && to.diff(since, 'day') >= 31;
  $: disabled = loading || moreThan31Days || isDisabled(since, to, selected, selectedModuleId);

  async function selectReport(report: Report) {
    error = '';
    if (report.key === 'threat_context') {
      await goto(report.href);
      setTimeout(() => {
        document.getElementById('threat-context-report')?.click();
      }, 1000);
    } else {
      selected = report;
    }
  }

  function pickDate(event) {
    if (event.detail.selectedDates?.length === 2) {
      since = dayjs(event.detail.selectedDates[0]);
      to = dayjs(event.detail.selectedDates[1]);
    }
  }

  function isDisabled(since: dayjs.Dayjs, to: dayjs.Dayjs, report: Report, selectedModuleId: number) {
    if (!since || !to) return true;
    if (report.key === 'credentials') return !selectedModuleId;
    return false;
  }

  async function downloadReport() {
    loading = true;
    error = '';
    const init = getSinceOrToDate(since);
    const end = getSinceOrToDate(to, false);
    const params = {
      since: init.valueOf(),
      to: end.valueOf()
    };
    let url: string;

    if (selected.key === 'threats') {
      url = `/api/v2/organization/${$currentOrganizationId}/terms/report`;
    } else if (selected.key === 'all-incidents') {
      url = `/api/v2/organization/${$currentOrganizationId}/issue/report`;
    } else if (selected.key === 'credentials') {
      url = `/api/v2/organization/${$currentOrganizationId}/module/${selectedModuleId}/credential/report`;
    } else {
      return;
    }

    const dateFormat = 'YYYYMD';
    const formatFrom = since.format(dateFormat);
    const formatTo = to.format(dateFormat);
    const reportName = `${formatFrom}-${formatTo}-${$currentOrganization.name}-${selected.reportName}.pdf`;

    const response = await axios.get(url, { params, responseType: 'blob' });
    if (response.status === 200) {
      const blob = new Blob([response.data], {
        type: 'application/octet-stream'
      });
      FileSaver.saveAs(blob, reportName);
    } else {
      error = `There are no ${selected.errorValue} for the selected period.`;
    }

    loading = false;
  }
</script>

<h5>Reports</h5>

<hr />

<div class="flex flex-col gap-4 lg:flex-row">
  <div class="grid w-full grid-cols-1 sm:grid-cols-[repeat(2,minmax(0,20rem))] gap-4 max-w-2xl">
    {#each reports as report}
      <ReportTile
        on:click={(e) => {
          e.preventDefault();
          selectReport(report);
        }}
        selected={selected.key === report.key}
        iconClass={report.iconClass}
        title={report.title}
        description={report.description}
        href={report.href}
        disabled={loading}
      />
    {/each}
  </div>

  <div class="flex flex-col justify-between gap-4 px-8 border-gray-400 border-solid lg:border-l">
    <div>
      <h4 class="font-bold">{selected.title}</h4>
      <h6>{selected.description}</h6>
    </div>

    {#if selected.key === 'credentials'}
      <Dropdown
        titleText="Credential modules"
        bind:selectedId={selectedModuleId}
        items={credentialModules.map((m) => ({
          id: m.id,
          text: m.name
        }))}
      />
    {/if}

    <div>
      <DatePicker dateFormat="d/m/y" datePickerType="range" on:change={pickDate}>
        <DatePickerInput labelText="Start date" placeholder="mm/dd/yyyy" />
        <DatePickerInput labelText="End date" placeholder="mm/dd/yyyy" />
      </DatePicker>

      <div class="text-ctip-danger mt-2">
        {#if moreThan31Days}
          The amount of days cannot be higher than 31 days
        {:else if error}
          {error}
        {/if}
      </div>
    </div>
    <Button on:click={downloadReport} icon={loading ? InlineLoading : Download} {disabled}>Download Report</Button>
  </div>
</div>
