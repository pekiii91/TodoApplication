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
  BarChart3,
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

  //Fetch podataka
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
  }, [error]);

  //Sortiranje
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

  //Filtriranje i sortiranje
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

  //Toggle complete
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

  //Arhiviranje
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

  //Brisanje
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

  //Paganacija
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
        return "High";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return priority;
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column)
      return <ChevronUp className="w-4 h-4 opacity-30" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 text-blue-400" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-400" />
    );
  };

  type StatCardProps = {
    label: string;
    value: number;
    color: string;
  };

  const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
    return (
      <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center justify-center">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-xl font-bold">{value}</span>
      </div>
    );
  };

  //Loader
  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Učitavanje zadataka...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex justify-center items-start py-10">
      <div className="bg-red-500 shadow-xl rounded-2xl w-full max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mx-auto px-8 py-8 max-w-screen-xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Lista Zadataka
          </h1>
          <p className="text-gray-600">
            Organizujte i pratite svoje dnevne zadatke
          </p>
          <AddTodoModal
            onTodoAdded={() => {}}
            onClose={() => dispatch(fetchTodos(currentPage))}
          />
        </div>
        {/* Main Content Card */}
        <div className="bg-white/70 rounded-xl shadow-lg border-2 border-indigo-300 w-[1000px] min-h-[400px] mx-auto p-10">
          {/* Controls Section */}
          <div className="bg-gray-100 border-b border-gray-300 p-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  id="checkbox"
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    showArchived ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                      showArchived ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700 flex items-center">
                  <Archive className="w-5 h-5 mr-2" />
                  Arhivirani
                </span>
              </label>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 items-center">
              {/* Search */}
              <div className="flex items-center gap-2 w-full max-w-sm">
                <Search className="text-gray-400 w-4 h-4 pointer-events-none z-10" />
                <input
                  id="text"
                  type="text"
                  placeholder="Pretraži zadatke..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm min-w-[200px] pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 w-full max-w-sm">
                <Filter className="text-gray-600 w-5 h-5" />
                <select
                  id="statusFilter"
                  name="statusFilter"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as "all" | "completed" | "pending"
                    )
                  }
                  className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none transition-colors"
                >
                  <option value="all">Svi zadaci</option>
                  <option value="pending">Nezavršeni</option>
                  <option value="completed">Završeni</option>
                </select>
              </div>

              {/* Date Picker */}
              <div className="relative flex items-center gap-2 w-full max-w-sm ">
                <Calendar className="text-gray-400 w-5 h-5" />
                <DatePicker
                  id="taskDate"
                  name="taskDate"
                  selected={selectedDate}
                  onChange={(date: Date | null) => setSelectedDate(date)}
                  dateFormat="dd.MM.yyyy"
                  isClearable
                  placeholderText="Filtriraj po datumu"
                  className="flex-1 pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                />
              </div>
            </div>
          </div>
          {/* Stats */}
          <section className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Pregled zadataka
              </h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard value={items.length} label="Ukupno" color="slate" />
              <StatCard
                value={items.filter((t) => t.isCompleted).length}
                label="Završeni"
                color="green"
              />
              <StatCard
                value={items.filter((t) => !t.isCompleted).length}
                label="Nezavršeni"
                color="amber"
              />
              <StatCard
                value={items.filter((t) => t.isArchived).length}
                label="Arhivirani"
                color="purple"
              />
            </div>
          </section>
          {/* Table Section */}
          <div className="p-6">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 text-xl mb-2">
                  Nema zadataka za prikaz
                </div>
                <p className="text-gray-500">
                  Dodajte novi zadatak ili promenite filter kriterijume
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th
                        className="text-left py-4 px-2 text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                        onClick={() => handleSortClick("title")}
                      >
                        <div className="flex items-center gap-2">
                          Naslov: *
                          <SortIcon column="title" />
                        </div>
                      </th>
                      <th
                        className="text-left py-4 px-2 text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                        onClick={() => handleSortClick("date")}
                      >
                        <div className="flex items-center gap-2">
                          Datum prijave:
                          <SortIcon column="date" />
                        </div>
                      </th>
                      <th
                        className="text-left py-4 px-2 text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                        onClick={() => handleSortClick("isCompleted")}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          <SortIcon column="isCompleted" />
                        </div>
                      </th>
                      <th className="text-left py-4 px-2 text-sm font-semibold text-gray-600">
                        Prioritet
                      </th>
                      <th className="text-right py-4 px-2 text-sm font-semibold text-gray-600">
                        Akcije
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTodos.map((todo, index) => (
                      <tr
                        key={todo.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="py-4 px-2">
                          <div
                            className={`text-sm font-medium ${
                              todo.isCompleted
                                ? "line-through text-gray-500"
                                : "text-gray-900"
                            }`}
                          >
                            {todo.title}
                          </div>
                        </td>
                        <td className="py-4 px-2 text-sm text-gray-600">
                          {new Date(todo.date).toLocaleDateString("sr-RS")}
                        </td>
                        <td className="py-4 px-2">
                          <button
                            onClick={() => handleToggleComplete(todo)}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                              todo.isCompleted
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            }`}
                          >
                            {todo.isCompleted ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Završeno
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />U toku
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                              todo.priority
                            )}`}
                          >
                            {getPriorityText(todo.priority)}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingTodo(todo)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all hover:scale-110"
                              title="Izmeni"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {!todo.isArchived && (
                              <button
                                onClick={() => handleArchive(todo.id)}
                                className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition-all hover:scale-110"
                                title="Arhiviraj"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(todo.id)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all hover:scale-110"
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
            )}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <footer className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Strana {currentPage} od {totalPages}
              </span>
              <div className="flex items-center gap-3">
                <PageButton
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  icon={<ChevronLeft className="w-4 h-4" />}
                  text="Prethodna"
                />
                <PageButton
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  text="Sledeća"
                  icon={<ChevronRight className="w-4 h-4" />}
                />
              </div>
            </footer>
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

const PageButton = ({
  disabled,
  onClick,
  icon,
  text,
}: {
  disabled: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  text: string;
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
  >
    {icon}
    {text}
  </button>
);

export default TodoList;
