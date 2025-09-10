import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { addTodo } from "../store/todoSlice";
import { TodoDTO } from "../models/Todo";
import { X } from "lucide-react";
import { toast } from "react-toastify";

interface AddTodoModalProps {
  onTodoAdded: () => void;
  onClose: () => void;
}

const AddTodoModal: React.FC<AddTodoModalProps> = ({
  onTodoAdded,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<TodoDTO>({
    title: "",
    isCompleted: false,
    date: new Date().toISOString().split("T")[0],
    priority: "medium",
    isArchived: false,
  });
  const dispatch = useDispatch<AppDispatch>();

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
      setIsOpen(false);
      onTodoAdded();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Greška prilikom dodavanja zadatka");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group relative inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <span>Dodaj novi zadatak</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-in fade-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Novi zadatak</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Forma */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Naslov */}
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Naslov: *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Unesite naziv zadatka"
              required
            />
          </div>

          {/* Datum */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Prioritet */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="w-full border rounded-lg px-4 py-2 text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/*Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCompleted"
              checked={formData.isCompleted}
              onChange={(e) =>
                setFormData({ ...formData, isCompleted: e.target.checked })
              }
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="isCompleted"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Zavrsen
            </label>
          </div>

          {/* Dugmad */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
            >
              Otkaži
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
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
