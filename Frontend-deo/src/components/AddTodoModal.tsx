import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { fetchTodos, setCurrentPage } from "../store/todoSlice";

interface Props {
  onTodoAdded: () => void;
  selectedDate: string;
}

const AddTodoModal: React.FC<Props> = ({ onTodoAdded, selectedDate }) => {
  const [title, setTitle] = useState("");
  const [show, setShow] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async () => {
    if (!title.trim()) return;

    const newTodo = {
      title,
      isCompleted,
      date: `${selectedDate}T00:00:00Z`, //new Date().toISOString(), //format koji backend prihvata
    };

    try {
      await fetch("https://localhost:44303/api/todo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
      });

      // Resetuj paginaciju i ponovo učitaj sa 1. strane
      dispatch(setCurrentPage(1));
      dispatch(fetchTodos(1));

      onTodoAdded(); // ponovno učitavanje liste
      setTitle("");
      setShow(false);
    } catch (error) {
      console.error("Greška pri dodavanju zadatka:", error);
    }
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
          />
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={() => setIsCompleted(!isCompleted)}
          />
          <button disabled={!title.trim()} onClick={handleSubmit}>
            Kreiraj
          </button>
          <button
            onClick={() => setShow(false)}
            style={{ marginLeft: "0.5rem" }}
          >
            Otkazi
          </button>
        </div>
      )}
    </div>
  );
};

export default AddTodoModal;
