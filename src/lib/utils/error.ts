import type { GenericResponseType } from '$lib/client/services/types';
import notifications from '$stores/notification';
import { ERROR_DICTIONARY } from '$lib/constants/errors.Dictionary'

const ERROR_DEFAULT = 'An error has occured.';

export function handleGenericResponse(response: GenericResponseType) {
  let isError = false;
  let notAddedItems: string[] = [];

  if ('error' in response) {
    if (Array.isArray(response.error)) {
      isError = response.error.length > 0;
      notAddedItems = response.error as string[];
    } else {
      isError = !!response.error;
    }
  }

  if (isError) {
    let errorCode = '';
    if ('message' in response) {
      errorCode = response?.message as string;
    }

    const message = ERROR_DICTIONARY[errorCode] || ERROR_DEFAULT;
    notifications.notify({ kind: 'error', title: message, subtitle: notAddedItems.join(', ') });
  }

  return notAddedItems;
}
