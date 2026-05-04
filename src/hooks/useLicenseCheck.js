import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

export default function useLicenseCheck() {
  const [licenseValid, setLicenseValid] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkLicenseFromServer = async () => {
      try {
        const expired = localStorage.getItem("licenseExpired") === "true";
        if (expired) {
          setLicenseValid(false);
          setIsChecking(false);
          return;
        }

        const res = await axiosInstance.get(
          "/api/MainCategories/GetAllMainCategories",
          {
            validateStatus: () => true,
          },
        );

        if (res.status === 403) {
          const text =
            typeof res.data === "string" ? res.data : JSON.stringify(res.data);

          if (text.includes("License expired")) {
            setLicenseValid(false);
            localStorage.setItem("licenseExpired", "true");
            setIsChecking(false);
            return;
          }
        }

        setLicenseValid(true);
        localStorage.removeItem("licenseExpired");
        setIsChecking(false);
      } catch (err) {
        console.error("License check error:", err);
        setLicenseValid(false);
        localStorage.setItem("licenseExpired", "true");
        setIsChecking(false);
      }
    };

    checkLicenseFromServer();
  }, []);

  return { licenseValid, isChecking };
}
