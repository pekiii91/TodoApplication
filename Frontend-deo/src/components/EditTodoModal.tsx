import React, { useState } from "react";
import { TodoItem } from "../models/Todo";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="rounded-2xl shadow-2xl w-[280px] min-h-[300px] animate-in fade-in-0 zoom-in-95 duration-200 border border-gray-200"
        style={{ background: "#f9f9f9" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 center">
            Izmeni zadatak
          </h2>
        </div>

        <input
          type="text"
          placeholder="Naslov zadatka"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            marginBottom: "0.5rem",
            width: "93%",
            padding: "0.5rem",
            border:
              submitted && !title.trim() ? "1px solid red" : "2px solid #ccc",
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
            <option value="low">Nizak</option>
            <option value="medium">Srednji</option>
            <option value="high">Visok</option>
          </select>
        </div>

        <button onClick={handleUpdate}>Sačuvaj</button>
        <button onClick={onClose} style={{ marginLeft: "0.5rem" }}>
          Otkaži
        </button>
      </div>
    </div>
  );
};

export default EditTodoModal;
