import { Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { showError, showSuccess } from "../Toaster/ToasterFun";
import axiosService from "../Utils/axios";
import Loader from "../Loader/Loader";
import { appRoutes } from "../Utils/constants/page-routes";
import { useTranslation } from "react-i18next";
import bugplotLogo from "../../assets/images/bugplot-logo.svg";

const VerifyEmail = () => {
  const { t } = useTranslation();
  const [token, setToken] = useState<string>("");
  const [emailId, setEmailId] = useState<string>("");
  const [showLoader, setShowLoader] = useState<boolean>(true);

  const navigate = useNavigate();
  const location = useLocation();

  const getToken = (url: string) => {
    if (url.includes("token")) {
      return url.split("?")[1].split("=")[1];
    }
  };

  useEffect(() => {
    const token = getToken(location?.search);
    setToken(token || "");
    const email = localStorage.getItem("email") || "";
    setEmailId(email);
    if (email) {
      setShowLoader(false);
    }
    return () => {
      if (localStorage.getItem("email")) localStorage.removeItem("email");
    };
  }, [location]);

  useEffect(() => {
    if (token) {
      const verifyToken = async () => {
        setShowLoader(true);
        const payload = { token: token };
        try {
          const response = await axiosService.post(`/auth/verify`, payload);
          showSuccess(response.data.message);
          navigate(appRoutes.SIGNIN_PAGE);
        } catch (error) {
          showError(error.response.data.message);
        } finally {
          setShowLoader(false);
        }
      };

      verifyToken();
    }
  }, [token, navigate]);

  const resendEmail = async () => {
    try {
      const resp = await axiosService.post("/auth/resend-verification-link", {
        email: emailId,
      });
      if (resp && resp.status === 201) {
        showSuccess(
          t("Verification link sent successfully. Please check your inbox.")
        );
      }
    } catch (error) {
      showError(error.response.data.message);
    }
  };

  return (
    <>
      {showLoader ? (
        <div className="pb-20 pt-40 flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-start py-6 sm:px-6 lg:px-8">
          <div className="mt-24 sm:mx-auto sm:w-full sm:max-w-lg">
            <span onMouseDown={() => navigate("/")} className="cursor-pointer">
              <img
                className="mx-auto h-10 w-auto"
                src={bugplotLogo}
                alt="Workflow"
              />
            </span>

            <h2 className="mt-6 ml-2 mr-2 text-center text-xl 2xl:text-3xl font-bold text-gray-900">
              {t("Verify your e-mail to finish signing up for Quick Test")}
            </h2>
          </div>
          <div className="mt-8 ml-3 mr-3 text-xl sm:mx-auto sm:w-full sm:max-w-lg">
            <div className="bg-white py-4 px-4 shadow-sm sm:rounded-lg text-sm">
              <p className="mb-6">
                {t("Thank you for choosing")} <b>{t("Quick Test")}</b>.
              </p>
              <p>
                {t(
                  "We're excited to have you onboard. Experience our Test Case Management Tool used by thousands of the world's best QA and Dev teams. If you haven't received an email on"
                )}{" "}
                <b>{emailId}</b>,{" "}
                <span
                  onClick={resendEmail}
                  className="underline text-indigo-600 cursor-pointer"
                >
                  {t("click here to re-send email.")}
                </span>
              </p>
              <div className="mt-6 relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  <Link to={appRoutes.SIGNIN_PAGE}>
                    <span className="mt-1 py-1.5 px-2.5 text-xs inline-flex items-center border border-transparent rounded-md shadow-xs  font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden justify-center">
                      <span className="text-md pr-1">&larr;</span>
                      {t("Go back to login")}
                    </span>
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VerifyEmail;
