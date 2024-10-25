<script lang="ts">
  import dayjs from 'dayjs';
  import { createEventDispatcher } from 'svelte';

  const DATE_FORMAT = 'D/M/YYYY';
  const dispatch = createEventDispatcher();

  type Day = {
    dayStr: string;
    date: Date;
    hasData: boolean;
    selected: boolean;
  };
  type MonthInfo = {
    month: string;
    days: Day[];
  };

  export let timestamps: number[] = [];
  export let selectedTimestamp = undefined;

  $: calendarInfo = initCalendar(timestamps, selectedTimestamp);

  function initCalendar(timestamps: number[], selectedTimestamp: number): MonthInfo[] {
    const daysWithValues = new Set<string>(timestamps.map((t) => dayjs(t).format(DATE_FORMAT)));
    const selectedDay = dayjs(selectedTimestamp).format(DATE_FORMAT);

    const calendarInfo: MonthInfo[] = [];

    for (let i = 0; i < 12; i++) {
      const firstDayOfMonth = dayjs().subtract(i, 'months').startOf('month');
      const daysInMonth = firstDayOfMonth.daysInMonth();
      const days: Day[] = [...new Array(31)];

      for (let j = 0; j < daysInMonth; j++) {
        const day = dayjs(firstDayOfMonth).add(j, 'days');
        const dayStr = day.format(DATE_FORMAT);
        const hasData = daysWithValues.has(dayStr);
        const selected = selectedDay === dayStr;
        days[j] = {
          dayStr,
          date: day.toDate(),
          hasData,
          selected
        };
      }

      calendarInfo.push({
        month: firstDayOfMonth.format('MMMM'),
        days
      });
    }

    return calendarInfo;
  }

  function selectDay(dayStr: string) {
    const timestamp = timestamps.find((t) => dayjs(t).format(DATE_FORMAT) === dayStr);
    if (timestamp) {
      dispatch('clickTimestamp', timestamp);
    }
  }
</script>

<div class="inline-calendar">
  {#each calendarInfo as monthInfo}
    <div class="month">
      <div class="month-name">
        <span>{monthInfo.month}</span>
      </div>
      <div class="month-days">
        {#each monthInfo.days as day}
          {#if day?.hasData}
            <button
              class="day has-data"
              class:empty={!day}
              class:selected={day.selected}
              title={day.dayStr || ''}
              on:click={() => selectDay(day.dayStr)}
            />
          {:else}
            <div class="day" class:empty={!day} title={day?.dayStr || ''} />
          {/if}
        {/each}
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  .inline-calendar {
    display: flex;
    flex-direction: column;
    padding: 10px;
    .month {
      display: flex;
      .month-name {
        width: 10ch;
      }
      .month-days {
        display: grid;
        width: 100%;
        grid-auto-flow: column;
        grid-auto-columns: minmax(0, 1fr);
        background-color: var(--ctip-ui, white);
        .day {
          border: 2px solid var(--ctip-border, white);
          &.has-data {
            background: var(--ctip-primary, blue);
            color: var(--ctip-white, white);
            cursor: pointer;
          }
          &.selected {
            background: var(--ctip-secondary, black);
            color: var(--ctip-white, white);
          }
          &.empty {
            background: var(--ctip-white, white);
          }
        }
      }
    }
  }
</style>
