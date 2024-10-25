import { ERROR_DICTIONARY } from '$lib/constants/errors.Dictionary';
import notifications from '$stores/notification';
import * as yup from 'yup';
import { DUPLICATED, ERROR_DEFAULT, MIN_LENGTH_3, MIN_LENGTH_4 } from '../messages';

export function handleServerError(response: object) {
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

export function validateInput<T>(input: string, items: T[], itemValue: keyof T, validation: yup.StringSchema) {
  const text = input.trim();
  const errors: Record<string, string[]> = {};
  const toAdd: string[] = [];
  const notAdded: string[] = [];

  text.split('\n').forEach((item) => {
    let input = item.trim();
    if (!input) return;

    // Check validation
    try {
      input = validation.validateSync(input);
    } catch (error) {
      notAdded.push(input);
      if (error instanceof yup.ValidationError) {
        if (!errors[error.message]) errors[error.message] = [];
        errors[error.message].push(input);
      }
      return;
    }

    // Check duplicates
    if (items.find((item) => item[itemValue] === input)) {
      if (!errors[DUPLICATED]) errors[DUPLICATED] = [];
      errors[DUPLICATED].push(input);
      notAdded.push(input);
      return;
    }

    toAdd.push(input);
  });

  return {
    errors,
    toAdd,
    notAdded
  };
}

export function handleErrors(errors: Record<string, string[]>) {
  Object.entries(errors).forEach(([key, val]) => {
    const isWarning = key === MIN_LENGTH_3 || key === MIN_LENGTH_4 || key === DUPLICATED;
    notifications.notify({
      kind: isWarning ? 'warning' : 'error',
      title: key,
      subtitle: val.join(', '),
      timeout: 0
    });
  });
}
