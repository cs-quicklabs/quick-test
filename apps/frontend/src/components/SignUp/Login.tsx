import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import { appRoutes } from "../Utils/constants/page-routes";
import axiosService from "../Utils/axios";
import Button from "../Button";
import { FormikCheckbox, FormikInput } from "../Common/FormikInput";
import { showError, showSuccess } from "../Toaster/Toast";
import {
  ButtonCSSStyles,
  SubscriptionStatus,
  ToastMessage,
  ValidatorMessage,
} from "../Utils/constants/misc";
import { useFormSubmitWithLoading } from "../Utils/hooks/useFormSubmitWithLoading";
import { AppContext } from "../Context/mainContext";
import { useTranslation } from "react-i18next";
import bugplotLogo from "../../assets/images/bugplot-logo.svg";
import {
  ILoginResponse,
  ISignInInputFieldProps,
  SignInInitialValues,
} from "../Utils/interfaces/userObject";

const SignIn = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const { dispatch } = useContext(AppContext);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      showSuccess(ToastMessage.ALREADY_LOGGED_IN);
      navigate(appRoutes.DASHBOARD);
    }
  }, [navigate]);

  const signInSchema = Yup.object().shape({
    email: Yup.string()
      .email(t(ValidatorMessage.EMAIL_NOT_VALID))
      .required(t(ValidatorMessage.EMAIL_REQ))
      .matches(
        /^([\w\-+]|(?<!\.)\.)+[a-z0-9]@[a-z]+\.[a-z]{2,64}$/,
        t(ValidatorMessage.EMAIL_NOT_VALID)
      ),
    password: Yup.string()
      .required(t(ValidatorMessage.PASS_REQ))
      .min(8, t(ValidatorMessage.PASS_MIN_LENGTH)),
  });

  async function doLogin(loginDetail: any) {
    const { remember_me = false, ...restLoginDetails } = loginDetail;
    try {
      const { data } = await axiosService.post("/auth/login", restLoginDetails);
      const { user, token, permissions } = data.data;
      setUserDataInLocalStorage(user, permissions);
      const storage = remember_me ? localStorage : sessionStorage;
      storage.setItem("token", token.accessToken);
      dispatchUserData(user);
      navigationAfterLoginSuccess(user);
    } catch (error) {
      showError(error.response?.data?.message);
      if (error.response?.status === 400) {
        localStorage.setItem("email", loginDetail?.email);
        navigate(appRoutes.VERIFY);
      }
    }
  }

  function dispatchUserData(userData: ILoginResponse) {
    dispatch({ type: "UPDATE_LOGIN_STATE", data: true });
    dispatch({ type: "UPDATE_PROFILE_DATA", data: userData });
  }

  function navigationAfterLoginSuccess(userData: ILoginResponse) {
    if (userData.subscriptionStatus === SubscriptionStatus.CANCELLED) {
      navigate(appRoutes.NOT_SUBSCRIBED, { replace: true });
    } else {
      navigate(appRoutes.DASHBOARD, { replace: true });
    }
  }

  function setUserDataInLocalStorage(
    userData: ILoginResponse,
    permissions: String[]
  ) {
    localStorage.setItem("allowedPermissions", JSON.stringify(permissions));
    localStorage.setItem("role", userData.role.roleType);
    localStorage.setItem("roleId", userData.role.id);
    localStorage.setItem("i18nextLng", userData.language);
    localStorage.setItem("firstLogin", JSON.stringify(true));
    i18n.changeLanguage(userData.language);
  }

  const submitForm = async (values: ISignInInputFieldProps) => {
    await doLogin(values);
  };

  const { onSubmitHandler, loading } = useFormSubmitWithLoading(submitForm);

  return (
    <>
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <a
            href="/quick-test"
            className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            <img
              className="w-8 h-8 mr-2"
              src={bugplotLogo}
              alt="QuickTest" />
            Quick Test
          </a>
          <div className="w-full bg-white rounded-sm shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-4 sm:p-8">
              <h1 className="h1">{t("Sign in to your account")}</h1>

              <Formik
                initialValues={SignInInitialValues}
                validationSchema={signInSchema}
                onSubmit={onSubmitHandler}
              >
                {() => {
                  return (
                    <Form className="space-y-4 md:space-y-4" noValidate autoComplete="off">
                      <div>
                        <FormikInput
                          type="email"
                          name="email"
                          label={t("Your email")}
                          placeholder={t("name@company.com")}
                        />
                      </div>

                      <div>
                        <FormikInput
                          type="password"
                          name="password"
                          label={t("Password")}
                          placeholder={t("••••••••")}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <FormikCheckbox
                              type="checkbox"
                              name="remember_me"
                              label={t("Remember me")}
                            />
                          </div>
                        </div>
                        <Link
                          className="link"
                          to={appRoutes.FORGOT_PASSWORD}
                        >
                          {t("Forgot password?")}
                        </Link>
                      </div>
                      <Button
                        id="login-submit"
                        type="submit"
                        loading={loading}
                        className={`${ButtonCSSStyles.btnPrimary} w-full mt-4`}
                      >
                        {t("Sign in")}
                      </Button>
                    </Form>
                  );
                }}
              </Formik>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="text-sm font-light text-gray-500 dark:text-gray-400 flex items-center justify-center">
                      {t("Don’t have an account yet?")}{" "}
                      <Link to={appRoutes.SIGNUP_PAGE}>
                        <span className="link ml-2">{t("Sign up")}</span>
                      </Link>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >
    </>
  );
};

export default SignIn;
