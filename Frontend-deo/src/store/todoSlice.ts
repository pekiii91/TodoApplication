import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { TodoItem } from "../models/TodoItem";

export const fetchTodos = createAsyncThunk(
  "todos/fetchTodos",
  async (page: number = 1) => {
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

interface TodoState {
  items: TodoItem[];
  totalPages: number;
  currentPage: number;
}

const initialState: TodoState = {
  items: [],
  totalPages: 1,
  currentPage: 1,
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
    builder.addCase(fetchTodos.fulfilled, (state, action) => {
      state.items = action.payload.data;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
    });
    builder.addCase(deleteTodo.fulfilled, (state, action) => {
      state.items = state.items.filter((todo) => todo.id !== action.payload);
    });
    builder.addCase(addTodo.fulfilled, (state, action) => {
      state.items.push(action.payload);
    });
    /* builder.addCase(updateTodo.fulfilled, (state, action) => {
      const index = state.items.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    });*/
  },
});

export const { setCurrentPage } = todoSlice.actions;
export default todoSlice.reducer;
