/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useState, useLayoutEffect } from "react";
import { Dialog, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Formik, Form } from "formik";
import CancelButton from "../Button/cancelButton";
import Button from "../Button";
import {
  FormikInput,
  FormikInputSearch,
  FormikTextArea,
} from "../Common/FormikInput";
import axiosService from "../Utils/axios";
import { showError, showSuccess } from "../Toaster/ToasterFun";
import { validateAddDefectSchema } from "../Utils/validators";
import { useFormSubmitWithLoading } from "../Utils/hooks/useFormSubmitWithLoading";
import { IssueType, ToastMessage } from "../Utils/constants/misc";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

interface payloadType {
  projectId: string;
  title: string;
  issueTypeId: string;
  assigneeId?: string;
  sprintId?: string;
  description?: string;
  parentId?: string;
  testCaseId: string;
}

export default function AddReferenceModal({
  setOpen,
  open,
  title,
  id,
  testcaseId,
  getTestCaseDetail,
  projectId,
}: any) {
  const initialValues = {
    summary: "",
    project: "",
    issueType: "",
    assignee: "",
    sprint: "",
    description: "",
    parent: "",
    issueTypelabel: "",
  };
  const { t } = useTranslation(["common"]);

  const [initValues, setInitValues] = useState(initialValues);
  const [jiraProjects, setJiraProjects] = useState([]);
  const [projectIssueTypes, setProjectIssueTypes] = useState([]);
  const [projectSprints, setProjectSprints] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [projectDefects, setProjectDefects] = useState([]);

  const [selectedProject, setSelectedProject] = useState<any>({});
  const [selectedIssueType, setSelectedIssueType] = useState<any>({});
  const [apiLoading, setApiLoading] = useState<boolean>(true);
  const [validation, setValidation] = useState<boolean>(false);
  const [clearValue, setClearValue] = useState<boolean>(false);
  const [clearParentValue, setClearParentValue] = useState(false);
  const [projectDataLoading, setProjectDataLoading] = useState<boolean>(false);
  const [projectDefectsLoading, setProjectDefectsLoading] =
    useState<boolean>(false);

  const fetchProjectDefects = async (projectKey: string) => {
    try {
      setClearParentValue(true);
      setProjectDefectsLoading(true);
      const response = await axiosService.get(
        `/plugins/issues?projectKey=${projectKey}`
      );
      const _issues = response.data.data.issues;
      const defectOptions = _issues.map((item: any) => {
        return {
          value: item.id,
          label: item.key,
        };
      });
      setProjectDefects(defectOptions);
    } catch (error) {
      showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
    } finally {
      setProjectDefectsLoading(false);
      setClearParentValue(false);
    }
  };

  const fetchJiraProjects = async () => {
    try {
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
    }
  };

  const submitForm = async (values: any) => {
    const {
      summary,
      project,
      issueType,
      assignee,
      sprint,
      description,
      parent,
    } = values;

    const payload: payloadType = {
      projectId: project,
      title: summary,
      issueTypeId: issueType.value,
      testCaseId: testcaseId,
    };

    if (assignee) payload.assigneeId = t(assignee);
    if (sprint) payload.sprintId = `${sprint}`;
    if (description) payload.description = description;
    if (parent && selectedIssueType.label === IssueType.SUBTASK) {
      payload.parentId = parent;
    } else {
      if (payload.parentId) delete payload.parentId;
    }

    try {
      const response = await axiosService.post("/defects", payload);
      showSuccess(response.data.message);
      setOpen(false);
      getTestCaseDetail(projectId, testcaseId);
    } catch (error) {
      showError(error.response.data.message);
    }
  };

  const { onSubmitHandler, loading } = useFormSubmitWithLoading(submitForm);

  const getSelectedProject = (option: any) => {
    setSelectedProject(option);
  };

  const getSelectedIssueType = (option: any) => {
    setSelectedIssueType(option);
  };

  const fetchProjectData = async (id: any) => {
    try {
      setApiLoading(true);
      setClearValue(true);
      setClearParentValue(true);
      setProjectDataLoading(true);
      const issueTypeResponse = await axiosService.get(
        `/plugins/issuetypes?projectId=${id}`
      );

      const assigneeResponse = await axiosService.get(
        `/plugins/users?projectId=${id}`
      );
      const sprintResponse = await axiosService.get(
        `/plugins/sprints?projectId=${id}`
      );

      const issueTypeObj = issueTypeResponse.data.data.map((item: any) => {
        return {
          label: item.name,
          value: { label: item.name, value: item.id },
        };
      });

      const assigneeObj = assigneeResponse.data.data.map((item: any) => {
        return { label: item.displayName, value: item.accountId };
      });

      const sprintsObj = sprintResponse.data.data.map((item: any) => {
        return { label: item.name, value: item.id };
      });

      // Set Project Data
      setProjectIssueTypes(issueTypeObj);
      setProjectMembers(assigneeObj);
      setProjectSprints(sprintsObj);

      // Enable Issue Type, Assignee and Sprint fields
      setApiLoading(false);
    } catch (error) {
      showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
    } finally {
      setProjectDataLoading(false);
      setClearValue(false);
      setClearParentValue(false);
    }
  };

  useEffect(() => {
    if (selectedProject.value) {
      fetchProjectData(selectedProject.value);
      setProjectDefects([]);
      setSelectedIssueType({});
    }
  }, [selectedProject.value]);

  useEffect(() => {
    if (selectedIssueType.label === IssueType.SUBTASK) {
      fetchProjectDefects(selectedProject.key);
    } else {
      setProjectDefects([]);
    }
  }, [selectedIssueType.label, selectedProject.key]);

  // Stops modal from flickering on render
  useLayoutEffect(() => {
    setInitValues({
      ...initialValues,
      summary: title,
      description: `${id} : ${title}\n${window.location.href}`,
    });
    fetchJiraProjects();

    return () => {
      setInitValues(initialValues);
    };
  }, []);

  return (
    <Transition show={open} as={Fragment}>
      <Dialog
        as="div"
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
            <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6 space-y-6">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <DialogTitle
                    as="div"
                    className="text-lg leading-6 font-medium text-gray-900"
                  >
                    {t("Add Reference to JIRA")}
                  </DialogTitle>
                </div>
              </div>
              <div className="w-full">
                <Formik
                  initialValues={initValues}
                  validationSchema={validateAddDefectSchema}
                  onSubmit={onSubmitHandler}
                  enableReinitialize
                  validateOnChange
                >
                  {(formik) => {
                    const { dirty } = formik;
                    return (
                      <Form className="space-y-6" autoComplete="off" noValidate>
                        <div>
                          <FormikInput
                            type="text"
                            name="summary"
                            label={t("Summary")}
                            validation={validation}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <FormikInputSearch
                              type="text"
                              name="project"
                              label={t("Project")}
                              optionsForSelect={jiraProjects}
                              getSelectedOption={getSelectedProject}
                              validation={validation}
                              loading={projectDataLoading}
                              dataAttr="project"
                            />
                          </div>
                          <div>
                            <FormikInputSearch
                              type="text"
                              name="issueType"
                              label={t("Issue Type")}
                              disabled={apiLoading}
                              emptyCached={clearValue}
                              getSelectedOption={getSelectedIssueType}
                              optionsForSelect={projectIssueTypes}
                              validation={validation}
                              dataAttr="issueType"
                            />
                          </div>
                          {selectedIssueType.label === IssueType.SUBTASK ? (
                            <div>
                              <FormikInputSearch
                                type="text"
                                name="parent"
                                label={t("Parent")}
                                disabled={projectDefectsLoading}
                                emptyCached={clearParentValue}
                                optionsForSelect={projectDefects}
                                validation={validation}
                                loading={projectDefectsLoading}
                              />
                            </div>
                          ) : null}
                          <div>
                            <FormikInputSearch
                              type="text"
                              name="assignee"
                              label={t("Assignee")}
                              disabled={apiLoading}
                              emptyCached={clearValue}
                              optionsForSelect={projectMembers}
                              isOptional={true}
                              validation={validation}
                              dataAttr="assignee"
                            />
                          </div>
                          <div>
                            <FormikInputSearch
                              type="text"
                              name="sprint"
                              label={t("Sprint")}
                              disabled={apiLoading}
                              emptyCached={clearValue}
                              optionsForSelect={projectSprints}
                              isOptional={true}
                              validation={validation}
                              dataAttr="sprint"
                            />
                          </div>
                          <div className="col-span-2">
                            <FormikTextArea
                              type="text"
                              name="description"
                              label={t("Description")}
                              isOptional={true}
                              markdownPreview={true}
                              validation={validation}
                            />
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
