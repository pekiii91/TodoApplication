import TodoList from "./components/TodoList";
import "./App.css";
import RandomQuotes from "./components/RandomQuotes";
import { useParams } from "react-router-dom";
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
  //const navigate = useNavigate();

  const today = new Date();

  const selectedDate = dateParam
    ? new Date(dateParam.replace(/-/g, "/"))
    : today;

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
      <RandomQuotes />
      <h1>TODO aplikacija</h1>
      <TodoList selectedDate={new Date(formattedDate)} />
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}

export default App;
