type SettingType = {
  type: string;
};

export type AddSettingsType = SettingType & {
  values: string[];
};

export type DeleteSettingsType = SettingType & {
  items: number[];
};

export type StatusType = 'FINISHED' | 'ONGOING' | 'PENDING';
