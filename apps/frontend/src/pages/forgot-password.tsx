import { Link } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormikInput } from "../components/Common/FormikInput";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import { useFormSubmitWithLoading } from "../components/Utils/hooks/useFormSubmitWithLoading";
import PopUP from "../components/SignUp/Modal";
import axiosService from "../components/Utils/axios";
import { showError, showSuccess } from "../components/Toaster/Toast";
import { validateRequiredEmail } from "../components/Utils/validators";
import { useNavigate } from "react-router-dom";
import { appRoutes } from "../components/Utils/constants/page-routes";
import { ButtonCSSStyles, ToastMessage } from "../components/Utils/constants/misc";
import { useTranslation } from "react-i18next";
import bugplotLogo from "../assets/images/bugplot-logo.svg";

const Forgotpassword = () => {
  const { t } = useTranslation();
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
      <title>QuickTest Forgot Password</title>

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

      {showModal && <PopUP {...popUpProps} />}
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <a
            href="/quick-test"
            className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
          >
            <img className="w-8 h-8 mr-2" src={bugplotLogo} alt="QuickTest" />
            Quick Test
          </a>
          <div className="w-full bg-white rounded-sm shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-4 sm:p-8">
              <h1 className="h1">{t("Forgot your password?")}</h1>
              <Formik
                initialValues={initialValues}
                validationSchema={SignInSchema}
                onSubmit={onSubmitHandler}
              >
                {() => {
                  return (
                    <Form className="mt-4 space-y-4 lg:mt-5 md:space-y-5" noValidate>
                      <div>
                        <FormikInput
                          type="email"
                          name="email"
                          label={t("Your email")}
                          placeholder={t("name@company.com")}
                        />
                      </div>
                      <div>
                        <Button
                          id="forgot-password"
                          loading={loading}
                          type="submit"
                          className={`${ButtonCSSStyles.btnPrimary} w-full`}
                        >
                          {t("Request Password Reset Instructions")}
                        </Button>
                      </div>
                      <p className="text-sm font-light text-gray-500 dark:text-gray-400 flex items-center justify-center">
                        <Link to={appRoutes.SIGNIN_PAGE}>
                          <span className="link ml-2">{t("Return back to Log in")}</span>
                        </Link>
                      </p>
                    </Form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Forgotpassword;
