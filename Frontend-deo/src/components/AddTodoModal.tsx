import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { fetchTodos, setCurrentPage } from "../store/todoSlice";
import { addTodo } from "../store/todoSlice";

interface Props {
  onTodoAdded: () => void;
  selectedDate: string;
}

const AddTodoModal: React.FC<Props> = ({ onTodoAdded, selectedDate }) => {
  const [title, setTitle] = useState("");
  const [show, setShow] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [submitted, setSubmitted] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async () => {
    setSubmitted(true); //aktivira validaciju
    if (!title.trim()) return;

    const newTodo = {
      title,
      isCompleted,
      date: `${selectedDate}T00:00:00Z`, //format koji backend prihvata
      priority,
      isArchived: false, // ← OVO JE BITNO
    };

    try {
      await dispatch(addTodo(newTodo)).unwrap();

      // Resetuj paginaciju i ponovo učitaj sa 1. strane
      dispatch(setCurrentPage(1));
      dispatch(fetchTodos(1));

      onTodoAdded(); // ponovno učitavanje liste
      setTitle("");
      setShow(false);
      setSubmitted(false); //resetuje validaciju
    } catch (error) {
      console.error("Greška pri dodavanju zadatka:", error);
    }
  };

  // Boja pozadine za select na osnovu prioriteta
  const priorityBgColor = {
    low: "#d4edda",
    medium: "#fff3cd",
    high: "#f8d7da",
  };

  return (
    <div>
      <button onClick={() => setShow(true)}> Dodaj zadatak</button>

      {show && (
        <div
          style={{
            marginTop: "1rem",
            border: "1px solid #ccc",
            padding: "1rem",
            background: "#f9f9f9",
          }}
        >
          <input
            type="text"
            placeholder="Naslov zadatka"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              border:
                submitted && !title.trim() ? "1px solid red" : "1px solid #ccc",
              padding: "0.5rem",
              width: "30%",
              marginBottom: "0.5rem",
            }}
          />

          {/*Validacija u boji */}
          {submitted && !title.trim() && (
            <div
              style={{
                color: "red",
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
              }}
            >
              Naslov je obavezan!
            </div>
          )}

          <label htmlFor="priority"> Prioritet: </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as "low" | "medium" | "high")
            }
            style={{
              backgroundColor: priorityBgColor[priority],
              padding: "0.5rem",
              width: "30%",
              marginBottom: "0.5rem",
            }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <div style={{ marginTop: "1rem" }}>
            <label>
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={() => setIsCompleted(!isCompleted)}
              />
              Završen
            </label>
          </div>

          <button onClick={handleSubmit}>Kreiraj</button>
          <button
            onClick={() => {
              setShow(false);
              setSubmitted(false); // reset validacije
            }}
            style={{ marginLeft: "0.5rem" }}
          >
            Otkaži
          </button>
        </div>
      )}
    </div>
  );
};

export default AddTodoModal;
