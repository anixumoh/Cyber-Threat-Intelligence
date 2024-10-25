import axios from 'axios';
import type User from '$lib/types/user';
import { writable } from 'svelte/store';
import dayjs from 'dayjs';

function createUserStore() {
  const store = writable<User>(null);

  async function getUser(): Promise<User | null> {
    const url = '/api/v2/user/account?extraFields=true';
    const res = await axios.get(url);
    if (res.status === 200) {
      return res.data;
    }
    return null;
  }

  function setAndSetTimezone(value: User) {
    if (value?.timezone) {
      dayjs.tz.setDefault(value.timezone);
    }
    store.set(value);
  }

  return {
    ...store,
    getUser,
    set: setAndSetTimezone
  };
}

const userStore = createUserStore();

export default userStore;
