import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { addTodo } from "../store/todoSlice";
import { TodoDTO } from "../models/Todo";
import { toast } from "react-toastify";

interface AddTodoModalProps {
  onTodoAdded: () => void;
  onClose: () => void;
}

const AddTodoModal: React.FC<AddTodoModalProps> = ({
  onTodoAdded,
  onClose,
}) => {
  //const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<TodoDTO>({
    title: "",
    isCompleted: false,
    date: new Date().toISOString().split("T")[0],
    priority: "medium",
    isArchived: false,
  });
  const dispatch = useDispatch<AppDispatch>();

  //if (!open) return null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Naslov je obavezan");
      return;
    }

    try {
      await dispatch(addTodo(formData)).unwrap();
      toast.success("Zadatak je uspešno dodat");
      setFormData({
        title: "",
        isCompleted: false,
        date: new Date().toISOString().split("T")[0],
        priority: "medium",
        isArchived: false,
      });
      // setIsOpen(false);
      onTodoAdded(); //refresuje listu taskova
      onClose(); // zatvara modal
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Greška prilikom dodavanja zadatka");
    }
  };

  const handleClose = () => {
    // setIsOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="rounded-2xl shadow-2xl w-[270px] min-h-[300px] animate-in fade-in-0 zoom-in-95 duration-200 border border-gray-200"
        style={{ background: "#f9f9f9" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 center">
            Novi zadatak
          </h2>
        </div>

        {/* Forma */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Naslov */}
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-base font-medium text-gray-700 mb-2"
            >
              Naziv zadatka: *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="flex-1 min-w-[265px] px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Unesite naziv zadatka"
              required
            />
          </div>

          {/* Datum */}
          <div>
            <label
              htmlFor="date"
              className="block text-base font-medium text-gray-700 mb-2"
            >
              Datum prijave:
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="flex-1 min-w-[266px] rounded-lg px-4 py-3 text-lg text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Prioritet */}
          <div>
            <label
              htmlFor="priority"
              className="block text-base font-medium text-gray-700 mb-2"
            >
              Prioritet:
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as "low" | "medium" | "high",
                })
              }
              className="w-full border rounded-lg px-4 py-3 text-lg text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Nizak</option>
              <option value="medium">Srednji</option>
              <option value="high">Visok</option>
            </select>
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isCompleted"
              checked={formData.isCompleted}
              onChange={(e) =>
                setFormData({ ...formData, isCompleted: e.target.checked })
              }
              className="h-6 w-6 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="isCompleted"
              className="text-base font-medium text-gray-700 cursor-pointer"
            >
              Završен
            </label>
          </div>

          {/* Dugmad */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 text-lg"
            >
              Otkaži
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-lg"
            >
              Dodaj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTodoModal;
