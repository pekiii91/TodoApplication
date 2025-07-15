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

/**Helper funkcija */
function isSameDayUTC(date1: string, selected: string): boolean {
  const day1 = new Date(date1);
  const day2 = new Date(selected);

  return (
    day1.getUTCFullYear() === day2.getUTCFullYear() &&
    day1.getUTCMonth() === day2.getUTCMonth() &&
    day1.getUTCDate() === day2.getUTCDate()
  );
}

const TodoList: React.FC<Props> = ({ selectedDate }) => {
  const dispatch = useDispatch<AppDispatch>();

  //Za pretragu po naslovu
  const [searchTerm, setSearchTerm] = useState("");
  //Dohvatanje todos iz Redux-a
  const { items, currentPage, totalPages, loading } = useSelector(
    (state: RootState) => state.todos
  );

  //useState za sortiranje
  const [sortOption, setSortOption] = useState<
    "date" | "completed" | "title-asc" | "title-desc"
  >("date");

  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "pending"
  >("all");

  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  useEffect(() => {
    dispatch(fetchTodos(currentPage));
  }, [dispatch, currentPage]);

  //Filtriraj po datumu
  const filterByDate = items.filter(
    (todo) => todo.date && isSameDayUTC(todo.date, selectedDate)
  );

  //Filtriranje po statusu, azuriram filteredTodos da sadrzi i sortiranje
  const filteredTodos = filterByDate
    .filter((todo) => {
      if (statusFilter === "completed") return todo.isCompleted;
      if (statusFilter === "pending") return !todo.isCompleted;
      return true;
    })
    .filter((todo) =>
      todo.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOption) {
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "completed":
          return Number(a.isCompleted) - Number(b.isCompleted);
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  const handleToggleComplete = (todo: TodoItem) => {
    const updatedTodo = {
      ...todo,
      isCompleted: !todo.isCompleted,
    };

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

        // Ako nije undo, obriši nakon 5s
        setTimeout(() => {
          const taskStillCompleted = updatedTodo.isCompleted;
          if (taskStillCompleted) {
            dispatch(deleteTodo(todo.id));
            toast.info("Zadatak obrisan");
          }
        }, 5000);
      })
      .catch(() => {
        toast.error("Greška prilikom ažuriranja");
      });
  };

  return (
    <div>
      <h2>Todo Lista Zadataka</h2>

      {/*Spinner (Loading indikator)*/}
      {loading && (
        <div style={{ textAlign: "center", margin: "1rem" }}>
          <div className="loader" />
        </div>
      )}
      {/*Dodavanje AddTodoModal-a za dodavanje zadataka */}
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

      {/*Pretraga po naslovu */}
      <div style={{ marginBottom: "3rem" }}>
        <label htmlFor="search"> Pretraga po naslovu: </label>
        <input
          id="search"
          type="text"
          placeholder="Unesite naslov...."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/*select meni za izbor sortiranje*/}
      <div style={{ marginBottom: "3rem" }}>
        <label htmlFor="sort"> Sortiraj po: </label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as typeof sortOption)}
        >
          <option value="date">Datum kreiranja</option>
          <option value="completed">Zavrsenosti</option>
          <option value="title-asc">Nazivu (A-Z)</option>
          <option value="title-desc">Nazivu (A-Z)</option>
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

      {/*Izmena zadataka */}
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
