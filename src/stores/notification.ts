import type { InlineNotificationProps } from 'carbon-components-svelte/types/Notification/InlineNotification.svelte';
import { writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

type NotificationLink = {
  href: string;
  title: string;
  keep?: boolean;
};

type NotificationType = {
  id?: string;
  kind?: InlineNotificationProps['kind'];
  title?: InlineNotificationProps['title'];
  subtitle?: InlineNotificationProps['subtitle'];
  timeout?: InlineNotificationProps['timeout'];
  link?: NotificationLink;
};

function createNotificationStore() {
  const { subscribe, set, update } = writable<NotificationType[]>([]);

  function notify(notification: NotificationType) {
    const newNotification = {
      id: uuidv4(),
      timeout: 5000,
      ...notification
    };
    update((current) => {
      if (current.some((n) => n.id === newNotification.id)) return current;
      return [...current, newNotification];
    });
  }

  return {
    subscribe,
    set,
    update,
    notify
  };
}

const notifications = createNotificationStore();
export default notifications;
