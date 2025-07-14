import React, { useState } from "react";
import { TodoItem } from "../models/TodoItem";

interface Props {
  todo: TodoItem;
  onClose: () => void;
  onUpdated: () => void;
}

const EditTodoModal: React.FC<Props> = ({ todo, onClose, onUpdated }) => {
  const [title, setTitle] = useState(todo.title);
  const [isCompleted, setIsCompleted] = useState(todo.isCompleted);

  const handleUpdate = async () => {
    try {
      await fetch(`https://localhost:44303/api/todo/${todo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...todo,
          title,
          isCompleted,
        }),
      });

      onUpdated(); // Osvežava listu
      onClose(); // Zatvori modal
    } catch (error) {
      console.error("Greška pri ažuriranju zadatka:", error);
    }
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
        style={{ marginBottom: "1rem", width: "100%" }}
      />

      <div style={{ marginBottom: "1rem" }}>
        <label>
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
          />
          Završeno
        </label>
      </div>
      <button disabled={!title.trim()} onClick={handleUpdate}>
        Sačuvaj
      </button>
      <button onClick={onClose} style={{ marginLeft: "0.5rem" }}>
        Otkaži
      </button>
    </div>
  );
};

export default EditTodoModal;
