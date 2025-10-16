import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Formik, Form } from "formik";
import * as Yup from "yup";

import axiosService from "../Utils/axios";
import Button from "../Button";
import { ButtonCSSStyles, ToastMessage, ValidatorMessage } from "../Utils/constants/misc";
import { FormikInput } from "../Common/FormikInput";
import { showError, showSuccess } from "../Toaster/Toast";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

const initialValue = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function UpdateProfile() {
  const { t } = useTranslation();
  const [apiloading, setApiLoading] = useState(false);
  const [validation, setValidation] = useState(false);

  const navigate = useNavigate();

  const schema = Yup.object().shape({
    oldPassword: Yup.string()
      .min(8, t(ValidatorMessage.PASS_MIN_LENGTH))
      .required(t(ValidatorMessage.OLD_PASS_REQ)),
    newPassword: Yup.string()
      .required(t(ValidatorMessage.NEW_PASS_REQ))
      .min(8, t(ValidatorMessage.PASS_MIN_LENGTH))
      .notOneOf(
        [Yup.ref("oldPassword")],
        t(ValidatorMessage.OLD_AND_NEW_PASS_CANNOT_SAME)
      ),
    confirmPassword: Yup.string()
      .required(t(ValidatorMessage.CONFIRM_PASS_REQ))
      .oneOf([Yup.ref("newPassword")], t(ValidatorMessage.BOTH_PASS_SAME)),
  });

  const updatePassword = async (
    value: typeof initialValue,
    { resetForm }: any
  ) => {
    setApiLoading(true);
    try {
      const { oldPassword, newPassword } = value;
      const userData = { oldPassword, newPassword };
      const response = await axiosService.put(
        "/users/update-password",
        userData
      );
      showSuccess(response.data.message);
      resetForm({ ...initialValue });
      setApiLoading(false);
    } catch (err) {
      if (err.response && err.response.data) {
        showError(err.response.data.message);
        if (err.response.status === 401) {
          localStorage.clear();
          sessionStorage.clear();
          navigate("/");
        }
      } else showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
      setApiLoading(false);
    }
  };

  return (
    <Formik
      initialValues={initialValue}
      validationSchema={schema}
      onSubmit={updatePassword}
    >
      {(formik) => {
        const { dirty } = formik;
        return (
          <div className="max-w-xl">
            <h1 className="form-title">{t("Change Password")}</h1>
            <p className="form-subtitle">{t("Setup a new password for your account")}</p>

            <Form
              className="w-full mt-6 space-y-4"
              autoComplete="off"
            >
              <div>
                <FormikInput
                  type="password"
                  name="oldPassword"
                  label={t("Old Password")}
                  validation={validation}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <FormikInput
                  type="password"
                  name="newPassword"
                  label={t("New Password")}
                  validation={validation}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <FormikInput
                  type="password"
                  name="confirmPassword"
                  label={t("Confirm Password")}
                  validation={validation}
                  placeholder="••••••••"
                />
              </div>
              <Button
                id="change-password"
                onMouseDown={() => setValidation(true)}
                loading={apiloading === true ? "true" : undefined}
                type="submit"
                className={ButtonCSSStyles.btnPrimary}
                disabled={!dirty}
              >
                {t("Save")}
              </Button>
            </Form>
          </div>
        );
      }}
    </Formik >
  );
}
