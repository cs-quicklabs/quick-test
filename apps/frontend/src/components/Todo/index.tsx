import { Fragment, useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Chart from "./Chart";
import { Tooltip } from "react-tooltip";
import {
  appRoutes,
  projectRoutes,
  testRunRoutes,
} from "../Utils/constants/page-routes";
import axiosService from "../Utils/axios";
import { ToastMessage } from "../Utils/constants/misc";
import Loader from "../Loader/Loader";
// import Pagination from "../Pagination/Pagination";
import { showError } from "../Toaster/ToasterFun";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

const Todo = () => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const params = useParams();

  const [testRunList, setTestRunList] = useState([]);
  const [showLoader, setShowLoader] = useState(true);
  // const [PageNum, setPageNum] = useState(1);
  const [dataForChart, setDataForChart] = useState<{
    labels: any[];
    datasets: any[];
  }>({
    labels: [],
    datasets: [],
  });
  // const [paginationData, setPaginationData] = useState({
  //   itemCount: 0,
  //   page: 0,
  //   pageCount: 0,
  //   take: 0,
  // });

  const getData = useCallback(async () => {
    try {
      const response = await axiosService.get(
        `/projects/${params.pid}/test-suites`
      );
      if (dataForChart.labels.length === 0) {
        const tableData = await axiosService.get(
          "/projects/" + params?.pid + "/todo"
        );
        const newTableData = tableData.data.data.users;
        const labelArray: any[] = [];
        const dataSet1: any[] = [];
        const dataSet2: any[] = [];
        for (let i = 0; i < newTableData.length; i++) {
          labelArray.push(
            newTableData[i].firstName + " " + newTableData[i].lastName
          );
          dataSet1.push(newTableData[i].totalActiveTestCases);
          dataSet2.push(newTableData[i].totalCompletedTestCases);
        }
        const labels = [...labelArray];
        const datasets = [
          {
            label: t("Active"),
            data: [...dataSet2],
            backgroundColor: "rgb(124,181,236)",
            barThickness: 20,
          },
          {
            label: t("Completion pending"),
            data: [...dataSet1],
            backgroundColor: "rgb(171,213,254)",
            barThickness: 20,
          },
        ];
        setDataForChart({
          labels: [...labels],
          datasets: [...datasets],
        });
      }
      const data = response.data.data.data;
      setTestRunList(data);
      // setPaginationData(response.data.data.meta);
      setShowLoader(false);
    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.status === 401) {
          showError(err.response.data.message);
          localStorage.clear();
          sessionStorage.clear();
          navigate("/");
          return;
        } else showError(err.response.data.message);
      } else showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
      setShowLoader(false);
    }
  }, [dataForChart.labels.length, navigate, params.pid, t]);

  useEffect(() => {
    if (params?.pid) getData();
  }, [getData, params?.pid]);

  const renderGraph = (
    passed: number,
    failed: number,
    untested: number,
    blocked: number
  ) => {
    const total = passed + failed + untested + blocked;
    const width1 = (passed / total) * 100 + "%";
    const width2 = (failed / total) * 100 + "%";
    const width3 = (untested / total) * 100 + "%";
    const width4 = (blocked / total) * 100 + "%";
    const span1 = (
      <span
        data-tooltip-id="todo-index-tooltip-id"
        data-tooltip-content={`${width1.toString().split(/[.,%]+/)[0]}% ${t(
          "passed"
        )} (${passed}/${total} ${t("tests")})`}
        className="inline-block h-4 cursor-pointer mt-1"
        style={{ width: width1, backgroundColor: "#3cb850" }}
      ></span>
    );
    const span2 = (
      <span
        data-tooltip-id="todo-index-tooltip-id"
        data-tooltip-content={`${width2.toString().split(/[.,%]+/)[0]}% ${t(
          "failed"
        )} (${failed}/${total} ${t("tests")})`}
        data-tooltip-place="bottom"
        className="inline-block h-4 cursor-pointer mt-1"
        style={{ width: width2, backgroundColor: "#e40046" }}
      ></span>
    );
    const span3 = (
      <span
        data-tooltip-id="todo-index-tooltip-id"
        data-tooltip-content={`${width3.toString().split(/[.,%]+/)[0]}% ${t(
          "untested"
        )} (${untested}/${total} ${t("tests")})`}
        className="inline-block h-4 cursor-pointer mt-1"
        style={{ width: width3, backgroundColor: "#979797" }}
      ></span>
    );
    const span4 = (
      <span
        data-tooltip-id="todo-index-tooltip-id"
        data-tooltip-content={`${width4.toString().split(/[.,%]+/)[0]}% ${t(
          "untested"
        )} (${blocked}/${total} ${t("tests")})`}
        className="inline-block h-4 cursor-pointer mt-1"
        style={{ width: width3, backgroundColor: "#979797" }}
      ></span>
    );
    return (
      <span className="w-20 inline-block mx-4">
        {span1}
        {span3}
        {span2}
        {span4}
        <Tooltip id="todo-index-tooltip-id" />
      </span>
    );
  };

  if (showLoader) {
    return (
      <div className="flex justify-center items-center content-center my-32">
        <Loader />
      </div>
    );
  }

  return (
    <Fragment>
      <div className="mx-7 mt-4 pb-14 2xl:mx-52">
        {dataForChart.labels.length !== 0 ? (
          <Chart dataForChart={dataForChart} />
        ) : (
          <div className="flex justify-center items-center content-center text-gray-500 text-xs font-normal mt-5">
            <Chart dataForChart={dataForChart} />
          </div>
        )}
        <div className="bg-gray-200 px-4 py-2 mt-5 rounded text-sm ">
          {t("Todo Test Runs")}
        </div>
        <div className="align-middle inline-block min-w-full px-4">
          <table className="min-w-full border-b border-gray-200 ">
            <tbody className="bg-white divide-y divide-gray-200">
              {testRunList.map((testrun: any, i) => (
                <tr key={i} className="">
                  <td className=" max-w-0 w-full whitespace-nowrap font-normal text-gray-900">
                    <div className="flex items-center space-x-3 lg:pl-2">
                      <Link
                        className="truncate hover:underline cursor-pointer text-sm"
                        to={`${appRoutes.PROJECTS}/${params?.pid}/${projectRoutes.TESTRUNS}/${testrun?.id}/${testRunRoutes.TEST_RESULTS}`}
                      >
                        {testrun.name} ( {testrun?.testreport?.total} )
                      </Link>
                    </div>
                  </td>
                  <td className=" py-2 whitespace-nowrap text-xs text-gray-500 text-right flex justify-center items-center">
                    <span style={{ display: "inline-block" }}>
                      {t("Passed") + ": " + testrun?.testreport?.passed}{" "}
                      {t("Failed") + ": " + testrun?.testreport?.failed}{" "}
                      {t("Untested") + ": " + testrun?.testreport?.untested}{" "}
                      {t("Blocked") + ": " + testrun?.testreport?.blocked}{" "}
                    </span>
                    <span style={{ display: "inline-block" }}>
                      {renderGraph(
                        testrun?.testreport?.passed,
                        testrun?.testreport?.failed,
                        testrun?.testreport?.untested,
                        testrun?.testreport?.blocked
                      )}
                    </span>
                    <span className="font-normal inline-block w-10 text-center">
                      {" "}
                      {
                        (
                          (testrun.testreport?.passed /
                            testrun?.testreport?.total) *
                          100
                        )
                          .toString()
                          .split(".")[0]
                      }{" "}
                      %
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {testRunList.length === 0 && (
            <div className="flex mt-4 justify-center items-center content-center text-gray-500 text-xs font-normal">
              {t("No test runs added yet.")}
            </div>
          )}
          {/* <Pagination setPageNum={setPageNum} paginationData={paginationData} /> */}
        </div>
      </div>
    </Fragment>
  );
};

export default Todo;
