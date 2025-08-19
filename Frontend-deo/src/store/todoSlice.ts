import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { PaginatedResponse, TodoDTO, TodoItem } from "../models/Todo";
import api from "../services/api";
import axios from "axios";

export const fetchTodos = createAsyncThunk(
  "todos/fetchTodos",
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await api.get<PaginatedResponse<TodoItem>>(
        `/todo?page=${page}&pageSize=5`
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to fetch todos"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const addTodo = createAsyncThunk(
  "todos/addTodo",
  async (newTodo: TodoDTO, { rejectWithValue }) => {
    try {
      const response = await api.post<TodoItem>("/todo", newTodo);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to add todos"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const updateTodo = createAsyncThunk(
  "todos/updateTodo",
  async (todo: TodoItem, { rejectWithValue }) => {
    try {
      const response = await api.put<TodoItem>(`/todo/${todo.id}`, todo);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to update todos"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const deleteTodo = createAsyncThunk(
  "todos/deleteTodo",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/todo/${id}`);
      return id;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to delete todos"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const fetchArchivedTodos = createAsyncThunk(
  "todos/fetchArchivedTodos",
  async (
    { page, pageSize }: { page: number; pageSize: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get<PaginatedResponse<TodoItem>>(
        `/todo?page=${page}&pageSize=${pageSize}&showArchived=true`
      );
      return response.data as {
        data: TodoItem[];
        totalPages: number;
        currentPage: number;
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to fetch archived todos"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const archiveTodo = createAsyncThunk(
  "todos/archiveTodo",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.put<TodoItem>(`/todo/${id}/archive`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to archive todo"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

interface TodoState {
  items: TodoItem[];
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

const initialState: TodoState = {
  items: [],
  totalPages: 1,
  currentPage: 1,
  loading: false,
  error: null,
};

const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch todos
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.items = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add todo
      .addCase(addTodo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTodo.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(addTodo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update todo
      .addCase(updateTodo.pending, (state) => {
        state.error = null;
      })
      .addCase(updateTodo.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTodo.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Delete todo
      .addCase(deleteTodo.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.items = state.items.filter((todo) => todo.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Fetch archived todos
      .addCase(fetchArchivedTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArchivedTodos.fulfilled, (state, action) => {
        state.items = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchArchivedTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Archive todo
      .addCase(archiveTodo.pending, (state) => {
        state.error = null;
      })
      .addCase(archiveTodo.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(archiveTodo.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentPage } = todoSlice.actions;
export default todoSlice.reducer;
