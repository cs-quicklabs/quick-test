import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Formik, Form } from "formik";
import * as Yup from "yup";

import axiosService from "../Utils/axios";
import { appRoutes } from "../Utils/constants/page-routes";
import Button from "../Button";
import CancelButton from "../Button/cancelButton";
import { ToastMessage, ValidatorMessage } from "../Utils/constants/misc";
import { FormikInput } from "../Common/FormikInput";
import { showError, showSuccess } from "../Toaster/ToasterFun";
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
          <Form
            className="max-w-full lg:max-w-3xl space-y-6"
            autoComplete="off"
          >
            <div className="border-gray-300">
              <h1 className="text-base leading-6 font-medium text-gray-900">
                {t("Change Password")}
              </h1>
              <h1 className="mt-1 text-sm leading-6 text-gray-600">
                {t("Change your old password and a set a new one")}
              </h1>
            </div>
            <div>
              <FormikInput
                type="password"
                name="oldPassword"
                label={t("Old Password")}
                validation={validation}
              />
            </div>
            <div>
              <FormikInput
                type="password"
                name="newPassword"
                label={t("New Password")}
                validation={validation}
              />
            </div>
            <div>
              <FormikInput
                type="password"
                name="confirmPassword"
                label={t("Confirm Password")}
                validation={validation}
              />
            </div>
            <div className="flex justify-end gap-4">
              <CancelButton
                onMouseDown={() => navigate(appRoutes.DASHBOARD)}
                onClick={() => navigate(appRoutes.DASHBOARD)}
                type="button"
              >
                {t("Cancel")}
              </CancelButton>
              <Button
                id="change-password"
                onMouseDown={() => setValidation(true)}
                loading={apiloading === true ? "true" : undefined}
                type="submit"
                className={`sm:order-1 ${!dirty
                  ? "cursor-not-allowed bg-indigo-600/50 hover:bg-indigo-600/50"
                  : ""
                  }`}
                disabled={!dirty}
              >
                {t("Update")}
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
