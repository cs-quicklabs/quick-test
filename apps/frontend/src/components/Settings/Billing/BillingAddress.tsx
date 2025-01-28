import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { Formik, Form } from "formik";
import * as Yup from "yup";

import axiosService from "../../Utils/axios";
import { AppContext } from "../../Context/mainContext";
import { appRoutes } from "../../Utils/constants/page-routes";
import Button from "../../Button";
import CancelButton from "../../Button/cancelButton";
import { countryList } from "../../SignUp/countries";
import { ToastMessage } from "../../Utils/constants/misc";
import { FormikInput, FormikSelect } from "../../Common/FormikInput";
import Loader from "../../Loader/Loader";
import { showError, showSuccess } from "../../Toaster/ToasterFun";
import {
  validateRequiredAddress,
  validateRequiredCity,
  validateRequiredPostalCode,
  validateRequiredState,
  validateRequiredCountry,
} from "../../Utils/validators";

import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { RoleId, RoleName } from "../../Utils/constants/roles-permission";

const initialValue = {
  id: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  role: localStorage.getItem("role"),
};

const trimValue = (val: string) => {
  if (!val) return;

  return val
    ?.trim()
    ?.split(" ")
    ?.filter((v) => v)
    ?.join(" ");
};

const schema = Yup.object().shape({
  address1: Yup.string().when("role", ([role], schema) =>
    role === RoleName.OWNER ? validateRequiredAddress() : schema.optional()
  ),
  city: Yup.string().when("role", ([role], schema) =>
    role === RoleName.OWNER ? validateRequiredCity() : schema.optional()
  ),
  postalCode: Yup.string().when("role", ([role], schema) =>
    role === RoleName.OWNER ? validateRequiredPostalCode() : schema.optional()
  ),
  state: Yup.string().when("role", ([role], schema) =>
    role === RoleName.OWNER ? validateRequiredState() : schema.optional()
  ),
  country: Yup.string().when("role", ([role], schema) =>
    role === RoleName.OWNER ? validateRequiredCountry() : schema.optional()
  ),
});

export default function BillingAddress() {
  const { t } = useTranslation(["common"]);
  const [data, setData] = useState({ ...initialValue });

  const navigate = useNavigate();

  const [showLoader, setShowLoader] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [validation, setValidation] = useState(false);

  const { state, dispatch } = useContext(AppContext);

  const getProfileData = useCallback(() => {
    try {
      const response = state?.userDetails;
      setData({
        id: response?.id || "",
        address1: response?.address1 || "",
        address2: response?.address2 || "",
        city: response?.city || "",
        state: response?.state || "",
        country: response?.country || "",
        postalCode: response?.postalCode || "",
        role:
          response.roleId === RoleId.SUPERADMIN
            ? RoleName.SUPERADMIN
            : response.roleId === RoleId.OWNER
              ? RoleName.OWNER
              : response.roleId === RoleId.ADMIN
                ? RoleName.ADMIN
                : RoleName.MEMBER,
      });
      setShowLoader(false);
    } catch (err: any) {
      setShowLoader(false);
      if (err?.response?.data) {
        showError(err?.response?.data?.message);
        if (err?.response?.status === 401) {
          localStorage.clear();
          sessionStorage.clear();
          navigate("/");
        }
      } else showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
    }
  }, [navigate, state.userDetails]);

  const updateBillingAddress = async (value: typeof data) => {
    setApiLoading(true);

    const billingAddress = {
      address1: trimValue(value.address1),
      city: trimValue(value.city),
      state: trimValue(value.state),
      country: trimValue(value.country),
      postalCode: trimValue(value.postalCode),
    };

    if (value.address2)
      Object.assign(billingAddress, { address2: value.address2 });

    try {
      const response = await axiosService.put(
        `/users/${value.id}`,
        billingAddress
      );
      dispatch({
        type: "UPDATE_PROFILE_DATA",
        data: { ...state?.userDetails, ...value },
      });
      showSuccess(response?.data?.message);
      setApiLoading(false);
      getProfileData();
    } catch (err: any) {
      if (err?.response?.data) {
        showError(err?.response?.data?.message);
        if (err?.response?.status === 401) {
          localStorage.clear();
          sessionStorage.clear();
          navigate("/");
        }
      } else showError(ToastMessage.SOMETHING_WENT_WRONG);
      setApiLoading(false);
    }
  };

  useEffect(() => {
    getProfileData();
  }, [getProfileData]);

  return (
    <>
      <div className="pb-2  border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {t("Billing Address")}
        </h3>
      </div>

      {showLoader ? (
        <div className="flex justify-center items-center my-32">
          <Loader />
        </div>
      ) : (
        <Formik
          initialValues={data}
          validationSchema={schema}
          onSubmit={updateBillingAddress}
          enableReinitialize
        >
          {(formik) => {
            const { dirty, isValid } = formik;
            return (
              <Form className="space-y-6 mt-6 lg:w-3/4" autoComplete="off">
                <div className="space-y-6">
                  <div>
                    <FormikInput
                      type="text"
                      name="address1"
                      label={t("Address Line 1")}
                      validation={validation}
                    />
                  </div>

                  <div>
                    <FormikInput
                      type="text"
                      name="address2"
                      label={t("Address Line 2")}
                      validation={validation}
                    />
                  </div>

                  <div className="flex">
                    <div className="w-full mr-4">
                      <FormikInput
                        type="text"
                        name="city"
                        label={t("City")}
                        validation={validation}
                      />
                    </div>

                    <div className="w-full">
                      <FormikInput
                        type="text"
                        name="state"
                        label={t("State")}
                        validation={validation}
                      />
                    </div>
                  </div>

                  <div className="flex">
                    <div className="w-full mr-4">
                      <FormikInput
                        type="text"
                        name="postalCode"
                        label={t("Postal Code")}
                        validation={validation}
                      />
                    </div>

                    <div className="w-full">
                      <FormikSelect
                        type="text"
                        name="country"
                        label={t("Country")}
                        validation={validation}
                        optionsForSelect={[
                          { name: "Select Country", id: "default" },
                          ...countryList,
                        ]}
                        sendIdAsValue={false}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-end gap-4">
                    <CancelButton
                      onMouseDown={() => navigate(appRoutes.DASHBOARD)}
                      onClick={() => navigate(appRoutes.DASHBOARD)}
                      type="button"
                    >
                      {t("Cancel")}
                    </CancelButton>

                    <Button
                      id="update-profile"
                      onMouseDown={() => setValidation(true)}
                      loading={apiLoading === true ? "true" : undefined}
                      type="submit"
                      className={`sm:order-1 ${!dirty || !isValid
                          ? "cursor-not-allowed bg-indigo-600/50 hover:bg-indigo-600/50"
                          : ""
                        }`}
                    // disabled={!(dirty && isValid)}
                    >
                      {t("Update")}
                    </Button>
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
      )}
    </>
  );
}
