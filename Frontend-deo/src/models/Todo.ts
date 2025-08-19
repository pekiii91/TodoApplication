export type TodoDTO = {
  title: string;
  isCompleted: boolean;
  date: string;
  priority: "low" | "medium" | "high";
  isArchived?: boolean;
};

export type TodoItem = TodoDTO & {
  id: number;
  isArchived: boolean;
  userId: number;
};

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}
