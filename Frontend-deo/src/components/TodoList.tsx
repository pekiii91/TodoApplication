import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import {
  fetchTodos,
  updateTodo,
  fetchArchivedTodos,
  archiveTodo,
  deleteTodo,
} from "../store/todoSlice";
import { TodoItem } from "../models/Todo";
import AddTodoModal from "./AddTodoModal";
import EditTodoModal from "./EditTodoModal";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import {
  Search,
  Filter,
  Calendar,
  Archive,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

const TodoList: React.FC = () => {
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<
    "title" | "date" | "isCompleted"
  >("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "pending"
  >("all");
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, currentPage, totalPages, loading, error } = useSelector(
    (state: RootState) => state.todos
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!showArchived) {
      dispatch(fetchTodos(currentPage));
    } else {
      dispatch(fetchArchivedTodos({ page: currentPage, pageSize: 5 }));
    }
  }, [dispatch, currentPage, showArchived, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      // dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSortClick = (column: "title" | "date" | "isCompleted") => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const isSameDayLocal = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const filteredTodos = items
    .filter((todo) => {
      if (statusFilter === "completed") return todo.isCompleted;
      if (statusFilter === "pending") return !todo.isCompleted;
      return true;
    })
    .filter((todo) =>
      todo.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((todo) => {
      if (!selectedDate) return true;
      return isSameDayLocal(new Date(todo.date), selectedDate);
    })
    .filter((todo) => (showArchived ? todo.isArchived : !todo.isArchived))
    .sort((a, b) => {
      let result = 0;
      switch (sortColumn) {
        case "title":
          result = a.title.localeCompare(b.title);
          break;
        case "date":
          result = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "isCompleted":
          result = Number(a.isCompleted) - Number(b.isCompleted);
          break;
      }
      return sortDirection === "asc" ? result : -result;
    });

  const handleToggleComplete = async (todo: TodoItem) => {
    const updatedTodo = { ...todo, isCompleted: !todo.isCompleted };

    try {
      await dispatch(updateTodo(updatedTodo)).unwrap();

      const toastId = toast.success(
        <div className="flex items-center justify-between">
          <span>Zadatak ažuriran</span>
          <button
            onClick={async () => {
              await dispatch(updateTodo(todo));
              toast.dismiss(toastId);
              toast.info("Undo uspešan");
            }}
            className="ml-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Undo
          </button>
        </div>,
        { autoClose: 5000 }
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Greška prilikom ažuriranja");
    }
  };

  const handleArchive = async (todoId: number) => {
    try {
      await dispatch(archiveTodo(todoId)).unwrap();
      toast.success("Zadatak arhiviran");

      if (showArchived) {
        dispatch(fetchArchivedTodos({ page: currentPage, pageSize: 5 }));
      } else {
        dispatch(fetchTodos(currentPage));
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Greška pri arhiviranju");
    }
  };

  const handleDelete = async (todoId: number) => {
    if (
      window.confirm("Da li ste sigurni da želite da obrišete ovaj zadatak?")
    ) {
      try {
        await dispatch(deleteTodo(todoId)).unwrap();
        toast.success("Zadatak obrisan");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("Greška pri brisanju");
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    if (showArchived) {
      dispatch(fetchArchivedTodos({ page: newPage, pageSize: 5 }));
    } else {
      dispatch(fetchTodos(newPage));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Visok";
      case "medium":
        return "Srednji";
      case "low":
        return "Nizak";
      default:
        return priority;
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column)
      return <ChevronUp className="w-4 h-4 opacity-30" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    );
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Todo Lista Zadataka
          </h1>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pretraži zadatke..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | "completed" | "pending"
                  )
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="all">Svi zadaci</option>
                <option value="pending">Nezavršeni</option>
                <option value="completed">Završeni</option>
              </select>
            </div>

            {/* Date Picker */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
                dateFormat="dd.MM.yyyy"
                isClearable
                placeholderText="Filtriraj po datumu"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Archive Toggle */}
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                  showArchived ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    showArchived ? "translate-x-6" : "translate-x-0"
                  }`}
                ></div>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700 flex items-center">
                <Archive className="w-4 h-4 mr-1" />
                Arhivirani
              </span>
            </label>
          </div>

          {/* Add Todo */}
          <div className="mb-6">
            <AddTodoModal
              onTodoAdded={() => {}}
              onClose={() => dispatch(fetchTodos(currentPage))}
            />
          </div>

          {/* Stats */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {items.length}
                </div>
                <div className="text-sm text-gray-600">Ukupno</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {items.filter((t) => t.isCompleted).length}
                </div>
                <div className="text-sm text-gray-600">Završeni</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {items.filter((t) => !t.isCompleted).length}
                </div>
                <div className="text-sm text-gray-600">Nezavršeni</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {items.filter((t) => t.isArchived).length}
                </div>
                <div className="text-sm text-gray-600">Arhivirani</div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSortClick("title")}
                  >
                    <div className="flex items-center gap-2">
                      Naslov
                      <SortIcon column="title" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSortClick("date")}
                  >
                    <div className="flex items-center gap-2">
                      Datum
                      <SortIcon column="date" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSortClick("isCompleted")}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <SortIcon column="isCompleted" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioritet
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTodos.map((todo) => (
                  <tr
                    key={todo.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div
                            className={`text-sm font-medium ${
                              todo.isCompleted
                                ? "line-through text-gray-500"
                                : "text-gray-900"
                            }`}
                          >
                            {todo.title}
                          </div>
                          {/*{todo.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {todo.description}
                            </div>
                          )}*/}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(todo.date).toLocaleDateString("sr-RS")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleComplete(todo)}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          todo.isCompleted
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        }`}
                      >
                        {todo.isCompleted ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Završeno
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4" />U toku
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                          todo.priority
                        )}`}
                      >
                        {getPriorityText(todo.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingTodo(todo)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Izmeni"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!todo.isArchived && (
                          <button
                            onClick={() => handleArchive(todo.id)}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50 transition-colors"
                            title="Arhiviraj"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(todo.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Obriši"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTodos.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                Nema zadataka za prikaz
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Strana {currentPage} od {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prethodna
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sledeća
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingTodo && (
        <EditTodoModal
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
          onUpdated={() => {
            if (showArchived) {
              dispatch(fetchArchivedTodos({ page: currentPage, pageSize: 5 }));
            } else {
              dispatch(fetchTodos(currentPage));
            }
            setEditingTodo(null);
          }}
        />
      )}
    </div>
  );
};

export default TodoList;
