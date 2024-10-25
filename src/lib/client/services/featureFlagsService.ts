import { getFlagStatus, type FeatureFlags } from '$lib/dataSources/featureFlagsSource';

export const isFeatureFlagEnabled = (flagName: keyof FeatureFlags) => {
  return getFlagStatus(flagName);
};
