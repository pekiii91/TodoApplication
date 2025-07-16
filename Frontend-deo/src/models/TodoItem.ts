export interface TodoItem {
  id: number;
  title: string;
  isCompleted: boolean;
  date: string;
  priority: "low" | "medium" | "high";
}
