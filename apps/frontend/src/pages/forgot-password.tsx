import { Link } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormikInput } from "../components/Common/FormikInput";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import { useFormSubmitWithLoading } from "../components/Utils/hooks/useFormSubmitWithLoading";
import PopUP from "../components/SignUp/Modal";
import axiosService from "../components/Utils/axios";
import { showError, showSuccess } from "../components/Toaster/ToasterFun";
import { validateRequiredEmail } from "../components/Utils/validators";
import { useNavigate } from "react-router-dom";
import { appRoutes } from "../components/Utils/constants/page-routes";
import { ToastMessage } from "../components/Utils/constants/misc";
import { useTranslation } from "react-i18next";
import bugplotLogo from "../assets/images/bugplot-logo.svg";

const Forgotpassword = () => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("token")) {
      showSuccess(ToastMessage.ALREADY_LOGGED_IN);
      navigate(appRoutes.DASHBOARD);
    }
  }, [navigate]);
  const SignInSchema = Yup.object().shape({
    email: validateRequiredEmail(),
  });
  const initialValues = {
    email: "",
  };

  const [showModal, toggleModal] = useState(false);

  const popUpProps = {
    toggleModal,
    headline: t("Password reset email sent!"),
    text: t(
      "Password reset email has been shared on registered email address. Please set new password with the help of link"
    ),
    buttonText: t("Go back to login"),
    linkText: "signin",
    dataAttr: "back-to-login",
  };

  const sendResetLink = async (email: string) => {
    try {
      const resp = await axiosService.post("auth/send-reset-link", { email });
      if (resp && resp.status === 200) {
        toggleModal(true);
      }
    } catch (err) {
      showError(err.response.data.message);
    }
  };

  const submitForm = async (values: typeof initialValues) => {
    await sendResetLink(values?.email);
  };
  const { onSubmitHandler, loading } = useFormSubmitWithLoading(submitForm);

  return (
    <>
      <meta
        name="description"
        content="Don't remember the password. Do not worry, we got you covered. We'll email you a link to reset your password"
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Dashboard, Forgot Password, Login, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/forgot-password`}
      />

      {showModal && <PopUP {...popUpProps} />
      }
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <span onMouseDown={() => navigate("/")} className="cursor-pointer">
            <img
              className="mx-auto h-12 w-auto"
              src={bugplotLogo}
              alt="Workflow"
            />
          </span>

          <h2 className="mt-6 text-center text-xl 2xl:text-3xl font-extrabold text-gray-900">
            {t("Reset your password")}
          </h2>
        </div>
        <div className="mt-8 ml-3 mr-3 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <Formik
              initialValues={initialValues}
              validationSchema={SignInSchema}
              onSubmit={onSubmitHandler}
            >
              {() => {
                return (
                  <Form
                    className="space-y-6"
                    noValidate
                    // https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion#preventing_autofilling_with_autocompletenew-password
                    autoComplete="new-password"
                  >
                    <div>
                      <div className="mt-1">
                        <FormikInput
                          type="email"
                          name="email"
                          label={t("Email Address")}
                        />
                      </div>
                    </div>
                    <div>
                      <Button
                        id="forgot-password"
                        loading={loading}
                        type="submit"
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none`}
                      >
                        {t("Forgot Password")}
                      </Button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
            <div className="mt-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    <Link to={appRoutes.SIGNIN_PAGE}>
                      <span className="flex items-center font-medium text-indigo-600 hover:text-indigo-500">
                        <span className="text-md block">&larr;</span>{" "}
                        <span className="block" style={{ paddingTop: "2px" }}>
                          {t("Back to Login")}
                        </span>
                      </span>
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Forgotpassword;
