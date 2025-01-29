import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const params = useParams();

  const addTestRunSchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .max(32, t(ValidatorMessage.NAME_MAX_LENGTH))
      .required(t(ValidatorMessage.NAME_REQ)),
  });

  const initialValues = {
    name: "",
    description: "",
    assignTo: "",
    milestone: "",
    sectionIds: [],
    testCaseIds: [],
  };

  const [showLoader, setShowLoader] = useState(true);
  const [apiloading, setApiLoading] = useState(false);
  const [validation, setValidation] = useState(false);
  const [options, setOptions] = useState([]);
  const [milestoneOptions, setMilestoneOptions] = useState([]);
  const [state, setState] = useState("includeAll");
  const [totalTestcases, setTotalTestcases] = useState(0);

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
      }
    }
  }, [navigate, params.pid]);

  useEffect(() => {
    getSelectOptions();
  }, [getSelectOptions]);

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
  }, [navigate, params.pid]);

  useEffect(() => {
    if (params?.pid) getMilestoneOptions();
  }, [getMilestoneOptions, params?.pid]);

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
        value.sectionIds &&
        totalTestcases > 0
      ) {
        const newData: any = { ...data };
        // newData.testSuite.sectionIds = value.sectionIds;
        newData.testSuite.sectionIds = [];
        newData.testSuite.testCaseIds = value.testCaseIds;
        response = await axiosService.post(
          `/projects/${params.pid}/test-suites/filtered`,
          data
        );
      } else if (
        state === "includeSpecific" &&
        value.sectionIds &&
        totalTestcases === 0
      ) {
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
                    {t("Create New Test Run")}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    {t("Please fill in details of your new test run")}
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
                  />
                </div>
                <div>
                  <FormikInputSearch
                    type="text"
                    label={t("Milestone")}
                    name="milestone"
                    optionsForSelect={milestoneOptions}
                    isOptional
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
                  submitTitle={t("Create")}
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
