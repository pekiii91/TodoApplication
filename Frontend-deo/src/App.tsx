import TodoList from "./components/TodoList";
import Login from "./components/Login";
import "./App.css";
import RandomQuotes from "./components/RandomQuotes";
import { store } from "./store/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";

function App() {
  const isAutheticated = () => {
    return localStorage.getItem("token") !== null;
  };

  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    return isAutheticated() ? (
      <>{children}</>
    ) : (
      <Navigate to="/login"></Navigate>
    );
  };

  return (
    <Provider store={store}>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <TodoList />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/"></Navigate>} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        ></ToastContainer>
        <div className="random-quotes">
          <RandomQuotes />
        </div>
      </div>
    </Provider>
  );
}

export default App;
