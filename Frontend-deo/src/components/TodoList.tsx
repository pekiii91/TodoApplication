import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddTodoModal from "./AddTodoModal";
import EditTodoModal from "./EditTodoModal";
import { RootState, AppDispatch } from "../store/store";
import { fetchTodos, deleteTodo, updateTodo } from "../store/todoSlice";
import { TodoItem } from "../models/TodoItem";
import { toast } from "react-toastify";

interface Props {
  selectedDate: string; //2025-09-26
}

const TodoList: React.FC<Props> = ({ selectedDate }) => {
  const dispatch = useDispatch<AppDispatch>();

  //Dohvatanje todos iz Redux-a
  const { items, currentPage, totalPages } = useSelector(
    (state: RootState) => state.todos
  );

  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "pending"
  >("all");

  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  useEffect(() => {
    dispatch(fetchTodos(currentPage));
  }, [dispatch, currentPage]);

  //Filtriraj po datumu
  const filterByDate = items.filter(
    (todo) => todo.date?.substring(0, 10) === selectedDate
  );

  //Filtriranje po statusu
  const filteredTodos = filterByDate.filter((todo) => {
    if (statusFilter === "completed") return todo.isCompleted;
    if (statusFilter === "pending") return !todo.isCompleted;
    return true;
  });

  const handleToggleComplete = (todo: TodoItem) => {
    const updatedTodo = {
      ...todo,
      isCompleted: !todo.isCompleted,
    };

    dispatch(updateTodo(updatedTodo))
      .unwrap()
      .then(() => {
        toast.success("Zadatak azuriran.");
      })
      .catch(() => {
        toast.error("Greska pri azuriranju zadatka.");
      });

    dispatch(deleteTodo(todo.id))
      .unwrap()
      .then(() => {
        toast.info("Zadatak obrisan");
      })
      .catch(() => {
        toast.error("Brisanje neuspešno");
      });

    if (!todo.isCompleted) {
      setTimeout(() => {
        dispatch(deleteTodo(todo.id));
      }, 1000);
    }
  };

  return (
    <div>
      <h2>Todo Lista Zadataka</h2>
      <div style={{ marginBottom: "2rem" }}>
        <AddTodoModal
          onTodoAdded={() => dispatch(fetchTodos(currentPage))}
          selectedDate={selectedDate}
        />
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <label htmlFor="filter">Prikaži: </label>
        <select
          id="filter"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | "completed" | "pending")
          }
        >
          <option value="all">Svi</option>
          <option value="pending">Nezavršeni</option>
          <option value="completed">Završeni</option>
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <strong>Status: </strong>
        Završeni: {items.filter((t) => t.isCompleted).length} / Ukupno:
        {items.length}
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {filteredTodos.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <input
              type="checkbox"
              checked={todo.isCompleted}
              onChange={() => handleToggleComplete(todo)}
              style={{ marginRight: "0.5" }}
            />
            <span
              style={{
                marginLeft: "1rem",
                textDecoration: todo.isCompleted ? "line-through" : "none",
                color: todo.isCompleted ? "green" : "blue",
              }}
            >
              {todo.title}
            </span>

            <button
              onClick={() => setEditingTodo(todo)}
              style={{ marginLeft: "1rem" }}
            >
              Izmeni
            </button>
          </li>
        ))}
      </ul>

      {/*Paganacije kontrole*/}
      <div style={{ marginTop: "1rem" }}>
        <button
          disabled={currentPage <= 1}
          onClick={() => dispatch(fetchTodos(currentPage - 1))}
        >
          Prethodna
        </button>
        <span style={{ margin: "0 1rem" }}>
          Strana {currentPage} od {totalPages}
        </span>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => dispatch(fetchTodos(currentPage + 1))}
        >
          Sledeća
        </button>
      </div>

      {editingTodo && (
        <EditTodoModal
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
          onUpdated={() => {
            dispatch(fetchTodos(currentPage));
            setEditingTodo(null);
          }}
        />
      )}
    </div>
  );
};

export default TodoList;
