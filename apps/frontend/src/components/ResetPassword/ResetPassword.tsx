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
import { showError, showSuccess } from "../Toaster/ToasterFun";
import { appRoutes } from "../Utils/constants/page-routes";
import { ValidatorMessage } from "../Utils/constants/misc";
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
          <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <span
                onMouseDown={() => navigate("/")}
                className="cursor-pointer"
              >
                <img
                  className="mx-auto h-12 w-auto"
                  src={bugplotLogo}
                  alt="Workflow"
                />
              </span>
              <h2 className="mt-6 text-center text-xl 2xl:text-3xl font-extrabold text-gray-900">
                {t("Setup your new password")}
              </h2>
            </div>
            <div className="mt-8 ml-3 mr-3 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <Formik
                  initialValues={initialValues}
                  validationSchema={SignInSchema}
                  onSubmit={onSubmitHandler}
                >
                  {(formik) => {
                    const { errors, isValid, dirty } = formik;
                    return (
                      <Form className="space-y-6" autoComplete="off">
                        <div>
                          <FormikInput
                            type="password"
                            name="password"
                            label={t("New Password")}
                          />
                        </div>
                        <div>
                          <FormikInput
                            type="password"
                            name="cnfpassword"
                            label={t("Confirm Password")}
                          />
                        </div>
                        <div>
                          {typeof errors === "string" && (
                            <div className="text-red-600 mb-2 text-sm">
                              {errors}
                            </div>
                          )}
                          <Button
                            id="set-password"
                            type="submit"
                            loading={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none ${!(dirty && isValid)
                              ? "cursor-not-allowed bg-indigo-600/50 hover:bg-indigo-600/50"
                              : ""
                              }`}
                          >
                            {t("Set Password")}
                          </Button>
                        </div>
                      </Form>
                    );
                  }}
                </Formik>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
