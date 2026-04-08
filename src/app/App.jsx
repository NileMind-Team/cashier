import AppRoutes from "../routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LicenseActivation from "../pages/LicenseActivation";
import useLicenseCheck from "../hooks/useLicenseCheck";

export default function App() {
  const { licenseValid } = useLicenseCheck();

  const handleActivationSuccess = () => {
    window.location.reload();
  };

  if (!licenseValid) {
    return <LicenseActivation onActivationSuccess={handleActivationSuccess} />;
  }

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
