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

const TodoList: React.FC = () => {
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

  //filtracija datuma
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
  }, [dispatch, currentPage, showArchived]);

  //Lokalna filtracija po datumu, prikaza zadataka za danasnji datum
  function isSameDayLocal(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  const thStyle: React.CSSProperties = {
    border: "1px solid #ccc",
    padding: "1rem",
    backgroundColor: "#f0f0f0",
    textAlign: "left",
  };

  const tdStyle: React.CSSProperties = {
    border: "1px solid #ccc",
    padding: "1rem",
  };

  const dateFilteredTodos = selectedDate
    ? items.filter((todo) =>
        todo.date ? isSameDayLocal(new Date(todo.date), selectedDate) : false
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
    //Lokalna filtracija po datumu
    .filter((todo) => {
      if (!selectedDate) return true;
      const todoDate = new Date(todo.date).toISOString().substring(0, 10);
      const selected = selectedDate.toISOString().substring(0, 10);
      return todoDate === selected;
    })
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
      {selectedDate && (
        <div style={{ fontStyle: "italic", marginTop: "0.5rem" }}>
          Prikaz zadataka za: {selectedDate.toLocaleDateString("sr-RS")}
        </div>
      )}

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

      <div style={{ marginBottom: "2rem" }}>
        <h2>Todo Lista Zadataka</h2>
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "1rem",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Naziv zadatka</th>
            <th style={thStyle}>Datum</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Prioritet</th>
            <th style={thStyle}>Akcije</th>
          </tr>
        </thead>
        <tbody>
          {filteredTodos.map((todo) => (
            <tr key={todo.id}>
              <td style={tdStyle}>
                <span
                  style={{
                    color: todo.isCompleted ? "green" : "blue",
                    textDecoration: todo.isCompleted ? "line-through" : "none",
                    cursor: "pointer",
                  }}
                >
                  {todo.title}
                </span>
              </td>
              <td style={tdStyle}>{todo.date?.substring(0, 10)}</td>
              <td style={tdStyle}>
                <input
                  type="checkbox"
                  checked={todo.isCompleted}
                  onChange={() => handleToggleComplete(todo)}
                />{" "}
                {todo.isCompleted ? "✔️" : "⏳"}
              </td>
              <td style={tdStyle}>
                <span
                  style={{
                    backgroundColor:
                      todo.priority === "high"
                        ? "#ff4d4d"
                        : todo.priority === "medium"
                        ? "#ffcc00"
                        : "#66cc66",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontWeight: "bold",
                  }}
                >
                  {todo.priority.toUpperCase()}
                </span>
              </td>
              <td style={tdStyle}>
                <button onClick={() => setEditingTodo(todo)}>Izmeni</button>
                {!todo.isArchived && (
                  <button
                    style={{ marginLeft: "0.5rem" }}
                    onClick={() =>
                      dispatch(archivedTodo(todo.id))
                        .unwrap()
                        .then(() => {
                          toast.success("Zadatak arhiviran.");
                          if (showArchived) {
                            dispatch(
                              fetchArchivedTodos({
                                page: currentPage,
                                pageSize: 5,
                              })
                            );
                          } else {
                            dispatch(fetchTodos(currentPage));
                          }
                        })
                        .catch(() => toast.error("Greška pri arhiviranju."))
                    }
                  >
                    Arhiviraj
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
