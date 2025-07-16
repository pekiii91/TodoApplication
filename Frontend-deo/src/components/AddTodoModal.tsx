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

  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async () => {
    if (!title.trim()) return;

    const newTodo = {
      title,
      isCompleted,
      date: `${selectedDate}T00:00:00Z`, //format koji backend prihvata
      priority,
    };

    try {
      await dispatch(addTodo(newTodo)).unwrap();

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

          <label htmlFor="priority"> Prioritet: </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as "low" | "medium" | "high")
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="High">High</option>
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
