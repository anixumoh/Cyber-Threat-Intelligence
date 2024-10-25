const featureFlags = {
  chevronsEnabledInSideMenu: true
} as const;

export type FeatureFlags = typeof featureFlags;

export function getFlagStatus<T extends keyof FeatureFlags>(key: T): FeatureFlags[T] | undefined {
  return featureFlags[key];
}
