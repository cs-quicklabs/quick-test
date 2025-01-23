import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import { appRoutes } from "../Utils/constants/page-routes";
import axiosService from "../Utils/axios";
import Button from "../Button";
import { FormikCheckbox, RenderFormikInputs } from "../Common/FormikInput";
import { showError, showSuccess } from "../Toaster/ToasterFun";
import {
  SubscriptionStatus,
  ToastMessage,
  ValidatorMessage,
} from "../Utils/constants/misc";
import { useFormSubmitWithLoading } from "../Utils/hooks/useFormSubmitWithLoading";
import { AppContext } from "../Context/mainContext";
import { useTranslation } from "react-i18next";
import bugplotLogo from "../../assets/images/bugplot-logo.svg";
import { ILoginResponse, ISignInInputFieldProps, SignInInitialValues } from "../Utils/interfaces/userObject";

const SignIn = () => {
  const { i18n, t } = useTranslation(["common"]);
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
    const { remember_me = false } = loginDetail;
    delete loginDetail.remember_me;
    try {
      const userData = await axiosService.post("/auth/login", loginDetail);
      const { user, token, permissions } = userData.data.data;
      setUserDataInLocalStorage(user, permissions);
      remember_me && localStorage.setItem("token", token.accessToken);
      dispatchUserData(user);
      navigationAfterLoginSuccess(user);
    } catch (error) {
      if (error.response?.status === 400) {
        showError(error.response?.data?.message);
        localStorage.setItem("email", loginDetail?.email);
        navigate(appRoutes.VERIFY);
      } else showError(error.response?.data?.message);
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

  function setUserDataInLocalStorage(userData: ILoginResponse, permissions: String[]) {
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
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <span onMouseDown={() => navigate("/")} className="cursor-pointer">
            <img
              className="mx-auto h-12 w-auto"
              src={bugplotLogo}
              alt="QuickTest"
              loading="eager"
              title="Quick Test Logo"
              width={48}
              height={48}
            />
          </span>
          <h2 className="mt-6 text-center text-xl 2xl:text-3xl font-extrabold text-gray-900">
            {t("Sign in to your account")}
          </h2>
        </div>
        <div className="mt-8 ml-3 mr-3 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <Formik
              initialValues={SignInInitialValues}
              validationSchema={signInSchema}
              onSubmit={onSubmitHandler}
            >
              {() => {
                return (
                  <Form className="space-y-6" noValidate autoComplete="off">

                    {RenderFormikInputs([
                      { type: "email", name: "email", label: t("Email Address") },
                      { type: "password", name: "password", label: t("Password") }
                    ])}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FormikCheckbox
                          type="checkbox"
                          name="remember_me"
                          label={t("Remember Me")}
                        />
                      </div>
                      <div className="text-sm">
                        <Link
                          className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
                          to={appRoutes.FORGOT_PASSWORD}
                        >
                          {t("Forgot password?")}
                        </Link>
                      </div>
                    </div>
                    <div>
                      <Button
                        id="login-submit"
                        type="submit"
                        loading={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none`}
                      >
                        {t("Sign in")}
                      </Button>
                    </div>
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
                  <span className="px-2 bg-white text-gray-500">
                    {t("Don't have an account?")}{" "}
                    <Link to={appRoutes.SIGNUP_PAGE}>
                      <span className="font-medium text-indigo-600 hover:text-indigo-500">
                        {t("Sign up")}
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

export default SignIn;
