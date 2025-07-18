import React, { useState } from "react";
import { TodoItem } from "../models/TodoItem";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { updateTodo } from "../store/todoSlice";

interface Props {
  todo: TodoItem;
  onClose: () => void;
  onUpdated: () => void;
}

const EditTodoModal: React.FC<Props> = ({ todo, onClose, onUpdated }) => {
  const [title, setTitle] = useState(todo.title);
  const [isCompleted, setIsCompleted] = useState(todo.isCompleted);
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    todo.priority ?? "low"
  );

  const [submitted, setSubmitted] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const handleUpdate = () => {
    setSubmitted(true); //aktivira validaciju

    if (!title.trim())
      //zaustavlja ako je naslov prazan
      return;

    const updatedTodo: TodoItem = {
      ...todo,
      title,
      isCompleted,
      priority,
    };

    dispatch(updateTodo(updatedTodo))
      .unwrap()
      .then(() => {
        onUpdated(); // Osvežava listu
        onClose(); // Zatvori modal
        setSubmitted(false);
      })
      .catch((err) => {
        console.error("Greška prilikom ažuriranja:", err);
      });
  };

  const priorityBgColor = {
    low: "#d4edda",
    medium: "#fff3cd",
    high: "#f8d7da",
  };

  return (
    <div
      style={{
        marginBottom: "2rem",
        border: "1px solid #ccc",
        padding: "1rem",
        background: "#f9f9f9",
      }}
    >
      <h4>Izmeni zadatak</h4>

      <input
        type="text"
        placeholder="Naslov zadatka"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          marginBottom: "1rem",
          width: "30%",
          padding: "0.5rem",
          border:
            submitted && !title.trim() ? "1px solid red" : "1px solid #ccc",
        }}
      />
      {/**validacija u boji */}
      {submitted && !title.trim() && (
        <div
          style={{ color: "red", fontSize: "0.9rem", marginBottom: "0.5rem" }}
        >
          Naslov je obavezan!
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <label>
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
          />
          Završen
        </label>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Prioritet: </label>
        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value as "low" | "medium" | "high")
          }
          style={{
            backgroundColor: priorityBgColor[priority],
            padding: "0.5rem",
            width: "30%",
          }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <button onClick={handleUpdate}>Sačuvaj</button>
      <button onClick={onClose} style={{ marginLeft: "0.5rem" }}>
        Otkaži
      </button>
    </div>
  );
};

export default EditTodoModal;
