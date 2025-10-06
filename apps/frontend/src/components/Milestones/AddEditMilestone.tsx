import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ValidatorMessage } from "../Utils/constants/misc";

import { Formik, Form } from "formik";
import * as Yup from "yup";

import axiosService from "../Utils/axios";
import { appRoutes, projectRoutes } from "../Utils/constants/page-routes";
import {
  FormikInput,
  FormikTextArea,
  FormikInputDateField,
} from "../Common/FormikInput";
import { FormSubmitPanel } from "../Common/FormSubmitPanel";
import Loader from "../Loader/Loader";
import { showError } from "../Toaster/Toast";
import { ToastMessage } from "../Utils/constants/misc";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
interface PropsType {
  editMilestone?: boolean;
}

const AddEditMilestone = ({ editMilestone }: PropsType) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();

  const addMilestoneSchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .max(32, t(ValidatorMessage.NAME_MAX_LENGTH))
      .required(t(ValidatorMessage.NAME_REQUIRED)),
    description: Yup.string()
      .trim()
      .required(t(ValidatorMessage.DESCRIPTION_REQ)),
    startDate: Yup.string().trim().required(t(ValidatorMessage.START_DATE_REQ)),
    endDate: Yup.string().trim().required(t(ValidatorMessage.END_DATE_REQ)),
  });

  const [apiloading, setApiLoading] = useState(false);
  const [validation, setValidation] = useState(false);
  const [showLoader, setShowLoader] = useState(editMilestone ? true : false);

  const [initialValues, setInitialValues] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const getMilestoneDetails = useCallback(async () => {
    try {
      const response = await axiosService.get(`/milestones/${params?.id}`);

      setInitialValues({
        ...response.data.data,
        endDate: new Date(response.data.data.endDate),
        startDate: new Date(response.data.data.startDate),
      });

      setShowLoader(false);
    } catch (err) {
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
  }, [navigate, params?.id]);

  useEffect(() => {
    if (editMilestone && params?.id) {
      getMilestoneDetails();
    }
  }, [params.pid, params?.id, editMilestone, getMilestoneDetails]);

  const returnToMainPage = () =>
    navigate(`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.MILESTONES}`);

  const submitFormAddMilestone = async (value: typeof initialValues) => {
    setApiLoading(true);
    try {
      const url = editMilestone
        ? `/milestones/${params?.id}`
        : `/projects/${params?.pid}/milestone`;

      const method = editMilestone ? "put" : "post";

      await axiosService[method](url, value);

      navigate(
        `${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.MILESTONES}`
      );
    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.data.message) showError(err?.response?.data?.message);
      } else showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
      setApiLoading(false);
    }
  };

  return showLoader ? (
    <Loader withoverlay={true} />
  ) : (
    <>
      <div className="flex items-center justify-center mt-12 sm:mx-4 md:mx-20 lg:mx-4  xl:mx-24 ">
        <div className="sm:w-2/3 w-full mx-6 md:w-2/3 lg:w-2/4 xl:w-1/3">
          <Formik
            initialValues={initialValues}
            validationSchema={addMilestoneSchema}
            onSubmit={submitFormAddMilestone}
            enableReinitialize
          >
            {(formik) => {
              const { dirty, values } = formik;
              return (
                <Form className="space-y-6" autoComplete="off">
                  <div>
                    <h1 className="text-lg leading-6 font-medium text-gray-900">
                      {editMilestone
                        ? t("Edit Milestone")
                        : t("Create New Milestone")}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                      {editMilestone
                        ? t("Please update details of your milestone.")
                        : t("Please fill in details of your new milestone.")}
                    </p>
                  </div>

                  <div>
                    <FormikInput
                      type="text"
                      name="name"
                      label={t("Name")}
                      validation={validation}
                    />
                  </div>

                  {!editMilestone ? (
                    <>
                      <div>
                        <FormikInputDateField
                          type="date"
                          name="startDate"
                          label={t("Start Date")}
                          validation={validation}
                          minDate={new Date()}
                          maxDate={
                            values.endDate
                              ? new Date(values.endDate)
                              : undefined
                          }
                        />
                      </div>

                      <div>
                        <FormikInputDateField
                          type="date"
                          name="endDate"
                          label={t("End Date")}
                          validation={validation}
                          minDate={
                            values.startDate
                              ? new Date(values.startDate)
                              : new Date()
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <FormikInputDateField
                          type="date"
                          name="startDate"
                          label={t("Start Date")}
                          validation={validation}
                          minDate={new Date(initialValues.startDate)}
                          maxDate={
                            values.endDate
                              ? new Date(values.endDate)
                              : undefined
                          }
                        />
                      </div>

                      <div>
                        <FormikInputDateField
                          type="date"
                          name="endDate"
                          label={t("End Date")}
                          validation={validation}
                          minDate={
                            values.startDate
                              ? new Date(values.startDate)
                              : new Date(initialValues.startDate)
                          }
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <FormikTextArea
                      placeholder={t("Description max size can be 500.")}
                      type="text"
                      name="description"
                      label={t("Description")}
                      validation={validation}
                    />
                  </div>

                  <FormSubmitPanel
                    idForSubmit={
                      editMilestone ? "edit-milestone" : "add-milestone"
                    }
                    validateFunc={() => setValidation(true)}
                    onCancel={returnToMainPage}
                    loading={apiloading}
                    validSubmit={params?.id && !dirty ? true : false}
                    submitTitle={editMilestone ? t("Update") : t("Create")}
                  />
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default AddEditMilestone;
