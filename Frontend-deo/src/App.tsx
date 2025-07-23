import TodoList from "./components/TodoList";
import "./App.css";
import RandomQuotes from "./components/RandomQuotes";
import { useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/*Ova funkcija generise danasnji datum u formatu 
"YYYY-MM-DD" koji se poklapa s formatom datuma iz baze i koristi se za filtriranje Todo zadataka. */
/*const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().substring(0, 10); // "YYYY-MM-DD"
};*/

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

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h1>TODO aplikacija</h1>
      <TodoList />
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Desna fiksna pozicija za citat */}
      <div
        style={{
          position: "absolute",
          top: "2rem",
          right: "2rem",
          width: "450px",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          borderRadius: "10px",
          padding: "2rem",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <RandomQuotes />
      </div>
    </div>
  );
}

export default App;
