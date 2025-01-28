import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { XCircleIcon } from "@heroicons/react/24/solid";

import {
  appRoutes,
  projectRoutes,
  testCaseRoutes,
} from "../Utils/constants/page-routes";
import axiosService from "../Utils/axios";
import { ToastMessage } from "../Utils/constants/misc";
import Loader from "../Loader/Loader";
import { showError } from "../Toaster/ToasterFun";
import TestForm from "./TestForm";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

const EditManyTestCase = () => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const params = useParams();

  const initialValues = {
    title: "",
    preconditions: "",
    steps: "",
    expectedResults: "",
    executionPriority: "",
    sectionId: "",
  };

  const [options, setOptions] = useState([]);

  const editMultipleTestCase = async (testCaseObj: any) => {
    const resp = await axiosService.put(
      `/projects/${testCaseObj?.projectId}/test-cases`,
      testCaseObj?.testcase
    );
    return resp;
  };

  const [Row, setRowData] = useState<any[]>([]);
  const [showLoader, setShowLoader] = useState(true);

  const getDetails = async (projectId: any) => {
    try {
      const optionsresponse = await axiosService.get(
        "/projects/" + projectId + "/sections"
      );

      const response = await axiosService.get(
        `/projects/${projectId}/test-cases`
      );

      let ids = localStorage.getItem("testCaseIds");
      ids = ids && JSON.parse(ids);

      let newData: any[] = [];
      if (response.data.data.length) {
        for (const item of response.data.data) {
          // @ts-ignore
          const res = item.testcases.filter((val) => ids.indexOf(val.id) > -1);
          newData = [...newData, ...res];
        }
      }

      setRowData(newData);
      setShowLoader(false);
      setOptions(optionsresponse.data.data.data);
    } catch (err) {
      showError(err.response?.data?.message);
      setShowLoader(false);
    }
  };

  useEffect(() => {
    if (params?.pid) {
      getDetails(params?.pid);
    }
  }, [params]);

  const submitFormEditProject = async (values: typeof initialValues) => {
    if (Row.length === 0)
      return showError(
        t(
          "No test case selected. Please refresh the page or go back and select again."
        )
      );
    let value = {};

    for (const val in values) {
      // @ts-ignore
      if (values[val]) {
        value =
          val === "expectedResults"
            ? { ...value, expectedResults: values[val] }
            : // @ts-ignore
            { ...value, [val]: values[val] };
      }
    }

    if (Object.keys(value).length === 0 && value.constructor === Object) {
      showError(i18next.t(ToastMessage.TEST_CASES_EDIT_UPDATE));
      return;
    }

    const ids = Row.map((val) => val.id);

    const testCaseObj = {
      value,
      sectionId: values.sectionId,
      testCaseIds: ids,
    };

    try {
      const resp = await editMultipleTestCase({
        testcase: testCaseObj,
        projectId: params.pid,
      });
      if (resp && resp.status === 200) {
        localStorage.removeItem("testCaseIds");
        returnToPage();
      }
    } catch (error) {
      showError(error.response.data.message);
    }
  };

  const returnToPage = () => {
    navigate(`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTCASES}`);
  };

  return showLoader ? (
    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 pt-8">
      <div className="w-full sm:w-2/3 justify-center flex mx-auto  my-32">
        <Loader />
      </div>
    </div>
  ) : (
    <div>
      <div className="customScroll max-w-lg mx-auto border-4 border-double rounded-lg max-h-72 overflow-auto p-2 mt-12">
        <table className="w-full pt-10 px-4 divide-y divide-gray-200 ">
          <thead className="bg-blue-50">
            <tr>
              <th
                scope="col"
                className="pr-6 pl-2 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
              >
                {t("ID")}
              </th>
              <th
                scope="col"
                colSpan={2}
                className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
              >
                {t("Title")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Row.map((val, i) => (
              <tr key={i} className="bg-white  rounded">
                <td className="pr-6 pl-2 py-4 whitespace-nowrap text-xs font-medium text-gray-900 ">
                  <Link
                    to={`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTCASES}/${val.id}/${testCaseRoutes.TESTCASE}`}
                    className="truncate hover:text-gray-600 hover:underline cursor-pointer"
                  >
                    <span>{val.testcaseId}</span>
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500  ">
                  <Link
                    to={`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTCASES}/${val.id}/${testCaseRoutes.TESTCASE}`}
                    className="truncate hover:text-blue-600 hover:underline cursor-pointer"
                  >
                    <span>
                      {val.title.length > 60
                        ? val.title.slice(0, 55) + "..."
                        : val.title}
                    </span>
                  </Link>
                </td>
                <td
                  id="action-value"
                  className=" px-6 py-4 whitespace-nowrap text-right "
                >
                  <div className="flex justify-end">
                    <XCircleIcon
                      onClick={() => {
                        setRowData(Row.filter((item) => item.id !== val.id));
                      }}
                      className="text-red-400 h-6 w-5 cursor-pointer mr-1"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TestForm
        onCancel={returnToPage}
        initialValues={initialValues}
        // @ts-ignore
        onSubmit={submitFormEditProject}
        heading="Edit Selected Test Cases"
        subheading="Please update details of selected test cases."
        EditMany={true}
        optionsForSelect={options}
      />
    </div>
  );
};

export default EditManyTestCase;
