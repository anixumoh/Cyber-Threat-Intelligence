export class FilterModel {
  generated: boolean;
  enabled: boolean;
  orden: number;
  status: 'OK';
  messages: any = [];
  id: '';
  name: '';
  conditions: any = [
    {
      id: '',
      type: 'ANALYSIS_RESULT',
      value: [],
      inverse: false,
      origins: [],
    },
    {
      id: '',
      type: 'FILTER_PHRASE',
      value: [],
      inverse: false,
      origins: [],
    },
    {
      id: '',
      type: 'FILE_TYPE',
      value: [],
      inverse: false,
      origins: [],
    },
    {
      id: '',
      type: 'DOMAIN',
      value: [],
      inverse: false,
      origins: [],
    },
    {
      id: '',
      type: 'TERM',
      value: [],
      inverse: false,
      origins: [],
    },
    {
      id: '',
      type: 'EXTRADATA_ENTRY',
      value: [],
      inverse: false,
      origins: [],
    },
    {
      id: '',
      type: 'LANGUAGE',
      value: [],
      inverse: false,
      origins: [],
    },
    {
      id: '',
      type: 'HAS_LABEL',
      value: [],
      inverse: false,
      origins: [],
    },
    {
      id: '',
      type: 'ORIGIN',
      value: [],
      inverse: false,
      origins: [],
    },
    {
      id: '',
      type: 'COUNTRY',
      value: [],
      inverse: false,
      origins: [],
    },
  ];
  actions: any = [
    {
      id: '',
      type: 'ANALYSIS_RESULT_ASSIGNATION',
      value: 0,
    },
    {
      id: '',
      type: 'CUT_EXECUTION',
      value: false,
    },
    {
      id: '',
      type: 'DELETE',
      value: false,
    },
    {
      id: '',
      type: 'LABEL_ASSIGNATION',
      value: 0,
    },
    {
      id: '',
      type: 'LAUNCH_ALERT',
      value: false,
      alertConfiguration: {
        filterActionId: '',
        threshold: '1',
        interval: '1',
        sendAlert: false,
        sendAlertInterval: '1',
        immediateSending: false,
        destinations: [],
      },
    },
    {
      id: '',
      type: 'MARK_TLP_LIGHT',
      value: '',
    },
    {
      id: '',
      type: 'WEIGHT_ASSIGNATION',
      value: 0,
    },
  ];
}
