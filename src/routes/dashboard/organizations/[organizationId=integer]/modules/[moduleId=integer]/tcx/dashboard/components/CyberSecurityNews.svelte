<script lang="ts">
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import FilterWrapper from '$lib/components/FilterWrapper/FilterWrapper.svelte';
  import { Button, MultiSelect, SkeletonText, Tag } from 'carbon-components-svelte';
  import type { TagProps } from 'carbon-components-svelte/types/Tag/Tag.svelte';
  import { clone } from 'lodash';

  export let columns = 1;
  export let rows = 1;

  $: numItems = rows * 2 * columns;

  enum NewsTag {
    VERIFIED = 'Verified',
    NOT_VERIFIED = 'Not verified',
    KRAKENLABS = 'Krakenlabs'
  }

  const TAGS = [
    { id: NewsTag.VERIFIED, text: NewsTag.VERIFIED },
    { id: NewsTag.NOT_VERIFIED, text: NewsTag.NOT_VERIFIED },
    { id: NewsTag.KRAKENLABS, text: NewsTag.KRAKENLABS }
  ];

  const TAG_COLOR_MAP: Record<NewsTag, TagProps['type']> = {
    [NewsTag.VERIFIED]: 'green',
    [NewsTag.KRAKENLABS]: 'cyan',
    [NewsTag.NOT_VERIFIED]: 'magenta'
  };

  async function getArticles(num: number, form: NewsForm) {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000));
    return new Array(num)
      .fill(null)
      .map((_, i) => ({
        id: i + 1,
        title: `NCS: One million Phishing messages reported in ${i + 1} months`,
        text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate esse amet autem, placeat tempore impedit, eaque, molestias laboriosam voluptate consequuntur recusandae maiores iusto odio sequi repellat dolorem totam neque repudiandae!',
        url: `https://example.com/${i + 1}`,
        tag: TAGS[i % 3].id
      }))
      .filter((item) => !form.tags.length || form.tags.includes(item.tag));
  }

  type NewsForm = {
    tags: NewsTag[];
  };

  let formData: NewsForm = {
    tags: []
  };
  let newFormData: NewsForm = clone(formData);

  function onApply() {
    formData = clone(newFormData);
  }

  function onCancel() {
    newFormData = clone(formData);
  }

  function onClear() {
    newFormData = formData = {
      tags: []
    };
  }

  function countFilters(formData: NewsForm) {
    let num = 0;
    if (formData.tags.length) num++;
    return num;
  }

  $: tagsPlaceholder = newFormData.tags.join(', ') || 'Select tags';
</script>

<div class="relative h-full">
  <div class="flex justify-between">
    <h4>CuyberSec news</h4>

    <div class="flex gap-2">
      <FilterWrapper
        filtersCount={countFilters(formData)}
        formClass="w-[350px]"
        on:apply={onApply}
        on:cancel={onCancel}
        on:clear={onClear}
      >
        <MultiSelect
          filterable
          selectionFeedback="top"
          bind:selectedIds={newFormData.tags}
          titleText="Tags"
          label="label"
          placeholder={tagsPlaceholder}
          items={TAGS}
        />
      </FilterWrapper>
    </div>
  </div>

  <div class="grid gap-4 mt-2" class:grid-cols-2={columns === 2}>
    {#await getArticles(numItems, formData)}
      {#each Array(numItems) as _}
        <div>
          <SkeletonText heading paragraph lines={1} />
          <SkeletonText paragraph lines={4} />
        </div>
      {/each}
    {:then articles}
      {#each articles as article, i}
        <article class="grid">
          <div class="flex gap-2 overflow-hidden">
            <h5 title={article.title} class="overflow-hidden text-ellipsis whitespace-nowrap">
              {article.title}
            </h5>
            <Tag type={TAG_COLOR_MAP[article.tag]} class="px-2 whitespace-nowrap">
              {article.tag}
            </Tag>
          </div>
          <div title={article.text} class="line-clamp-3">{article.text}</div>
          <a href={article.url} target="_blank">{article.url}</a>
        </article>
      {:else}
        <div class="col-span-2">
          <EmptyData />
        </div>
      {/each}
    {/await}
  </div>

  <Button class="absolute bottom-0 right-0" kind="ghost" size="small" href="/news">Read more</Button>
</div>
