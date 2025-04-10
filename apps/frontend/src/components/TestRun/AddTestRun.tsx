import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { Formik, Form } from "formik";
import * as Yup from "yup";

import {
  appRoutes,
  projectRoutes,
  testRunRoutes,
} from "../Utils/constants/page-routes";
import axiosService from "../Utils/axios";
import { ToastMessage, ValidatorMessage } from "../Utils/constants/misc";
import {
  FormikInput,
  FormikTextArea,
  FormikInputSearch,
} from "../Common/FormikInput";
import { showError } from "../Toaster/ToasterFun";
import { FormSubmitPanel } from "../Common/FormSubmitPanel";
import Loader from "../Loader/Loader";

import TestcaseSelect from "./component/TestcaseSelect";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

const AddTestRun = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const duplicateFromId = queryParams.get("duplicateFrom");

  const addTestRunSchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .max(32, t(ValidatorMessage.NAME_MAX_LENGTH))
      .required(t(ValidatorMessage.NAME_REQ)),
  });

  const [initialValues, setInitialValues] = useState({
    name: "",
    description: "",
    assignTo: "",
    milestone: "",
    sectionIds: [],
    testCaseIds: [],
  });

  const [showLoader, setShowLoader] = useState(true);
  const [apiloading, setApiLoading] = useState(false);
  const [validation, setValidation] = useState(false);
  const [options, setOptions] = useState([]);
  const [milestoneOptions, setMilestoneOptions] = useState([]);
  const [state, setState] = useState("includeAll");
  const [totalTestcases, setTotalTestcases] = useState(0);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const returnToMainPage = () =>
    navigate(`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTRUNS}`);

  const getSelectOptions = useCallback(async () => {
    try {
      const response = await axiosService.get(
        `/organizations/members/all/${params.pid}`
      );
      const memberData = response.data.data;
      const memberList = memberData.map((item: any) => {
        return { value: item.id, label: item.firstName + " " + item.lastName };
      });
      setOptions(memberList);
      if (!duplicateFromId) {
        setShowLoader(false);
      }
    } catch (err) {
      setShowLoader(false);
      if (err.response && err.response.data) {
        showError(err.response.data.message);
        if (err.response.status === 401) {
          localStorage.clear();
          sessionStorage.clear();
          navigate("/");
        }
      }
    }
  }, [navigate, params.pid, duplicateFromId]);

  const getMilestoneOptions = useCallback(async () => {
    try {
      const milestoneResponse = await axiosService.get(
        `projects/${params.pid}/open/milestones`
      );
      const milestoneData = milestoneResponse.data.data;
      const milestoneList = milestoneData.map((item: any) => {
        return { value: item.id, label: item.name };
      });
      setMilestoneOptions(milestoneList);
      if (!duplicateFromId) {
        setShowLoader(false);
      }
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
  }, [navigate, params.pid, duplicateFromId]);

  // Fetch test run data if we're duplicating from an existing one
  const fetchTestRunData = useCallback(async () => {
    if (!duplicateFromId) return;

    try {
      setShowLoader(true);
      // Using the API endpoint you specified
      const response = await axiosService.get(
        `/projects/${params.pid}/test-suite-detail/${duplicateFromId}`
      );

      if (response?.data?.success) {
        const testRunData = response.data.data;

        // Pre-fill form data with values from the test run being duplicated
        setInitialValues({
          name: `${testRunData.name}`,
          description: testRunData.description || "",
          assignTo: testRunData.assignedTo || "",
          milestone: testRunData.milestoneId || "",
          sectionIds: testRunData.sectionIds || [],
          testCaseIds: testRunData.testCaseIds || [],
        });
        setIsDuplicating(true);
      }
      setShowLoader(false);
    } catch (err) {
      setShowLoader(false);
      if (err?.response?.data) {
        showError(err.response.data.message);
      } else {
        showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
      }
    }
  }, [params.pid, duplicateFromId, t]);

  useEffect(() => {
    getSelectOptions();

    if (params?.pid) {
      getMilestoneOptions();
    }

    // If duplicating from an existing test run, fetch its data
    if (duplicateFromId) {
      fetchTestRunData();
    }
  }, [
    getSelectOptions,
    getMilestoneOptions,
    params?.pid,
    fetchTestRunData,
    duplicateFromId,
  ]);

  const submitFormAddTestRun = async (value: typeof initialValues) => {
    setApiLoading(true);
    try {
      let data = {};
      if (!value.description.trim() && !value?.milestone) {
        data = {
          testSuite: {
            name: value.name.trim(),
            assignTo: value.assignTo,
          },
        };
      } else if (!value?.description?.trim()) {
        data = {
          testSuite: {
            name: value.name.trim(),
            assignTo: value.assignTo,
            milestone: value.milestone,
          },
        };
      } else if (!value?.milestone) {
        data = {
          testSuite: {
            name: value.name.trim(),
            assignTo: value.assignTo,
            description: value.description.trim(),
          },
        };
      } else
        data = {
          testSuite: {
            name: value.name.trim(),
            description: value.description.trim(),
            assignTo: value.assignTo,
            milestone: value.milestone,
          },
        };

      let response;
      if (
        state === "includeSpecific" &&
        value.testCaseIds &&
        totalTestcases > 0
      ) {
        const newData: any = { ...data };
        newData.testSuite.sectionIds = [];
        newData.testSuite.testCaseIds = value.testCaseIds;
        response = await axiosService.post(
          `/projects/${params.pid}/test-suites/filtered`,
          newData
        );
      } else if (state === "includeSpecific" && totalTestcases === 0) {
        showError(i18next.t(ToastMessage.TEST_CASE_SELECT_ATLEAST_ONE));
        setApiLoading(false);
        return;
      } else {
        response = await axiosService.post(
          `/projects/${params.pid}/test-suites/`,
          data
        );
      }

      navigate(
        `${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTRUNS}/${response.data.data.id}/${testRunRoutes.TEST_RESULTS}`
      );
    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.data.message) showError(err?.response?.data?.message);
      } else showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
      setApiLoading(false);
    }
  };
  console.log("initialValues", initialValues);
  return showLoader ? (
    <Loader withoverlay={true} />
  ) : (
    <div className="flex items-center justify-center mt-12 sm:mx-4 md:mx-20 lg:mx-4  xl:mx-24 ">
      <div className="sm:w-2/3 w-full mx-6 md:w-2/3 lg:w-2/4 xl:w-1/3 ">
        <Formik
          initialValues={initialValues}
          validationSchema={addTestRunSchema}
          onSubmit={submitFormAddTestRun}
          enableReinitialize
        >
          {() => {
            return (
              <Form className="space-y-6" autoComplete="off">
                <div>
                  <h1 className="text-lg leading-6 font-medium text-gray-900">
                    {isDuplicating
                      ? t("Clone Test Run")
                      : t("Create New Test Run")}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    {isDuplicating
                      ? t("Create a new test run based on an existing one")
                      : t("Please fill in details of your new test run")}
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
                <div>
                  <FormikInputSearch
                    type="text"
                    label={t("Assign To")}
                    name="assignTo"
                    optionsForSelect={options}
                    validation={validation}
                    dataAttr="assignee"
                    defaultValue={initialValues.assignTo}
                  />
                </div>
                <div>
                  <FormikInputSearch
                    type="text"
                    label={t("Milestone")}
                    name="milestone"
                    optionsForSelect={milestoneOptions}
                    isOptional
                    defaultValue={initialValues.milestone}
                  />
                </div>
                <div>
                  <FormikTextArea
                    placeholder={t("Description max size can be 500.")}
                    type="text"
                    name="description"
                    label={t("Description")}
                    isOptional
                  />
                </div>
                <div>
                  <TestcaseSelect
                    state={state}
                    setState={setState}
                    totalTestcases={totalTestcases}
                    setTotalTestcases={setTotalTestcases}
                  />
                </div>
                <FormSubmitPanel
                  dataAttr="create-test-run"
                  idForSubmit="add-test-run"
                  validateFunc={() => setValidation(true)}
                  onCancel={returnToMainPage}
                  loading={apiloading}
                  validSubmit={false}
                  submitTitle={isDuplicating ? t("Clone") : t("Create")}
                />
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default AddTestRun;
