import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { Formik, Form } from "formik";
import * as Yup from "yup";

import axiosService from "../Utils/axios";
import { AppContext } from "../Context/mainContext";
import { appRoutes } from "../Utils/constants/page-routes";
import Button from "../Button";
import CancelButton from "../Button/cancelButton";
import defaultProfilePicture from "../../assets/images/profile.png";
import { ToastMessage, LanguageList } from "../Utils/constants/misc";
import { FormikInput, FormikSelect } from "../Common/FormikInput";
import Loader from "../Loader/Loader";
import { showError, showSuccess } from "../Toaster/ToasterFun";
import {
  validateRequiredFirstName,
  validateRequiredLastName,
  validateRequiredOrg,
} from "../Utils/validators";

import ProfileImageDesktop from "./components/ProfileImageDesktop";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { RoleId, RoleName } from "../Utils/constants/roles-permission";

const initialValue = {
  firstName: "",
  lastName: "",
  email: "",
  organization: "",
  id: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  language: "",
  role: localStorage.getItem("role"),
};

interface IUserData {
  user: {
    firstName: string;
    lastName: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    language: string;
    role?: string;
  };
  organization: string;
}

export default function UpdateProfile() {
  const { i18n, t } = useTranslation();
  const [data, setData] = useState({ ...initialValue });

  const navigate = useNavigate();

  const [showLoader, setShowLoader] = useState(true);
  const [apiloading, setApiLoading] = useState(false);
  const [validation, setValidation] = useState(false);

  const [imageURL, setImageURL] = useState<string>("");

  const [showProgressBar, setShowProgressBar] = useState(false);

  const { state, dispatch } = useContext(AppContext);

  const schema = Yup.object().shape({
    firstName: validateRequiredFirstName(),
    lastName: validateRequiredLastName(),
    organization: validateRequiredOrg(),
  });

  const getProfileData = useCallback(() => {
    try {
      const response = state.userDetails;
      setData({
        firstName: response.firstName || "",
        lastName: response.lastName || "",
        email: response.email || "",
        organization: response.organization || "",
        id: response.id || "",
        address1: response.address1 || "",
        address2: response.address2 || "",
        city: response.city || "",
        state: response.state || "",
        country: response.country || "",
        postalCode: response.postalCode || "",
        language: response.language || "en",
        role:
          response.roleId === RoleId.SUPERADMIN
            ? RoleName.SUPERADMIN
            : response.roleId === RoleId.OWNER
              ? RoleName.OWNER
              : response.roleId === RoleId.ADMIN
                ? RoleName.ADMIN
                : RoleName.MEMBER,
      });
      setImageURL(response.profileImage || "");
      setShowLoader(false);
    } catch (err: any) {
      setShowLoader(false);
      if (err.response && err.response.data) {
        showError(err.response.data.message);
        if (err.response.status === 401) {
          localStorage.clear();
          sessionStorage.clear();
          navigate("/");
        }
      } else showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
    }
  }, [navigate, state.userDetails]);

  const handleImageUpload = useCallback(
    async (event: any) => {
      const file = event.target.files[0];
      if (file?.type === "image/jpeg" || file?.type === "image/png") {
        setImageURL(URL.createObjectURL(file));
        const fileData = new FormData();
        fileData.append("file", file);
        try {
          setShowProgressBar(true);
          const response = await axiosService.post(
            "users/profile-picture",
            fileData
          );
          dispatch({ type: "UPDATE_PROFILE_DATA", data: response?.data?.data });
          dispatch({ type: "UPDATE_PROFILE_PICTURE", data: true });
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          response?.data.success ? setShowProgressBar(false) : null;
          showSuccess(response.data.message);
          getProfileData();
        } catch (error) {
          setShowProgressBar(false);
          showError(error.response.data.message);
        }
      } else showError(i18next.t(ToastMessage.IMAGE_FILE_TYPE));
    },
    [dispatch, getProfileData]
  );

  useEffect(() => {
    if (state.profilePicUpdated === true)
      dispatch({
        type: "UPDATE_PROFILE_PICTURE",
        data: false,
      });
  }, [dispatch, state.profilePicUpdated]);

  const updateProfileData = async (value: typeof data) => {
    setApiLoading(true);

    let userData: IUserData = {
      user: {
        firstName: value.firstName.trim(),
        lastName: value.lastName.trim(),
        language: value.language,
      },
      organization: value.organization,
    };
    if (value.role === RoleName.OWNER) {
      const billingAddress = {
        address1: value.address1,
        city: value.city,
        state: value.state,
        country: value.country.trim(),
        postalCode: value.postalCode.trim(),
      };

      if (value.address2)
        Object.assign(billingAddress, { address2: value.address2 });

      Object.assign(userData.user, billingAddress);
    }

    try {
      localStorage.setItem("i18nextLng", value.language);
      const response = await axiosService.put(`/users/${value.id}`, userData);
      dispatch({
        type: "UPDATE_PROFILE_DATA",
        data: { ...state?.userDetails, ...value },
      });
      showSuccess(response.data.message);
      setApiLoading(false);
      await getProfileData();
      i18n.changeLanguage(value.language);
    } catch (err: any) {
      if (err.response && err.response.data) {
        showError(err.response.data.message);
        if (err.response.status === 401) {
          localStorage.clear();
          sessionStorage.clear();
          navigate("/");
        }
      } else showError(ToastMessage.SOMETHING_WENT_WRONG);
      setApiLoading(false);
    }
  };

  useEffect(() => {
    if (data.firstName !== initialValue.firstName) {
      dispatch({ type: "UPDATE_LOADING_STATE", data: false });
    }
  }, [data, dispatch]);

  useEffect(() => {
    getProfileData();
  }, [getProfileData]);

  return state.contextLoading || showLoader ? (
    <div className="flex justify-center items-center my-32">
      <Loader />
    </div>
  ) : (
    <Formik
      initialValues={data}
      validationSchema={schema}
      onSubmit={updateProfileData}
      enableReinitialize
    >
      {(formik) => {
        const { dirty, values, isValid } = formik;
        return (
          <main className="max-w-7xl mx-auto lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">

              <main className="max-w-xl pb-12 px-4 lg:col-span-6">
                <div className="mt-0">
                  <h1 className="form-title">{t("Profile Settings")}</h1>
                  <p className="form-subtitle">{t("Change your personal profile settings")}</p>

                  <Form className="w-full mt-6 space-y-4" autoComplete="off">
                    <div className="sm:col-span-2">
                      <label className="form-input-label" htmlFor="file_input">
                        {t("Upload avatar")}
                      </label>
                      <div className="items-center w-20 h-20 sm:flex my-2">
                        <ProfileImageDesktop
                          profileImage={imageURL || defaultProfilePicture}
                          handleImageUpload={handleImageUpload}
                          showProgressBar={showProgressBar}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-4">
                      <div>
                        <FormikInput
                          type="text"
                          name="firstName"
                          label={t("First Name")}
                          placeholder={t("First name")}
                          validation={validation}
                        />
                      </div>
                      <div>
                        <FormikInput
                          type="text"
                          name="lastName"
                          label={t("Last Name")}
                          placeholder={t("Last name")}
                          validation={validation}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <FormikInput
                        type="email"
                        name="email"
                        label={t("Email")}
                        placeholder={t("email@gmail.com")}
                        disabled
                      />
                    </div>

                    <div className="mb-4">
                      <FormikInput
                        type="text"
                        name="organization"
                        label={t("Organization Name")}
                        placeholder={t("Crownstack")}
                        validation={validation}
                        disabled={values.role === RoleName.OWNER ? false : true}
                      />
                    </div>

                    <div>
                      <FormikSelect
                        name="language"
                        label={t("Select Language")}
                        optionsForSelect={LanguageList}
                        sendIdAsValue={true}
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
                        id="update-profile"
                        onMouseDown={() => setValidation(true)}
                        loading={apiloading === true ? "true" : undefined}
                        type="submit"
                        className={`btn-primary ${!dirty || !isValid ? "opacity-80" : ""
                          }`}
                        disabled={!(dirty && isValid)}
                      >
                        {t("Save")}
                      </Button>
                    </div>
                  </Form>
                </div>
              </main>
            </div>
          </main>
        );
      }}
    </Formik >
  );
}
