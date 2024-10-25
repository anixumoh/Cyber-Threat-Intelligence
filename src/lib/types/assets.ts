export type SettingsType = {
  sort?: number;
  type: string;
  values: SettingsDataType[];
};

export type TagsType = {
  total_resources: number;
  list: string[];
};

export type ModulesSettings = {
  moduleId: number;
  moduleName: string;
  moduleType: string;
  tag?: string;
  wordId: number;
};

export type SettingsDataType = {
  modules: ModulesSettings[];
  searchPhrase: string;
  tag?: string;
  cpe?: string;
};

export type DeleteType = {
  settingType: string;
  data: SettingsDataType[];
};

export type EditItemType = {
  editing: boolean;
  item: any;
  tag: string;
  modules: {
    original: number[];
    toAdd: number[];
    toDelete: number[];
  };
};

export type DataToEditItemType = {
  modules: number[];
  modulesToDelete: number[];
  tag: string;
  type: string;
  values: { value?: string; title?: string; cpe?: string; bincodes?: string; url?: string }[];
  wordIds?: number[];
};

export type ErrorInfoDataType = {
  field: string;
  message: string;
  messageKey: string;
  messageParams: any[];
  moduleId: number;
};

export type ErrorInfoType = {
  type: string;
  data: ErrorInfoDataType[][];
  modules: number[];
  tag: string;
};
