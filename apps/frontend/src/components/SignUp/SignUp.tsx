import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { appRoutes } from "../Utils/constants/page-routes";
import axiosService from "../Utils/axios";
import Button from "../Button";
import { FormikCheckbox, FormikInput } from "../Common/FormikInput";
import {
  validateRequiredEmail,
  validateRequiredFirstName,
  validateRequiredLastName,
  validateRequiredOrg,
} from "../Utils/validators";
import PopUp from "./Modal";
import { showError, showSuccess } from "../Toaster/Toast";
import { ButtonCSSStyles, ToastMessage } from "../Utils/constants/misc";
import { useFormSubmitWithLoading } from "../Utils/hooks/useFormSubmitWithLoading";
import { useTranslation } from "react-i18next";
import bugplotLogo from "../../assets/images/bugplot-logo.svg";
import {
  initialSignUpValues,
  SignUpFormValues,
} from "../Utils/interfaces/userObject";

const SignUp = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showModal, toggleModal] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      showSuccess(ToastMessage.ALREADY_LOGGED_IN);
      navigate(`${appRoutes.DASHBOARD}`);
    }
  }, [navigate]);

  const signUpSchema = Yup.object().shape({
    firstName: validateRequiredFirstName(),
    lastName: validateRequiredLastName(),
    email: validateRequiredEmail(),
    org: validateRequiredOrg(),
    password: Yup.string()
      .required(t("Password is required"))
      .min(8, t("Password is too short - should be 8 chars minimum")),
    cnfpassword: Yup.string()
      .oneOf([Yup.ref("password")], t("Both passwords need to be same"))
      .required(t("Confirm Password is required")),
    termAndCondition: Yup.bool().oneOf(
      [true],
      t("Please accept Terms of Use & Privacy Policy")
    ),
  });

  const popUpProps = {
    toggleModal,
    headline: t("Registration Successful!"),
    text: t(
      "You have successfully registered on QuickTest. A confirmation email has been sent to your inbox. Please verify your email to continue."
    ),
    buttonText: t("OK"),
    linkText: "signin",
    customCss: "w-12",
  };

  const signUp = async (userObj: any) => {
    try {
      const resp = await axiosService.post("/auth/register", userObj);
      if (resp && resp.status === 201) {
        toggleModal(true);
      }
    } catch (err) {
      showError(
        err?.response?.data?.message ||
        t("An error occurred, pleaase try again.")
      );
    }
  };

  const extractUserObj = (values: SignUpFormValues) => {
    const { firstName, lastName, email, password } = values;
    return { firstName, lastName, email, password };
  };

  const submitForm = async (values: SignUpFormValues) => {
    const userObj = extractUserObj(values);
    await signUp({ user: userObj, organization: values.org });
  };

  const { onSubmitHandler, loading } = useFormSubmitWithLoading(submitForm);
  const [validation, setValidation] = useState(false);

  function getTermsAndPrivacyLabel() {
    return `${t("I agree to")} 
      <a href='${process.env.REACT_APP_DOMAIN_LINK}/terms' class="font-medium text-primary-600 hover:underline" target="_blank" rel="noreferrer">
        ${t("Terms of Use")}
      </a> & 
      <a href='${process.env.REACT_APP_DOMAIN_LINK}/privacypolicy' class="font-medium text-primary-600 hover:underline" target="_blank" rel="noreferrer">
        ${t("Privacy Policy")}
      </a>`;
  }

  return (
    <>
      {showModal && <PopUp {...popUpProps} />}
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <a
            href="/quick-test"
            className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
          >
            <img className="w-8 h-8 mr-2" src={bugplotLogo} alt="QuickTest" />
            Quick Test
          </a>
          <div className="w-full bg-white rounded-sm shadow dark:border md:mt-0 sm:max-w-[512px] xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-4 sm:p-8">
              <h1 className="h1">{t("Create your account")}</h1>
              < Formik
                initialValues={initialSignUpValues}
                validationSchema={signUpSchema}
                onSubmit={onSubmitHandler}
              >
                {() => (
                  <Form className="space-y-4 md:space-y-4" action="#" method="POST" noValidate>
                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                      <div>
                        <FormikInput
                          type="text"
                          name="firstName"
                          label={t("First Name")}
                          placeholder={t("First name")}
                          validation={false}
                        />
                      </div>
                      <div>
                        <FormikInput
                          type="text"
                          name="lastName"
                          label={t("Last Name")}
                          placeholder={t("Last name")}
                          validation={false}
                        />
                      </div>
                    </div>

                    <div>
                      <FormikInput
                        type="email"
                        name="email"
                        label={t("Your email")}
                        placeholder={t("name@company.com")}
                        validation={false}
                      />
                    </div>

                    <div>
                      <FormikInput
                        type="text"
                        name="org"
                        label={t("Organization Name")}
                        placeholder={t("Company name")}
                        validation={false}
                      />
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-6">
                      <div>
                        <FormikInput
                          type="password"
                          name="password"
                          label={t("Password")}
                          placeholder={t("••••••••")}
                          validation={false}
                        />
                      </div>
                      <div>
                        <FormikInput
                          type="password"
                          name="cnfpassword"
                          label={t("Confirm Password")}
                          placeholder={t("••••••••")}
                          validation={false}
                        />
                      </div>
                    </div>

                    <div className="flex items-center h-5">
                      <FormikCheckbox
                        name="termAndCondition"
                        type="checkbox"
                        label={getTermsAndPrivacyLabel()}
                        validation={validation}
                      />
                    </div>
                    <Button
                      id="sign-up"
                      onMouseDown={() => setValidation(true)}
                      type="submit"
                      loading={loading}
                      className={`${ButtonCSSStyles.btnPrimary} btn-primary w-full mt-4`}
                    >
                      {t("Create an account")}
                    </Button>
                    <p className="text-sm font-light text-gray-500 dark:text-gray-400 flex justify-center items-center">
                      {t("Already have an account?")}{" "}
                      <Link to={appRoutes.SIGNIN_PAGE}>
                        <span className="link ml-2">{t("Login")}</span>
                      </Link>
                    </p>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SignUp;
