interface GenericResponse {
  code: number;
  error: boolean;
  field: string;
  httpCode: number;
  message: string;
  token: any;
}

interface GenericResponseError {
  error: string[];
  ok: string[];
}

export type GenericResponseType = GenericResponse & GenericResponseError;
