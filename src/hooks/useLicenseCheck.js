import { useState, useEffect } from "react";

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

        const baseUrl =
          import.meta.env.VITE_API_URL || "https://cashier.runasp.net";
        const res = await fetch(baseUrl + "/api/MainCategories");

        if (res.status === 403) {
          const text = await res.text();
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
