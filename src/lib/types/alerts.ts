export type FeedsType = {
  activateAlerts: boolean;
  alertBanks: boolean;
  alertCorporates: boolean;
  publicFeed: boolean;
};

export type AlertModulesType = 'publicfeed' | 'activatealerts' | 'alertbank' | 'alertcorporate';

export type AlertType = {
  id: number;
  value: string;
  bincodes?: unknown;
};

export type AlertResponse = {
  values: AlertType[];
  type: 'ALERT' | 'CREDIT_CARD' | 'BANK';
};
