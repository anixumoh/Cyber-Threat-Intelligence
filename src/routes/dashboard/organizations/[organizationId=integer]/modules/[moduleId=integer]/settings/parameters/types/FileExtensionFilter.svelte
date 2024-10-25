<script lang="ts">
  import Client from '$lib/client';
  import type Module from '$lib/types/module';
  import { currentModule } from '$stores/module';
  import notifications from '$stores/notification';
  import { currentOrganizationId } from '$stores/organization';
  import roleStore from '$stores/role';
  import { Checkbox, TooltipDefinition } from 'carbon-components-svelte';
  import { ERROR_DEFAULT } from '../messages';
  import ParameterBase from './ParameterBase.svelte';

  export let apiPath: string;
  export let title: string;
  export let info: string;

  const items = [
    {
      name: 'Documents',
      value: 'doc',
      formats: 'doc, docx, odt, pages, rtf, tex, txt, wpd, wps, ps, eps, pdf, xlr, xls, xlsx, ppt, pptx, pps, odp'
    },
    {
      name: 'Data Files',
      value: 'data',
      formats: 'csv, dat, gbr, ged, ibooks, key, keychain, sdf, tar, tax2012, vcf, xml, log, msg, pst, json'
    },
    {
      name: 'Audio',
      value: 'audio',
      formats: 'aif, iff, m3u, m4a, mid, mp3, mpa, ra, wav, wma'
    },
    {
      name: 'Video',
      value: 'video',
      formats: '3g2, 3gp, asf, asx, avi, flv, mov, mp4, mpg, rm, srt, swf, vob, wmv'
    },
    {
      name: 'Image',
      value: 'image',
      formats: '3dm, 3ds, max, obj, bmp, dds, gif, jpg, jpeg, png, psd, pspimage, tga, thm, tif, tiff, yuv, svg'
    },
    {
      name: 'Compressed',
      value: 'zip',
      formats: '7z, cbr, deb, gz, pkg, rar, rpm, sitx, targz, zip, zipx'
    },
    {
      name: 'Disk Image',
      value: 'disk',
      formats: 'bin, cue, dmg, iso, mdf, toast, vcd'
    },
    {
      name: 'Code',
      value: 'code',
      formats:
        'js, cs, php, html, htm, md, css, py, po, jsp, jsx, aspx, swift, strings, cpp, ts, pot, graphql, java, class, c, cgi, pl, h, vb'
    },
    { name: 'Other', value: 'other', formats: 'Any extension not included previously' }
  ];

  const client = new Client();
  let selectedIds: string[] = [];
  let loading = false;
  let loadingExtension: string[] = [];

  $: getItems($currentOrganizationId, $currentModule, apiPath);

  async function getItems(organizationId: number, module: Module, apiPath: string) {
    loading = true;
    const response = await client.modules.getModuleSettings(organizationId, module, apiPath);
    selectedIds = response.values.map((val) => val.value);
    loading = false;
  }

  async function onChange(key: string, checked: boolean) {
    loadingExtension = [...loadingExtension, key];

    const payload = {
      type: apiPath.toUpperCase(),
      values: [{ value: key }]
    };

    try {
      if (checked) {
        await client.modules.setModuleSettings($currentOrganizationId, $currentModule, payload);
      } else {
        await client.modules.deleteModuleSettings($currentOrganizationId, $currentModule, payload);
      }
    } catch (error) {
      notifications.notify({ kind: 'error', title: ERROR_DEFAULT });
    }

    loadingExtension = loadingExtension.filter((ext) => ext !== key);
  }
</script>

<ParameterBase {title} {items} {info} {loading} itemKey="value" itemValue="name" hideSelectAll hideSearch>
  <svelte:fragment slot="item" let:item>
    <div class="flex justify-between items-center border-b border-solid border-ctip-light py-2 px-2 w-full">
      <div class="grid grid-flow-col items-center">
        <div class="w-10">
          <Checkbox
            disabled={loading || loadingExtension.includes(item.value) || $roleStore.customer || $roleStore.operator}
            on:check={(e) => onChange(item.value, e.detail)}
            checked={selectedIds.includes(item.value)}
            bind:group={selectedIds}
            value={item.value}
            class="m-0 mr-2 [&_label]:m-0"
          />
        </div>
        <TooltipDefinition
          direction={item.value === 'other' || item.value === 'code' ? 'top' : 'bottom'}
          align="start"
          tooltipText={item.formats}
          class="[&_button]:text-sm"
        >
          {item.name}
        </TooltipDefinition>
      </div>
    </div>
  </svelte:fragment>
</ParameterBase>
