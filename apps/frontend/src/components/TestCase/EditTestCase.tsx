import { useNavigate, useParams } from "react-router-dom";
import axiosService from "../Utils/axios";
import { showError } from "../Toaster/Toast";
import TestForm from "./TestForm";
import { useEffect, useState } from "react";
import Loader from "../Loader/Loader";
import { appRoutes, projectRoutes } from "../Utils/constants/page-routes";
import { useTranslation } from "react-i18next";

const EditTestCase = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();

  const [data, setData] = useState<any>({
    title: "",
    preconditions: "",
    steps: "",
    expectedResults: "",
    executionPriority: "",
    sectionId: "",
  });
  const [options, setOptions] = useState([]);
  const createTestCases = async (testCaseObj: any) => {
    const resp = await axiosService.put(
      `/projects/${testCaseObj?.projectId}/test-cases/${params?.id}`,
      testCaseObj?.testcase
    );
    return resp;
  };

  const getTestCaseDetail = async (projectId: any, id: any) => {
    try {
      const response = await axiosService.get(
        `/projects/${projectId}/test-cases/${id}`
      );
      const optionsresponse = await axiosService.get(
        "/projects/" + projectId + "/sections"
      );
      setOptions(optionsresponse.data.data.data);
      setData(response.data.data);
    } catch (err) {
      showError(err.response?.data?.message);
    }
  };

  useEffect(() => {
    if (params?.id && params?.pid) {
      getTestCaseDetail(params?.pid, params?.id);
    }
  }, [params]);

  const submitFormEditProject = async (values: typeof initialValues) => {
    const testCaseObj = {
      title: values.title,
      preconditions: values.preconditions,
      steps: values.steps,
      expectedResults: values.expectedResults,
      executionPriority: values.executionPriority,
      sectionId: values.sectionId,
    };

    if (data?.title === values?.title) {
      delete testCaseObj.title;
    }
    try {
      const resp = await createTestCases({
        testcase: testCaseObj,
        projectId: params.pid,
      });
      if (resp && resp.status === 200) {
        returnToPage();
      }
    } catch (error) {
      showError(error.response.data.message);
    }
  };

  const returnToPage = () => {
    navigate(`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTCASES}`);
  };

  const initialValues = {
    title: data?.title,
    preconditions: data?.preconditions,
    steps: data?.steps,
    expectedResults: data?.expectedResults,
    executionPriority: data?.executionPriority,
    sectionId: data?.section?.id,
  };
  if (initialValues?.title) {
    return (
      <TestForm
        onCancel={returnToPage}
        onSubmit={submitFormEditProject}
        initialValues={initialValues}
        heading={t("Edit Test Case")}
        subheading={t("Please update details of your test case.")}
        optionsForSelect={options}
      />
    );
  }
  return (
    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 pt-8">
      <div className="w-full sm:w-2/3 justify-center flex mx-auto  my-32">
        <Loader />
      </div>
    </div>
  );
};

export default EditTestCase;
