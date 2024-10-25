export type CommentType = {
  id: number;
  row: number;
  content: string;
  creationDate: number;
  creationUser: string;
  creationUsername: string;
  resourceId: number;
  moduleId: number;
  eresable: boolean;
  creation_user?: string;
  creation_date?: number;
  comment?: string;
};
