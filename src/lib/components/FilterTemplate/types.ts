export type OriginType = {
  value: number | string;
  label: string;
  disabled?: boolean;
  type?: 'FACEBOOK' | 'TWITTER' | 'NEWS' | 'MANUAL' | 'TRANSFORM' | 'RSS';
};
