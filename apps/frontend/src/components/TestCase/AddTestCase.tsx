import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { appRoutes, projectRoutes } from "../Utils/constants/page-routes";
import axiosService from "../Utils/axios";
import { ToastMessage } from "../Utils/constants/misc";
import Loader from "../Loader/Loader";
import { showError, showSuccess } from "../Toaster/Toast";
import TestForm from "./TestForm";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { createTestCases } from "../../services/testCasesServices";

interface InitVal {
  title: string | string[] | undefined;
  expectedResults: string | string[] | undefined;
  preconditions: string | string[] | undefined;
  steps: string | string[] | undefined;
  sectionId: string | string[] | undefined;
  executionPriority: string | string[] | undefined;
}

const AddTestCase = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const { state }: any = useLocation();

  const submitFormAddProject = async (
    values: typeof initialValues,
    { resetForm }: any
  ) => {
    const testCaseObj = {
      title: values.title,
      preconditions: values.preconditions,
      steps: values.steps,
      expectedResults: values.expectedResults,
      executionPriority: values.executionPriority,
    };
    try {
      const resp = await createTestCases({
        testcase: testCaseObj,
        projectId: params.pid,
        sectionId: values.sectionId,
      });
      if (resp && resp.status === 201) {
        showSuccess(resp.message);
        // @ts-ignore
        if (values.next) {
          resetForm();
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          values.callBack;
        } else {
          returnToPage();
        }
      }
    } catch (error) {
      showError(error.response.data.message);
    }
  };

  const returnToPage = () => {
    navigate(`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTCASES}`);
  };

  const [initialValues, setInitialValue] = useState<InitVal>({
    title: "",
    preconditions: "",
    steps: "",
    expectedResults: "",
    sectionId: state?.sectionId || "",
    executionPriority: "MEDIUM",
  });

  const [loadingPage, setLoadingPage] = useState(true);
  const [options, setOptions] = useState([]);

  const getSelectOptions = useCallback(async () => {
    try {
      if (params?.pid) {
        const response = await axiosService.get(
          "/projects/" + params?.pid + "/sections"
        );
        setOptions(response.data.data.data);
        if (!state?.sectionId) {
          setInitialValue({
            title: "",
            preconditions: "",
            steps: "",
            expectedResults: "",
            executionPriority: "MEDIUM",
            sectionId: response.data.data.data[0].id,
          });
        }
        setLoadingPage(false);
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
      }
      setLoadingPage(false);
    }
  }, [params?.pid, state?.sectionId]);

  useEffect(() => {
    getSelectOptions();
  }, [getSelectOptions, params]);

  if (loadingPage) {
    return (
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 pt-8">
        <div className="w-full sm:w-2/3 justify-center flex mx-auto  my-32">
          <Loader />
        </div>
      </div>
    );
  }
  return (
    <>
      <TestForm
        onCancel={returnToPage}
        onSubmit={submitFormAddProject}
        onSubmitNext={true}
        initialValues={initialValues}
        heading={t("Add New Test Case")}
        subheading={t("Please fill in details of your new test case.")}
        optionsForSelect={options}
      />
    </>
  );
};

export default AddTestCase;
