export interface ApiResponse<T> {
  status: "SUCCESS" | "ERROR";
  data: T;
  message: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/** 백엔드 공통 PageResponseDto (pageNumber 는 1부터 시작) */
export interface PageResponseDto<T> {
  content: T[];
  pageNumber: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
