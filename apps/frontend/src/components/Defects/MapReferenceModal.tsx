import { Fragment, useEffect, useLayoutEffect, useState, useRef } from "react";
import { Dialog, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Formik, Form } from "formik";
import CancelButton from "../Button/cancelButton";
import Button from "../Button";
import { FormikInputSearch } from "../Common/FormikInput";
import { ToastMessage } from "../Utils/constants/misc";
import { showError, showSuccess } from "../Toaster/ToasterFun";
import axiosService from "../Utils/axios";
import { useFormSubmitWithLoading } from "../Utils/hooks/useFormSubmitWithLoading";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

const mapFormValidation = yup.object().shape({
  project: yup.string(),
  defectId: yup.string().required("Defect ID is required"),
});

export default function MapReferenceModal({
  setOpen,
  open,
  testcaseId,
  getTestCaseDetail,
  projectId,
}: any) {
  const initValues = {
    project: "",
    defectId: "",
  };
  const { t } = useTranslation(["common"]);
  const headerRef = useRef(null);

  const [jiraProjects, setJiraProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState<any>({});
  const [projectDefects, setProjectDefects] = useState([]);
  const [apiLoading, setApiLoading] = useState<boolean>(true);
  const [validation, setValidation] = useState<boolean>(false);
  const [clearValue, setClearValue] = useState<boolean>(false);
  const [projectDataLoading, setProjectDataLoading] = useState<boolean>(false);

  const submitForm = async (values: typeof initValues) => {
    try {
      const response = await axiosService.patch(
        `/defects/ref/testcase/${testcaseId}`,
        {
          pluginKey: values.defectId,
        }
      );
      showSuccess(response.data.message);
      setOpen(false);
      getTestCaseDetail(projectId, testcaseId);
    } catch (error) {
      showError(error.response.data.message);
    }
  };

  const { onSubmitHandler, loading } = useFormSubmitWithLoading(submitForm);

  const fetchProjectDefect = async (projectKey: string) => {
    try {
      setClearValue(true);
      setApiLoading(true);
      setProjectDataLoading(true);
      const response = await axiosService.get(
        `/plugins/issues?projectKey=${projectKey}&subtask=true`
      );
      const _issues = response.data.data.issues;
      const defectOptions = _issues.map((item: any) => {
        return {
          value: item.key,
          label: item.key,
        };
      });
      setProjectDefects(defectOptions);
      setApiLoading(false);
    } catch (error) {
      showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
    } finally {
      setProjectDataLoading(false);
      setClearValue(false);
    }
  };

  const fetchJiraProjects = async () => {
    try {
      setProjectDataLoading(true);
      const response = await axiosService.get("/plugins/projects");
      const projectObject = response.data.data.map((item: any) => {
        return {
          label: item.name,
          value: item.id,
          key: item.key,
        };
      });
      setJiraProjects(projectObject);
    } catch (error) {
      showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
    } finally {
      setProjectDataLoading(false);
    }
  };
  useEffect(() => {
    if (selectedProject.key) {
      fetchProjectDefect(selectedProject.key);
    }
  }, [selectedProject.key]);

  useLayoutEffect(() => {
    fetchJiraProjects();
  }, []);

  const getSelectedOption = (value: string) => {
    setSelectedProject(value);
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog
        as="div"
        initialFocus={headerRef}
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={setOpen}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </TransitionChild>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full sm:p-6 space-y-6">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <DialogTitle
                    as="div"
                    className="text-lg leading-6 font-medium text-gray-900"
                  >
                    <div ref={headerRef}>{t("Map Reference to JIRA")}</div>
                  </DialogTitle>
                </div>
              </div>
              <div className="w-full">
                <Formik
                  initialValues={initValues}
                  validationSchema={mapFormValidation}
                  onSubmit={onSubmitHandler}
                  enableReinitialize
                  validateOnChange
                >
                  {(formik) => {
                    const { dirty } = formik;
                    return (
                      <Form className="space-y-6" autoComplete="off" noValidate>
                        <div className="flex flex-col min-h-48">
                          <div className="flex-grow">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <FormikInputSearch
                                  type="text"
                                  name="project"
                                  label={t("Project")}
                                  optionsForSelect={jiraProjects}
                                  getSelectedOption={getSelectedOption}
                                  validation={validation}
                                  loading={projectDataLoading}
                                  dataAttr="project"
                                />
                              </div>
                              <div>
                                <FormikInputSearch
                                  type="text"
                                  name="defectId"
                                  label={t("Defect ID")}
                                  disabled={apiLoading}
                                  emptyCached={clearValue}
                                  optionsForSelect={projectDefects}
                                  validation={validation}
                                  dataAttr="defectId"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="sm:flex sm:flex-row-reverse gap-x-4">
                            <Button
                              onMouseDown={() => setValidation(true)}
                              id="submit-button"
                              loading={loading}
                              type="submit"
                              className={
                                !dirty
                                  ? "cursor-not-allowed bg-indigo-600/50 hover:bg-indigo-600/50"
                                  : ""
                              }
                              disabled={!dirty}
                            >
                              {t("Submit")}
                            </Button>
                            <CancelButton
                              data-cy="cancel-btn"
                              type="button"
                              onMouseDown={() => setOpen(false)}
                            >
                              {t("Cancel")}
                            </CancelButton>
                          </div>
                        </div>
                      </Form>
                    );
                  }}
                </Formik>
              </div>
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
