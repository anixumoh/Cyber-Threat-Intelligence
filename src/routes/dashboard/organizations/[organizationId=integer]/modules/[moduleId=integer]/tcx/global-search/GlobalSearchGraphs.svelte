<script lang="ts">
  import Client from '$lib/client';
  import type { Actor, Campaign, TCX_MODEL, Tool } from '$lib/client/services/actors';
  import { COLORS } from '$lib/constants/colors';
  import darkMode from '$stores/darkMode';
  import { SkeletonPlaceholder } from 'carbon-components-svelte';
  import * as go from 'gojs';
  import { onMount } from 'svelte';

  export let actors: Actor[] = [];
  export let campaigns: Campaign[] = [];
  export let tools: Tool[] = [];

  const client = new Client();
  const LINK_DEFAULT_COLOR = 'black';
  const LINK_HIGHLIGHT_COLOR = 'chocolate';

  const { primary, lightBlue } = COLORS;

  onMount(() => {
    go.Diagram.licenseKey =
      '73f943e3b26e28a800ca0d2b113f69ee1bb37b3a9e811ff25e5741a3ef5f694170c9ed7958d68fc3c0e848fd4a7bc1dc8ec33d799145056cee62d6884ae182f9b43273e1110045d9f7042396cefc29a0fb2b78facae672f08a2c88f2f9b8c5c90ceef38618cb1cab2a790532497eaf55b7ff';
    // '73f942e1b66228a800ca0d2b113f69ee1bb37b3a9e811ff25e5741a3ef5f694170c9ed7958d68fc3c0e848fb4a75c1db8dc53d2a9145056fee61d7dc4ae183adb53073b2120a47dbf70a22c6cdfc29a9fb2c79f590b776a28a7b88f0eafad18c5abda3d248985eba3b680530557db04da8f9d8';
    prepareDiagram();
    mounted = true;
    return () => client.abort();
  });

  $: mounted && processData(actors, campaigns, tools);
  $: nodeColor = $darkMode ? lightBlue : primary;

  let mounted = false;
  let element: HTMLDivElement;
  let myDiagram: go.Diagram;
  let loading = false;

  let processedNodes = new Set();
  let processedLinks = new Set();
  let processedRelations = new Set();
  let subprocessedNodes = new Set();
  let nodes = [];
  let links = [];

  async function processData(actors: Actor[], campaigns: Campaign[], tools: Tool[]) {
    if (!actors.length && !campaigns.length && !tools.length) return [];
    processedNodes = new Set();
    processedLinks = new Set();
    processedRelations = new Set();
    subprocessedNodes = new Set();
    nodes = [];
    links = [];

    for (const actor of actors) {
      addNode(actor.id, 'threat-actor', actor.name);
    }

    for (const campaign of campaigns) {
      addNode(campaign.id, 'campaign', campaign.name);
    }

    for (const tool of tools) {
      addNode(tool.id, 'tool', tool.name);
    }

    loading = true;
    await processLinks(actors, campaigns, tools);
    loading = false;

    render(nodes, links);
  }

  function rerender() {
    render(nodes, links);
  }

  function addNode(id: string | number, type: TCX_MODEL, name: string) {
    const key = `${type}-${id}`;
    if (!processedNodes.has(key)) {
      processedNodes.add(key);
      nodes.push({
        key,
        id,
        label: name,
        type,
        icon: type,
        color: nodeColor,
        iconWidth: 30,
        iconHeight: 30,
        portHeight: 15
      });
    }
    return key;
  }

  function addLink(parentKey: string, targetKey: string, name: string) {
    const key = `${parentKey}-${targetKey}`;
    const reverseKey = `${targetKey}-${parentKey}`;
    if (!processedLinks.has(key) && !processedLinks.has(reverseKey)) {
      processedLinks.add(key);
      links.push({
        from: parentKey,
        to: targetKey,
        stroke: LINK_DEFAULT_COLOR,
        label: ''
      });
    }
    return key;
  }

  async function processLinks(actors: Actor[], campaigns: Campaign[], tools: Tool[]) {
    const processActors = actors.map((actor) => processActor(actor.id));
    const processCampaigns = campaigns.map((campaign) => processCampaign(campaign.id));
    const processTools = tools.map((tool) => processTool(tool.id));
    await Promise.all([...processActors, ...processCampaigns, ...processTools]);
  }

  async function processActor(actorId: string | number) {
    await Promise.all([
      getRelationships(actorId, 'threat-actor', 'campaign'),
      getRelationships(actorId, 'threat-actor', 'tool')
    ]);
  }

  async function processCampaign(campaignId: string | number) {
    await Promise.all([
      getRelationships(campaignId, 'campaign', 'threat-actor'),
      getRelationships(campaignId, 'campaign', 'tool')
    ]);
  }

  async function processTool(toolId: string | number) {
    await Promise.all([getRelationships(toolId, 'tool', 'campaign'), getRelationships(toolId, 'tool', 'threat-actor')]);
  }

  async function getRelationships(id: string | number, model: TCX_MODEL, target: TCX_MODEL) {
    const key = `${model}-${target}-${id}`;
    if (processedRelations.has(key)) return;

    const items = await client.actors.getRelationships(id, model, target);
    const parentKey = `${model}-${id}`;

    if (Array.isArray(items)) {
      items.forEach((item) => {
        const targetKey = addNode(item.id, target, item.name);
        addLink(parentKey, targetKey, item.name);
      });
    } else {
      const targetKey = `${target}-${items.id}`;
      let name: string = nodes.find((node) => node.key === targetKey)?.label;
      if (!name) {
        name = await client.actors.getItemName(items.id, target);
      }
      addNode(items.id, target, name);
      addLink(parentKey, targetKey, name);
    }
  }

  const ICONS: Record<TCX_MODEL, string> = {
    'threat-actor':
      'F M29.4146,19,27.7,17.2852A2.97,2.97,0,0,0,28,16a3,3,0,1,0-3,3,2.97,2.97,0,0,0,1.2864-.3L28,20.4141V28H22V25a7.0078,7.0078,0,0,0-7-7H9a7.008,7.008,0,0,0-7,7v5H30V20.4141A1.988,1.988,0,0,0,29.4146,19ZM4,25a5.006,5.006,0,0,1,5-5h6a5.0059,5.0059,0,0,1,5,5v3H4Z F M12,4A5,5,0,1,1,7,9a5,5,0,0,1,5-5m0-2a7,7,0,1,0,7,7A7,7,0,0,0,12,2Z',
    campaign:
      'F M27.5618,26,17.17,8.9277,19.5361,5.04,17.8281,4,16,7.0049,14.17,4l-1.708,1.04,2.3665,3.8877L4.438,26H2v2H30V26ZM16,10.8506,25.2207,26H17V18H15v8H6.7791Z',
    tool: 'F M8.9141,24.5l4.257-4.2568-1.414-1.4141L7.5,23.0859l-.793-.7929a.9994.9994,0,0,0-1.414,0l-4,4a.9994.9994,0,0,0,0,1.414l3,3a.9995.9995,0,0,0,1.414,0l4-4a.9994.9994,0,0,0,0-1.414ZM5,28.5859,3.4141,27,6,24.4141,7.5859,26Z F M24,30a6.0067,6.0067,0,0,1-6-6,5.84,5.84,0,0,1,.2109-1.5469l-8.664-8.6638A5.8483,5.8483,0,0,1,8,14,5.9757,5.9757,0,0,1,2.4228,5.8164l.5577-1.4219L6.293,7.707a1.0233,1.0233,0,0,0,1.4135,0,.999.999,0,0,0,0-1.4141L4.3936,2.979l1.4233-.5571A5.9772,5.9772,0,0,1,14,8a5.84,5.84,0,0,1-.2109,1.5469l8.664,8.6635A5.8548,5.8548,0,0,1,24,18a5.9755,5.9755,0,0,1,5.5771,8.1836L29.02,27.6055,25.707,24.293a1.0233,1.0233,0,0,0-1.4135,0,.999.999,0,0,0-.0005,1.4141L27.6055,29.02l-1.4219.5579A5.96,5.96,0,0,1,24,30ZM10.0625,11.4763,20.5234,21.9375l-.2392.6094A3.9754,3.9754,0,0,0,23.75,27.9922l-.8711-.8711a2.9992,2.9992,0,0,1,0-4.2424,3.0721,3.0721,0,0,1,4.2427.0005l.8706.8708a3.9759,3.9759,0,0,0-5.4458-3.4658l-.6094.2385-10.46-10.46.2392-.6094A3.9755,3.9755,0,0,0,8.2505,4.0078l.8706.8711a2.9992,2.9992,0,0,1,0,4.2424,3.0721,3.0721,0,0,1-4.2427-.0005L4.0078,8.25a3.975,3.975,0,0,0,5.4453,3.4656Z F M29.1226,2.85a3.0716,3.0716,0,0,0-4.2422,0L17.4,10.33l1.4141,1.414,7.48-7.48a1.0244,1.0244,0,0,1,1.4141,0,1.002,1.002,0,0,1,0,1.4145l-7.48,7.48,1.414,1.4141,7.48-7.4795A3.0031,3.0031,0,0,0,29.1226,2.85Z'
  };

  function prepareDiagram() {
    myDiagram = go.GraphObject.make(go.Diagram, element, {
      allowCopy: false,
      'draggingTool.dragsTree': true,
      'commandHandler.deletesTree': true,
      maxSelectionCount: 1,
      'toolManager.hoverDelay': 10,
      initialContentAlignment: go.Spot.Center,
      'undoManager.isEnabled': true,
      layout: go.GraphObject.make(go.TreeLayout, { angle: 90 })
    });

    myDiagram.nodeTemplate = go.GraphObject.make(
      go.Node,
      'Vertical',
      {
        deletable: false,
        click: async (e: any, obj: go.GraphObject) => {
          const key = `${obj?.data?.type}-${obj?.data?.id}`;
          if (!subprocessedNodes.has(key)) {
            subprocessedNodes.add(key);
            loading = true;
            switch (obj?.data?.type as TCX_MODEL) {
              case 'threat-actor':
                await processActor(obj.data.id);
                break;
              case 'campaign':
                await processCampaign(obj.data.id);
                break;
              case 'tool':
                await processTool(obj.data.id);
                break;
            }
            loading = false;
          }
          links = links
            .map((link) => ({
              ...link,
              stroke: link.from === key || link.to === key ? LINK_HIGHLIGHT_COLOR : LINK_DEFAULT_COLOR
            }))
            .sort((a, _) => (a.stroke === LINK_HIGHLIGHT_COLOR ? 1 : -1));

          rerender();
          myDiagram.select(myDiagram.findNodeForKey(obj.data.key));
        }
      },

      go.GraphObject.make(
        go.Panel,
        'Vertical',
        go.GraphObject.make(
          go.Shape,
          {
            name: 'icon',
            width: 2,
            height: 2,
            stroke: null,
            strokeWidth: 0,
            fill: '#41BFEC'
          },
          new go.Binding('fill', 'color'),
          new go.Binding('width', 'iconWidth'),
          new go.Binding('height', 'iconHeight'),
          new go.Binding('geometry', 'icon', (icon) => go.Geometry.parse(ICONS[icon]))
        ),
        go.GraphObject.make(
          go.TextBlock,
          {
            margin: new go.Margin(3, 0, 0, 0),
            maxSize: new go.Size(100, 30),
            font: 'bold 10pt sans-serif',
            stroke: $darkMode ? 'white' : 'black'
          },
          new go.Binding('text', 'label')
        )
      )
    );

    myDiagram.linkTemplate = go.GraphObject.make(
      go.Link,
      go.Link.Orthogonal,
      {
        deletable: false,
        corner: 10,
        selectable: false
      },
      go.GraphObject.make(
        go.Shape,
        {
          strokeWidth: 3
        },
        new go.Binding('stroke', 'stroke')
      ),
      go.GraphObject.make(
        go.TextBlock,
        go.Link.OrientUpright,
        {
          background: 'white',
          visible: false,
          segmentIndex: -2,
          segmentOrientation: go.Link.None
        },
        new go.Binding('text', 'label'),
        new go.Binding('visible', 'label', (a) => !!a)
      )
    );
  }

  function render(nodes: any[], links: any[]) {
    myDiagram.model = go.GraphObject.make(go.GraphLinksModel, { nodeDataArray: nodes, linkDataArray: links });
  }
</script>

<div class="relative w-full h-[500px] bg-ctip-ui">
  <div class="w-full h-full" bind:this={element} />
  {#if loading}
    <SkeletonPlaceholder class="absolute inset-0 w-full h-full" />
  {/if}
</div>
