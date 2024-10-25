import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageMap, JSONSchema } from '@ngx-pwa/local-storage';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  // Subscription: You DO NOT need to unsubscribe since it completes like http client

  constructor(private storageMap: StorageMap) {}
  /**
   * Set an item in storage.
   * @example
   * this.storageMap.set('key', 'value').subscribe(() => {});
   */
  set(key: string, data: any, schema?: JSONSchema): Observable<undefined> {
    return this.storageMap.set(key, data, schema);
  }
  /**
   * Get an item value in storage.
   * @example
   * this.storageMap.get('key', { type: 'string' }).subscribe((result) => {
   *   result; // string or undefined
   * });
   *
   * @example
   * interface User {
   *   firstName: string;
   *   lastName?: string;
   * }
   *
   * const schema = {
   *   type: 'object',
   *   properties: {
   *     firstName: { type: 'string' },
   *     lastName: { type: 'string' },
   *   },
   *   required: ['firstName']
   * };
   *
   * this.storageMap.get<User>('user', schema).subscribe((user) => {
   *   if (user) {
   *     user.firstName;
   *   }
   * });
   */
  get<T>(key: string, schema?: JSONSchema): Observable<T> {
    return this.storageMap.get<T>(key, schema);
  }

  watch<T>(key: string, schema?: JSONSchema): Observable<T> {
    return this.storageMap.watch<T>(key, schema);
  }
  /**
   * Delete all items in storage
   * @example
   * this.storageMap.clear().subscribe(() => {});
   */
  clear(): Observable<undefined> {
    return this.storageMap.clear();
  }
  /**
   * Tells if a key exists in storage
   * @example
   * this.storageMap.has('key').subscribe((hasKey) => {
   *   if (hasKey) {}
   * });
   */
  has(index: string): Observable<boolean> {
    return this.storageMap.has(index);
  }
  /**
   * Delete an item in storage
   * @example
   * this.storageMap.delete('key').subscribe(() => {});
   */
  delete(index: string): Observable<undefined> {
    return this.storageMap.delete(index);
  }
  /**
   * Get all keys stored in storage. Note **this is an *iterating* `Observable`**:
   * * if there is no key, the `next` callback will not be invoked,
   * * if you need to wait the whole operation to end, be sure to act in the `complete` callback,
   * as this `Observable` can emit several values and so will invoke the `next` callback several times.
   * @example
   * this.storageMap.keys().subscribe({
   *   next: (key) => { console.log(key); },
   *   complete: () => { console.log('Done'); },
   * });
   */
  keys(): Observable<string> {
    return this.storageMap.keys();
  }
}
