import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { TodoItem } from "../models/TodoItem";

export const fetchTodos = createAsyncThunk(
  "todos/fetchTodos",
  async (page: number = 1) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const res = await fetch(
      `https://localhost:44303/api/todo?page=${page}&pageSize=5`
    );
    const data = await res.json();
    return data; // očekuje: { data: [], currentPage, totalPages }
  }
);

export const deleteTodo = createAsyncThunk(
  "todos/deleteTodo",
  async (id: number) => {
    await fetch(`https://localhost:44303/api/todo/${id}`, {
      method: "DELETE",
    });
    return id;
  }
);

export const addTodo = createAsyncThunk(
  "todos/addTodo",
  async (newTodo: Omit<TodoItem, "id">) => {
    const res = await fetch("https://localhost:44303/api/todo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTodo),
    });
    const data = await res.json();
    return data as TodoItem; // backend vraća kreirani zadatak sa Id-jem
  }
);

export const updateTodo = createAsyncThunk(
  "todos/updateTodo",
  async (todo: TodoItem) => {
    const res = await fetch(`https://localhost:44303/api/todo/${todo.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
    });
    const data = await res.json();
    return data as TodoItem;
  }
);

export const fetchArchivedTodos = createAsyncThunk(
  "todos/fetchArchivedTodos",
  async ({ page, pageSize }: { page: number; pageSize: number }) => {
    const res = await fetch(
      `https://localhost:44303/api/todo?page=${page}&pageSize=${pageSize}&showArchived=true`
    );
    const data = await res.json();
    return data; // { data: [], currentPage, totalPages }
  }
);

export const archivedTodo = createAsyncThunk(
  "todos/archiveTodo",
  async (id: number) => {
    const res = await fetch(`https://localhost:44303/api/todo/${id}/archive`, {
      method: "PUT",
    });
    const data = await res.json();
    return data as TodoItem;
  }
);

interface TodoState {
  items: TodoItem[];
  totalPages: number;
  currentPage: number;
  loading: boolean;
}

const initialState: TodoState = {
  items: [],
  totalPages: 1,
  currentPage: 1,
  loading: false,
};

const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      //Arhiviranje zadataka
      .addCase(archivedTodo.fulfilled, (state, action) => {
        const index = state.items.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      //Prikaz arhiviranih
      .addCase(fetchArchivedTodos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchArchivedTodos.fulfilled, (state, action) => {
        state.items = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.loading = false;
      })
      .addCase(fetchArchivedTodos.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.items = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.loading = false;
      })
      .addCase(fetchTodos.rejected, (state) => {
        state.loading = false;
      })

      .addCase(addTodo.pending, (state) => {
        state.loading = true;
      })
      .addCase(addTodo.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.loading = false;
      })
      .addCase(addTodo.rejected, (state) => {
        state.loading = false;
      })

      .addCase(updateTodo.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTodo.fulfilled, (state, action) => {
        const index = state.items.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateTodo.rejected, (state) => {
        state.loading = false;
      })

      .addCase(deleteTodo.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.items = state.items.filter((todo) => todo.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteTodo.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setCurrentPage } = todoSlice.actions;
export default todoSlice.reducer;
