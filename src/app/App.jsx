import AppRoutes from "../routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <>
      <AppRoutes />

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={true}
        pauseOnHover={true}
        draggable={true}
        pauseOnFocusLoss={true}
      />
    </>
  );
}
