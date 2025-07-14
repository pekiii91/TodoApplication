import TodoList from "./components/TodoList";
import "./App.css";
import RandomQuotes from "./components/RandomQuotes";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/*Ova funkcija generise danasnji datum u formatu 
"YYYY-MM-DD" koji se poklapa s formatom datuma iz baze i koristi se za filtriranje Todo zadataka. */
const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().substring(0, 10); // "YYYY-MM-DD"
};

function App() {
  //izvlacimo datum iz URL
  const { dateParam } = useParams();
  //logika za navigaciju
  const navigate = useNavigate();

  const today = new Date();

  const selectedDate = dateParam
    ? new Date(dateParam.replace(/-/g, "/"))
    : today;

  const formatDisplayDate = (d: Date) =>
    d.toLocaleDateString("sr-RS", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const navigateTo = (date: Date) => {
    const urlDate = date
      .toLocaleDateString("sr-RS")
      .split(".")
      .map((part) => part.trim())
      .reverse()
      .join("-");
    navigate(`/${urlDate}`);
  };

  const previousDay = new Date(selectedDate);
  previousDay.setDate(selectedDate.getDate() - 1);

  const nextDay = new Date(selectedDate);
  nextDay.setDate(selectedDate.getDate() + 1);

  const formatToIsoDate = (dateStr: string): string => {
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts[0].length === 2) {
        // Ako je dd-mm-yyyy
        const [day, month, year] = parts;
        return `${year}-${month}-${day}`;
      } else {
        // Ako je već yyyy-mm-dd
        return dateStr;
      }
    }
    return new Date().toISOString().substring(0, 10);
  };

  //Ako nema datuma u URL, koristi danasnji
  const formattedDate = dateParam ? formatToIsoDate(dateParam) : getTodayDate();

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <div
        style={{
          backgroundColor: "#ac1b49",
          padding: "1rem",
          marginBottom: "1rem",
          /*dodajemo*/
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button onClick={() => navigateTo(previousDay)}>
          ← {formatDisplayDate(previousDay)}
        </button>
        <span>
          📅 Datum: <strong>{formatDisplayDate(selectedDate)}</strong>
        </span>
        <button onClick={() => navigateTo(nextDay)}>
          {formatDisplayDate(nextDay)} →
        </button>
      </div>
      <RandomQuotes />
      <h1>TODO aplikacija</h1>
      <TodoList selectedDate={formattedDate} />
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}

export default App;
