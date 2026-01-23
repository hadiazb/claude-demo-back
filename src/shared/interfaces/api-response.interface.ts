export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: ApiResponseMeta;
  timestamp: string;
  path: string;
}

export interface ApiResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: ApiFieldError[];
  timestamp: string;
  path: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}
