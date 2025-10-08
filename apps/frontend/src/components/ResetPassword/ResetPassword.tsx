import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormikInput } from "../Common/FormikInput";
import axiosService from "../Utils/axios";
import { useEffect, useState } from "react";
import Button from "../Button";
import { useFormSubmitWithLoading } from "../Utils/hooks/useFormSubmitWithLoading";
import { useLocation } from "react-router-dom";

import { useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";
import { showError, showSuccess } from "../Toaster/Toast";
import { appRoutes } from "../Utils/constants/page-routes";
import { ButtonCSSStyles, ValidatorMessage } from "../Utils/constants/misc";
import { useTranslation } from "react-i18next";
import bugplotLogo from "../../assets/images/bugplot-logo.svg";

export default function ResetPasswordForm() {
  const { t } = useTranslation();
  const [showLoader, setShowLoader] = useState(true);
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const SignInSchema = Yup.object().shape({
    password: Yup.string()
      .required(t(ValidatorMessage.PASS_REQ))
      .min(8, t(ValidatorMessage.PASS_MIN_LENGTH)),
    cnfpassword: Yup.string()
      .oneOf([Yup.ref("password")], t(ValidatorMessage.BOTH_PASS_SAME))
      .required(t(ValidatorMessage.CONFIRM_PASS_REQ)),
  });

  const getToken = (url: string) => {
    if (url.includes("token")) {
      return url.split("?")[1].split("=")[1];
    }
  };

  useEffect(() => {
    const token = getToken(location?.search);
    setToken(token || "");
    localStorage.setItem("resetPasswordToken", token || "");
    if (token) {
      setShowLoader(false);
    }
  }, [location?.search, showLoader]);

  const initialValues = {
    password: "",
    cnfpassword: "",
  };
  const submitForm = async (values: typeof initialValues) => {
    try {
      const resp = await axiosService.post("/auth/reset-password", {
        password: values.password,
        token: token,
      });
      if (resp && resp.status === 200) {
        showSuccess(resp.data?.message);
        localStorage.clear();
        sessionStorage.clear();
        navigate(appRoutes.SIGNIN_PAGE);
      }
    } catch (error) {
      showError(error.response.data.message);
    }
  };

  const { onSubmitHandler, loading } = useFormSubmitWithLoading(submitForm);

  return (
    <>
      {showLoader ? (
        <div className=" flex justify-center items-center content-center m-56">
          <Loader />
        </div>
      ) : (
        <>
          <section className="bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
              <a
                href="/quick-test"
                className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
              >
                <img className="w-8 h-8 mr-2" src={bugplotLogo} alt="QuickTest" />
                Quick Test
              </a>
              <div className="w-full p-6 bg-white rounded-sm shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
                <h1 className="h1">{t("Set a new password")}</h1>
                <Formik
                  initialValues={initialValues}
                  validationSchema={SignInSchema}
                  onSubmit={onSubmitHandler}
                >
                  {(formik) => {
                    const { errors } = formik;
                    return (
                      <Form className="mt-4 space-y-4 lg:mt-5 md:space-y-4" autoComplete="off">
                        <div>
                          <FormikInput
                            type="password"
                            name="password"
                            label={t("New Password")}
                            placeholder={t("••••••••")}
                          />
                        </div>
                        <div>
                          <FormikInput
                            type="password"
                            name="cnfpassword"
                            label={t("Confirm Password")}
                            placeholder={t("••••••••")}
                          />
                        </div>
                        {typeof errors === "string" && (
                          <div className="text-red-600 mb-2 text-sm">{errors}</div>
                        )}
                        <Button
                          id="set-password"
                          type="submit"
                          loading={loading}
                          className={`${ButtonCSSStyles.btnPrimary} btn-primary w-full`}
                        >
                          {t("Set password")}
                        </Button>
                        <p className="text-sm font-light text-gray-500 dark:text-gray-400 text-center">
                          <a href="/quick-test/login" className="link">
                            {t("Return Back to Login")}
                          </a>
                        </p>
                      </Form>
                    );
                  }}
                </Formik>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
