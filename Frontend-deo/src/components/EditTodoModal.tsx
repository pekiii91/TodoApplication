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
  const [dueDate, setDueDate] = useState(
    todo.date ? todo.date.split("T")[0] : new Date().toISOString().split("T")[0]
  );

  const [submitted, setSubmitted] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const today = new Date().toISOString().split("T")[0]; // današnji datum (YYYY-MM-DD)

  const handleUpdate = () => {
    setSubmitted(true); //aktivira validaciju

    //Validacija naslova
    if (!title.trim() || title.trim().length < 3)
      //zaustavlja ako je naslov prazan
      return;

    //Validacija datuma
    if (dueDate && dueDate < today) return;

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
          className={`flex-1 min-w-[265px] px-3 py-2 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-8 mx-8 ${
            submitted && (!title.trim() || title.trim().length < 3)
              ? "border-2 border-red-500"
              : "border border-gray-300"
          }`}
        />
        {/**validacija u boji */}
        {submitted && !title.trim() && (
          <div
            style={{ color: "red", fontSize: "0.9rem", marginBottom: "0.5rem" }}
          >
            Naslov je obavezan!
          </div>
        )}

        {/*Datum */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="date"
            className="block text-base font-medium text-gray-700 mb-2"
          >
            Datum prijave:
          </label>
          <input
            type="date"
            value={dueDate}
            min={today} //sprecava unos proslih datuma
            onChange={(e) => setDueDate(e.target.value)}
            style={{
              padding: "0.5rem",
              width: "50%",
              border:
                submitted && dueDate < today
                  ? "1px solid red"
                  : "1px solid #ccc",
            }}
          />
        </div>
        {submitted && dueDate < today && (
          <div
            style={{ color: "red", fontSize: "0.9rem", marginBottom: "0.5rem" }}
          >
            Datum ne moze biti iz prošlosti!
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
