/**
 * Optional lodash.debounce helper used where a classic debounce callback is preferred
 * over the useDebounce value-hook (e.g. imperative handlers).
 */

import debounce from 'lodash.debounce';

export { debounce };

/** Create a debounced function with a standard 350ms delay */
export const createDebounced = <T extends (...args: any[]) => void>(
  fn: T,
  wait = 350,
) => debounce(fn, wait);
