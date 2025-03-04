import { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import { Formik, Form, FormikValues } from "formik";
import * as Yup from "yup";

import axiosService from "../Utils/axios";
import { appRoutes, projectRoutes } from "../Utils/constants/page-routes";
import { ToastMessage } from "../Utils/constants/misc";
import { FormikInput, FormikTextArea } from "../Common/FormikInput";
import { FormSubmitPanel } from "../Common/FormSubmitPanel";
import Loader from "../Loader/Loader";
import { showError } from "../Toaster/ToasterFun";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

const AddProject = ({ onSubmit, setApiEndPoint }: any) => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const addProjectSchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .max(32, t("Name should be maximum 32 characters"))
      .required(t("Project Name is required")),
  });
  interface InitVal {
    name: string | string[] | undefined;
    description?: string | string[] | undefined;
  }
  const initialValues: InitVal = {
    name: "",
    description: "",
  };
  const [initValues, setInitValues] = useState(initialValues);
  const [loading, setLoading] = useState(
    location?.pathname === appRoutes.CREATE_PROJECT ? false : true
  );
  const [apiloading, setApiLoading] = useState(false);
  const pathName = location.pathname.split("/")[1];

  const submitFormAddProject = async (
    values: InitVal,
    action: FormikValues
  ) => {
    setApiLoading(true);
    if (onSubmit) {
      onSubmit(values);
    }

    try {
      if (params.pid) {
        if (setApiEndPoint) {
          setApiEndPoint(`/projects/${params.pid}`, values);
        }
        const newValues = { ...values };
        if (initValues.name === values.name) {
          delete newValues.name;
        }
        const data = { project: { ...newValues } };
        await axiosService.put(`/projects/${params.pid}`, data);
      } else {
        if (!values.description) {
          delete values.description;
        }
        if (setApiEndPoint) {
          setApiEndPoint(`/projects`, values);
        }
        await axiosService.post("/projects", values);
      }
      if (pathName !== "edit-project") {
        await axiosService
          .get(`/organizations/projects`)
          .then((response) =>
            navigate(
              `${appRoutes.PROJECTS}/${response?.data.data[0].id}/${projectRoutes.OVERVIEW}`
            )
          );
      } else {
        navigate(appRoutes.DASHBOARD);
      }
    } catch (error) {
      if (error?.response?.data) {
        showError(error?.response?.data?.message);
      } else {
        showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
      }
    } finally {
      action.setSubmitting(false);
      setApiLoading(false);
    }
  };

  const getProjectData = useCallback(
    async (id: string | string[]) => {
      try {
        if (setApiEndPoint) {
          setApiEndPoint(`/projects/${id}`);
        }
        const projectData = await axiosService.get(`/projects/${id}`);
        setInitValues({
          name: projectData.data.data.name || "",
          description: projectData.data.data.description || "",
        });

        setLoading(false);
      } catch (error) {
        if (error?.response?.data?.message) {
          showError(error.response.data.message);
        } else {
          showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
        }
        setLoading(false);
      }
    },
    [setApiEndPoint]
  );

  useEffect(() => {
    if (params.pid) {
      getProjectData(params.pid);
    }
  }, [getProjectData, params]);
  const returnToMainPage = () => {
    navigate(-1);
  };

  return (
    <>
      {loading ? (
        <Loader withoverlay={true} />
      ) : (
        <div className="flex items-center justify-center mt-12 sm:mx-4 md:mx-20 lg:mx-4  xl:mx-24 ">
          <div className="w-full mx-6 sm:mx-8 md:w-2/3 lg:w-2/4 xl:w-1/3 ">
            <Formik
              initialValues={initValues}
              validationSchema={addProjectSchema}
              onSubmit={submitFormAddProject}
              enableReinitialize
            >
              {(formik) => {
                const { dirty } = formik;
                return (
                  <Form className="space-y-6" noValidate autoComplete="off">
                    <div>
                      <label htmlFor="name" className="block text-base font-medium text-gray-900">
                        {params.pid
                          ? t("Edit Project Details")
                          : t("Create New Project")}
                      </label>
                      <p className="block text-sm font-normal text-gray-500">
                        {params.pid
                          ? t("Please edit details of your project")
                          : t("Please fill in details of your new project.")}
                      </p>
                    </div>
                    <div>
                      <FormikInput
                        type="text"
                        name="name"
                        label={t("Project Name")}
                        datatest-id="manner-input"
                      />
                    </div>
                    <div>
                      <FormikTextArea
                        placeholder="Description max size can be 500"
                        type="text"
                        name="description"
                        label={t("Description")}
                        isOptional
                      />
                    </div>
                    <FormSubmitPanel
                      idForSubmit="project-create-edit"
                      onCancel={returnToMainPage}
                      loading={apiloading}
                      validSubmit={params.pid && !dirty ? true : false}
                      submitTitle={
                        params.pid ? t("Edit Project") : t("Create Project")
                      }
                    />
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      )}
    </>
  );
};

export default AddProject;
