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
  const [formData, setFormData] = useState<TodoDTO>({
    title: "",
    isCompleted: false,
    date: new Date().toISOString().split("T")[0],
    priority: "medium",
    isArchived: false,
  });

  const [errors, setErrors] = useState<{ title?: string; date?: string }>({});
  const dispatch = useDispatch<AppDispatch>();

  //Validacija pojedinih polja
  const validateField = (name: string, value: string) => {
    //const newErrors: { title?: string; date?: string } = {};
    const today = new Date().toISOString().split("T")[0];
    let error = "";

    if (name === "title") {
      if (!value.trim()) {
        error = "Naslov zadatka je obavezan";
      } else if (value.length > 100) {
        error = "Naslov mora imate bar 3 karaktera";
      }
    }

    if (name === "date") {
      if (value < today) {
        error = "Datum ne može biti u prošlosti";
      }
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const validate = () => {
    const newErrors: { title?: string; date?: string } = {};
    const today = new Date().toISOString().split("T")[0];

    if (!formData.title.trim()) {
      newErrors.title = "Naslov je obavezan";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Naslov ne sme biti duži od 3 karaktera";
    }
    //Validacija datuma (da ne moze proci datum iz proslosti)
    if (formData.date < today) {
      newErrors.date = "Datum ne sme biti iz prošlosti";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;

    if (e.target instanceof HTMLInputElement && e.target.type === "checkbox") {
      // Checkbox
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [id]: checked }));
      validateField(id, checked.toString());
    } else {
      // Input i Select
      setFormData((prev) => ({ ...prev, [id]: value }));
      validateField(id, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

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

      setErrors({});

      onTodoAdded(); //refresuje listu taskova
      onClose(); // zatvara modal
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Greška prilikom dodavanja zadatka");
    }
  };

  const handleClose = () => {
    onClose();
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
              onChange={handleChange}
              className={`flex-1 min-w-[265px] px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title
                  ? "border-2 border-red-500"
                  : "border border-gray-300"
              }`}
              placeholder="Unesite naziv zadatka"
              required
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-2">{errors.title}</p>
            )}
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
              onChange={handleChange}
              className={`flex-1 min-w-[266px] rounded-lg px-4 py-3 text-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.date
                  ? "border-2 border-red-500"
                  : "border border-gray-300"
              }`}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
