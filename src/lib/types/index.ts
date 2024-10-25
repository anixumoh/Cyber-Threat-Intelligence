type KindType = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'danger-tertiary' | 'danger-ghost';
type SizeType = 'default' | 'field' | 'small' | 'lg' | 'xl';
type ModalType = 'xs' | 'sm' | 'lg' | undefined;
type TlpType = 'WHITE' | 'GREEN' | 'AMBER' | 'RED';
type InformType = 'NOT_PROCESSABLE' | 'NOT_IMPORTANT' | 'POSITIVE' | 'INFORMATIVE' | 'NEGATIVE';
type DirectionType = 'top' | 'right' | 'bottom' | 'left';
type AlignType = 'start' | 'center' | 'end';
type SortType = 'ascending' | 'descending' | 'none';
type StatusType = 'Critical' | 'High' | 'Medium' | 'Low';
type IncidentStatusType = 'OPEN' | 'NOTIFIED' | 'CLOSED';
type AlignPopoverType =
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'
  | 'left'
  | 'left-bottom'
  | 'left-top'
  | 'right'
  | 'right-bottom'
  | 'right-top';

export type {
  KindType,
  SizeType,
  ModalType,
  TlpType,
  InformType,
  DirectionType,
  AlignType,
  SortType,
  StatusType,
  IncidentStatusType,
  AlignPopoverType
};
