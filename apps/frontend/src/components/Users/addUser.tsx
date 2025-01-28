import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { titleSchema } from "../Utils/validators";
import { Formik, Form, FormikValues } from "formik";
import * as Yup from "yup";

import { appRoutes, settingsRoutes } from "../Utils/constants/page-routes";
import axiosService from "../Utils/axios";
import Button from "../Button";
import { ToastMessage, ValidatorMessage } from "../Utils/constants/misc";
import { FormikInput, FormikSelect } from "../Common/FormikInput";
import Loader from "../Loader/Loader";
import { showError } from "../Toaster/ToasterFun";

import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { RoleId } from "../Utils/constants/roles-permission";

interface InitVal {
  firstName: string;
  lastName: string;
  email: string | undefined;
  roleId: number;
  title: string;
  userId: string;
}

interface RoleListData {
  id: number;
  name: string;
}

const AddUser = () => {
  const params = useParams();
  const initialValues: InitVal = {
    firstName: "",
    lastName: "",
    email: "",
    roleId: RoleId.MEMBER,
    title: "",
    userId: params?.id ?? "",
  };

  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [initValues, setInitValues] = useState({ ...initialValues });
  const [apiloading, setApiLoading] = useState(false);
  const [validation, setValidation] = useState(false);
  const [roleList, setRoleList] = useState<RoleListData[]>([]);
  const [userRoleId, setUserRoleId] = useState<number>(RoleId.MEMBER);
  const AddProjectSchema = Yup.object().shape({
    firstName: Yup.string()
      .trim()
      .required(t(ValidatorMessage.FIRST_NAME_REQ))
      .max(32, t(ValidatorMessage.FIRST_NAME_MAX_LENGTH))
      .min(2, t(ValidatorMessage.FIRST_NAME_MIN_LENGTH))
      .matches(/^\S*$/, t(ValidatorMessage.FIRST_NAME_NOT_VALID))
      .matches(
        /^(?=)[a-zA-Z æøåÆØÅ]+(?:[-' ][a-zA-Z æøåÆØÅ]+)*$/,
        t(ValidatorMessage.FIRST_NAME_NOT_VALID)
      ),
    lastName: Yup.string()
      .trim()
      .required(t(ValidatorMessage.LAST_NAME_REQ))
      .max(32, t(ValidatorMessage.LAST_NAME_MAX_LENGTH))
      .min(2, t(ValidatorMessage.LAST_NAME_MIN_LENGTH))
      .matches(/^\S*$/, t(ValidatorMessage.LAST_NAME_NOT_VALID))
      .matches(
        /^(?=)[a-zA-Z æøåÆØÅ]+(?:[-' ][a-zA-Z æøåÆØÅ]+)*$/,
        t(ValidatorMessage.LAST_NAME_NOT_VALID)
      ),
    email: Yup.string()
      .email(t(ValidatorMessage.EMAIL_NOT_VALID))
      .required(t(ValidatorMessage.EMAIL_REQ))
      .matches(
        /^([\w\-+]|(?<!\.)\.)+[a-z0-9]@[a-z]+\.[a-z]{2,64}$/,
        t(ValidatorMessage.EMAIL_NOT_VALID)
      ),
    title: Yup.string().when("userId", ([userId], schema) =>
      userId ? titleSchema() : schema.optional()
    ),
  });

  useEffect(() => {
    if (localStorage.getItem("roleId")) {
      setUserRoleId(JSON.parse(localStorage.getItem("roleId") || ""));
    }
  }, []);

  const getMemberData = async (id: string) => {
    try {
      const userData = await axiosService.get("/users/" + id);
      if (userData?.data?.data) {
        if (!userData.data.data.role)
          setInitValues({
            firstName: userData.data.data.firstName,
            lastName: userData.data.data.lastName || "",
            email: userData.data.data.email,
            title: userData.data.data.title,
            userId: id,
            roleId: userData.data.data.roleId,
          });
        setLoading(false);
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      getMemberData(params.id);
    }
  }, [params]);

  useEffect(() => {
    if (initValues.roleId < userRoleId) {
      navigate(`${appRoutes.SETTINGS}/${settingsRoutes.USERS}`);
    }
  });

  const getRoleList = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axiosService.get("/roles/role");
      if (resp?.data?.data) {
        const respArray = resp.data.data;
        let tempArray: RoleListData[] = [];
        respArray.map(
          (obj: any) =>
            (tempArray = [...tempArray, { id: obj.id, name: obj.roleType }])
        );
        setRoleList(tempArray);
      }
    } catch (err) {
      // err.message && console.log(err?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getRoleList();
  }, [getRoleList]);

  const submitFormAddUser = async (values: InitVal, action: FormikValues) => {
    setApiLoading(true);
    try {
      if (params?.id) {
        let newValues = { ...values };
        newValues.roleId = +values.roleId;
        if (initValues.email === values.email) {
          delete newValues.email;
        }
        await axiosService.put(`/organizations/members/${params.id}`, {
          ...newValues,
        });
        navigate(`${appRoutes.SETTINGS}/${settingsRoutes.USERS}`);
      } else {
        const payload = {
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          roleId: +values.roleId,
        };
        await axiosService.post("/organizations/members", payload);
        navigate(`${appRoutes.SETTINGS}/${settingsRoutes.USERS}`);
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
      }
    } finally {
      action.setSubmitting(false);
      setApiLoading(false);
    }
  };

  if (loading) {
    return <Loader withoverlay={true} />;
  }

  return (
    <>
      <div className="flex items-center justify-center px-6 mt-8 sm:mt-10 sm:mx-4 md:mx-20 lg:mx-4  xl:mx-24  ">
        <div className=" w-full sm:w-2/3 md:w-2/3 lg:w-2/4 xl:w-1/3 ">
          <Formik
            initialValues={initValues}
            validationSchema={AddProjectSchema}
            onSubmit={submitFormAddUser}
            enableReinitialize
          >
            {(formik) => {
              const { dirty } = formik;
              return (
                <Form className="space-y-6" noValidate autoComplete="off">
                  <div>
                    <label className="block text-lg font-medium text-gray-900">
                      {params?.id ? t("Edit User Details") : t("Add New User")}
                    </label>
                    <p className="block text-sm font-normal text-gray-500">
                      {params?.id
                        ? t("Please update the details of user")
                        : t("Please fill in details for new user.")}
                    </p>
                  </div>
                  <div>
                    <FormikInput
                      type="text"
                      name="firstName"
                      label={t("First Name")}
                      validation={validation}
                    />
                  </div>
                  <div>
                    <FormikInput
                      type="text"
                      name="lastName"
                      label={t("Last Name")}
                      validation={validation}
                    />
                  </div>
                  <div>
                    <FormikInput
                      type="text"
                      name="email"
                      label={t("Email")}
                      disabled={params?.id ? true : false}
                      validation={validation}
                    />
                  </div>
                  {params?.id ? (
                    <div>
                      <FormikInput
                        type="text"
                        name="title"
                        label={t("Title")}
                        validation={validation}
                      />
                    </div>
                  ) : (
                    ""
                  )}
                  {((params?.id &&
                    (userRoleId === RoleId.OWNER ||
                      userRoleId === RoleId.SUPERADMIN)) ||
                    !params?.id) && (
                      <div>
                        <FormikSelect
                          name="roleId"
                          label={t("Role")}
                          validation={validation}
                          sendIdAsValue={true}
                          optionsForSelect={roleList}
                        />
                      </div>
                    )}
                  <div className="flex justify-end gap-4">
                    <button
                      onMouseUp={() => navigate(-1)}
                      type="button"
                      className="inline-flex items-center rounded border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                    >
                      {t("Cancel")}
                    </button>
                    <Button
                      id="add-user-submit"
                      onMouseDown={() => setValidation(true)}
                      loading={apiloading}
                      type="submit"
                      className={`sm:order-1  ${params?.id && !dirty
                          ? "cursor-not-allowed bg-indigo-600/50 hover:bg-indigo-600/50"
                          : ""
                        }`}
                      disabled={params?.id && !dirty ? true : false}
                    >
                      {t("Confirm")}
                    </Button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default AddUser;
