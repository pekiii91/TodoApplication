import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddTodoModal from "./AddTodoModal";
import EditTodoModal from "./EditTodoModal";
import { RootState, AppDispatch } from "../store/store";
import {
  fetchTodos,
  updateTodo,
  fetchArchivedTodos,
  archivedTodo,
  setCurrentPage,
} from "../store/todoSlice";
import { TodoItem } from "../models/TodoItem";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  selectedDate: Date | null;
}
const TodoList: React.FC<Props> = () => {
  const [showArchived, setShowArchived] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const [searchTerm, setSearchTerm] = useState("");
  const { items, currentPage, totalPages, loading } = useSelector(
    (state: RootState) => state.todos
  );

  const [sortColumn, setSortColumn] = useState<
    "title" | "date" | "isCompleted"
  >("date");

  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "pending"
  >("all");

  const handleSortClick = (column: "title" | "date" | "isCompleted") => {
    if (sortColumn === column) {
      // Ako klikneš istu kolonu, promeni pravac (asc <-> desc)
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Nova kolona, kreći sa "asc"
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  useEffect(() => {
    if (showArchived) {
      dispatch(fetchArchivedTodos({ page: currentPage, pageSize: 5 }));
    } else {
      dispatch(setCurrentPage(currentPage));
    }
  }, [dispatch, currentPage, showArchived, selectedDate]);

  //Lokalna filtracija po datumu
  function isSameDayUTC(date1: Date, date2: Date): boolean {
    return (
      date1.getUTCFullYear() === date2.getUTCFullYear() &&
      date1.getUTCMonth() === date2.getUTCMonth() &&
      date1.getUTCDate() === date2.getUTCDate()
    );
  }

  const dateFilteredTodos = selectedDate
    ? items.filter((todo) =>
        todo.date
          ? isSameDayUTC(new Date(todo.date + "T00:00:00"), selectedDate)
          : false
      )
    : items;

  const filteredTodos = dateFilteredTodos
    .filter((todo) => {
      if (statusFilter === "completed") return todo.isCompleted;
      if (statusFilter === "pending") return !todo.isCompleted;
      return true;
    })
    .filter((todo) =>
      todo.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((todo) => (showArchived ? todo.isArchived : !todo.isArchived))
    .sort((a, b) => {
      let result = 0;
      switch (sortColumn) {
        case "title":
          result = a.title.localeCompare(b.title);
          break;
        case "date":
          result = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "isCompleted":
          result = Number(a.isCompleted) - Number(b.isCompleted);
          break;
      }
      return sortDirection === "asc" ? result : -result;
    });

  const handleToggleComplete = (todo: TodoItem) => {
    const updatedTodo = { ...todo, isCompleted: !todo.isCompleted };

    dispatch(updateTodo(updatedTodo))
      .unwrap()
      .then(() => {
        const toastId = toast(
          () => (
            <div>
              <span>Zadatak ažuriran</span>
              <button
                onClick={() => {
                  dispatch(updateTodo(todo));
                  toast.dismiss(toastId);
                  toast.info("Undo uspešan.");
                }}
              >
                Undo
              </button>
            </div>
          ),
          { autoClose: 5000 }
        );
      })
      .catch(() => {
        toast.error("Greška prilikom ažuriranja");
      });
  };

  return (
    <div>
      <div
        style={{ display: "flex", fontWeight: "bold", marginBottom: "2rem" }}
      >
        <span
          style={{ flex: 1, cursor: "pointer" }}
          onClick={() => handleSortClick("title")}
        >
          Naziv{" "}
          {sortColumn === "title" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
        </span>
        <span
          style={{ flex: 1, cursor: "pointer" }}
          onClick={() => handleSortClick("date")}
        >
          Datum{" "}
          {sortColumn === "date" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
        </span>
        <span
          style={{ flex: 1, cursor: "pointer" }}
          onClick={() => handleSortClick("isCompleted")}
        >
          Status{" "}
          {sortColumn === "isCompleted"
            ? sortDirection === "asc"
              ? "▲"
              : "▼"
            : ""}
        </span>
      </div>

      <h2>Todo Lista Zadataka</h2>

      {loading && (
        <div style={{ textAlign: "center", margin: "1rem" }}>
          <div className="loader" />
        </div>
      )}

      <div style={{ marginBottom: "2rem" }}>
        <AddTodoModal
          onTodoAdded={() => dispatch(fetchTodos(currentPage))}
          selectedDate={selectedDate}
        />
      </div>

      {/* DatePicker samo za prikaz/odabir, ne filtrira više */}
      <div style={{ marginBottom: "2rem" }}>
        <label style={{ marginRight: "1rem" }}>Odaberi datum:</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          isClearable
          placeholderText="Izaberi datum"
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          Prikaži arhivirane zadatke
        </label>
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

      <div style={{ marginBottom: "3rem" }}>
        <label htmlFor="search">Pretraga po naslovu: </label>
        <input
          id="search"
          type="text"
          placeholder="Unesite naslov..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <strong>Status: </strong>
        Završeni: {items.filter((t) => t.isCompleted).length} / Ukupno:{" "}
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
              style={{ marginRight: "0.5rem" }}
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

            {/* 🆕 Prikaz datuma zadatka */}
            <span style={{ marginLeft: "2rem", fontStyle: "italic" }}>
              {todo.date}
            </span>

            <span
              style={{
                marginLeft: "3rem",
                padding: "0.2rem 0.5",
                borderRadius: "4px",
                fontSize: "1rem",
                fontWeight: "bold",
                backgroundColor:
                  todo.priority === "high"
                    ? "#ff4d4d"
                    : todo.priority === "medium"
                    ? "#ffcc00"
                    : "#66cc66",
                color: "#fff",
              }}
            >
              {todo.priority.toUpperCase()}
            </span>
            <button
              onClick={() => setEditingTodo(todo)}
              style={{ marginLeft: "1rem" }}
            >
              Izmeni
            </button>
            <button
              onClick={() =>
                dispatch(archivedTodo(todo.id))
                  .unwrap()
                  .then(() => {
                    toast.success("Zadatak arhiviran.");
                    if (showArchived) {
                      dispatch(
                        fetchArchivedTodos({ page: currentPage, pageSize: 5 })
                      );
                    } else {
                      dispatch(fetchTodos(currentPage));
                    }
                  })
                  .catch(() => toast.error("Greška pri arhiviranju."))
              }
              style={{ marginLeft: "1rem", color: "gray" }}
            >
              Arhiviraj
            </button>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div style={{ marginTop: "1rem" }}>
        <button
          disabled={currentPage <= 1}
          onClick={() => dispatch(fetchTodos(currentPage - 1))}
        >
          Prethodna
        </button>
        <span style={{ margin: "0 1rem" }}>
          Strana {currentPage} / {totalPages}
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
