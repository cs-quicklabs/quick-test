import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import dayjs from "dayjs";

import {
  appRoutes,
  milestoneRoutes,
  projectRoutes,
  testCaseRoutes,
  testRunRoutes,
} from "../../Utils/constants/page-routes";
import axiosService from "../../Utils/axios";
import Button from "../../Button/index";
import { DateFormat } from "../../Utils/constants/date-format";
import { ToastMessage } from "../../Utils/constants/misc";
import Loader from "../../Loader/Loader";
import OverviewCharts from "./OverviewChart";
import { showError } from "../../Toaster/ToasterFun";
import { Trans, useTranslation } from "react-i18next";
import i18next from "i18next";
import AccessControl from "../../AccessControl";
import { MilestonePermissions } from "../../Utils/constants/roles-permission";

export default function Overview() {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const params = useParams();

  const [milestoneList, setMilestoneList] = useState([]);
  const [activityList, setActivityList] = useState([]);
  const [todoList, setTodoList] = useState([]);
  const [testRunList, setTestRunList] = useState([]);
  const [graphDataset, setGraphDataSet] = useState({});
  const [defaultActivity, setDefaultActivity] = useState("history");
  const [testChangeList, setTestChangeList] = useState<any[]>([]);
  const testChangeRef = useRef<IntersectionObserver | null>(null);
  const [pageForTest, setPageForTest] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingTestChange, setLoadingTestChange] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  const getGraphDetails = useCallback(async () => {
    try {
      const response = await axiosService.get(
        `/projects/${params.pid}/activities/test-results?days=14`
      );
      setShowLoader(false);
      if (response?.data?.data?.data) {
        const graphData = response.data.data.data;
        const gL: any[] = [];
        const passedGL: number[] = [];
        const failedGL: number[] = [];
        const untestedGL: number[] = [];
        const blockedGL: number[] = [];

        graphData.forEach((ele: any) => {
          gL.push(dayjs(ele.date).format(DateFormat.SHORT));
          let psCount = 0;
          let flCount = 0;
          let utCount = 0;
          let blCount = 0;

          ele.activities.forEach((item: any) => {
            if (item.status === "PASSED") {
              psCount++;
            } else if (item.status === "FAILED") {
              flCount++;
            } else if (item.status === "UNTESTED") {
              utCount++;
            } else if (item.status === "BLOCKED") {
              blCount++;
            }
          });
          passedGL.push(psCount);
          failedGL.push(flCount);
          untestedGL.push(utCount);
          blockedGL.push(blCount);
        });
        const iterateData: any[] = [];
        iterateData.push({
          label: t("Failed"),
          data: [...failedGL],
          backgroundColor: "rgb(228, 0, 70)",
        });
        iterateData.push({
          label: t("Untested"),
          data: [...untestedGL],
          backgroundColor: "rgb(151, 151, 151)",
        });
        iterateData.push({
          label: t("Passed"),
          data: [...passedGL],
          backgroundColor: "rgb(60, 184, 80)",
        });
        iterateData.push({
          label: t("Blocked"),
          data: [...blockedGL],
          backgroundColor: "rgb(255, 255, 0)",
        });


        const additionalData: any[] = [];
        const loopLength = 14 - gL.length;
        if (gL.length < 14) {
          for (let i = 0; i < loopLength; i++) {
            gL.unshift(
              dayjs(gL[0]).subtract(1, "days").format(DateFormat.SHORT)
            );
            additionalData.push(0);
          }
        }

        iterateData.forEach((ele: any) => {
          ele.data = [...additionalData, ...ele.data];
        });

        const dataset = {
          labels: gL,
          datasets: iterateData,
        };
        setGraphDataSet(dataset);
      }
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
    }
  }, [navigate, params.pid, t]);

  const getTestRunList = useCallback(async () => {
    try {
      const resp = await axiosService.get(
        `projects/${params.pid}/activity/test-suites?order=DESC`
      );
      if (resp?.data?.data) {
        setTestRunList(resp.data.data);
      }
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
    }
  }, [navigate, params.pid]);

  const getData = useCallback(async () => {
    try {
      const response = await axiosService.get(
        `/projects/${params.pid}/test-suites?order=DESC`
      );

      const data = response.data.data.data;
      const todos = data.filter((ele: any) => ele.status !== "COMPLETED");
      setTodoList(todos);
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
    }
  }, [navigate, params.pid]);

  useEffect(() => {
    if (params.pid) getData();
  }, [getData, params.pid]);

  const getActivityList = useCallback(async () => {
    try {
      const resp = await axiosService.get(
        `/projects/${params.pid}/activities?days=7`,
        {
          projectId: params.pid,
        }
      );
      if (resp?.data?.data?.data) {
        setActivityList(resp.data.data.data);
      }
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
    }
  }, [navigate, params.pid]);

  const getMilestoneList = useCallback(async () => {
    try {
      const response = await axiosService.get(
        `/projects/${params.pid}/activity/milestones?order=DESC`
      );
      if (response?.data?.data) {
        setMilestoneList(response.data.data);
      }
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
    }
  }, [navigate, params.pid]);
  const navigateAdd = (type: string) => {
    if (type === "Milestone") {
      navigate(
        `${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.CREATE_MILESTONE}`
      );
    } else if (type === "Test-case") {
      navigate(
        `${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.CREATE_TESTCASE}`
      );
    } else if (type === "Test-run") {
      navigate(
        `${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.CREATE_TESTRUN}`
      );
    } else {
      return;
    }
  };

  const loadTestChanges = () => {
    setDefaultActivity("testChanges");
  };
  const getTestChanges = async (pageNum: number) => {
    try {
      setLoadingTestChange(true);

      const resp = await axiosService.get(
        "/projects/" +
        params?.pid +
        "/activities/test-changes?page=" +
        pageNum +
        "&take=50"
      );
      const data = resp?.data?.data?.data?.data;
      const meta = resp?.data?.data?.meta;
      setHasMore(meta?.page < meta?.pageCount);

      if (testChangeList?.at(-1)?.date === data?.[0]?.date) {
        const newTestChangeList = [...testChangeList];
        const newAPIData = [...data];

        newTestChangeList
          ?.at(-1)
          ?.activities?.push(...newAPIData[0].activities);

        newAPIData.shift();

        setTestChangeList([...newTestChangeList, ...newAPIData]);
      } else {
        setTestChangeList([...testChangeList, ...data]);
      }
      setLoadingTestChange(false);
      //
    } catch (err) {
      setLoadingTestChange(false);
      if (err?.response?.data) {
        if (err?.response?.data?.message)
          showError(err?.response?.data?.message);

        if (err?.response?.status === 401) {
          localStorage.clear();
          sessionStorage.clear();
          navigate("/");
          return;
        }
      } else showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
    }
  };

  useEffect(() => {
    getTestChanges(pageForTest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageForTest]);

  useEffect(() => {
    if (params.pid) {
      getMilestoneList();
      getActivityList();
      getTestRunList();
      getGraphDetails();
    }
  }, [
    getActivityList,
    getGraphDetails,
    getMilestoneList,
    getTestRunList,
    params.pid,
  ]);

  const lastElementRef = (node: any) => {
    if (loadingTestChange) return;

    if (testChangeRef?.current) testChangeRef?.current?.disconnect?.();

    testChangeRef.current = new IntersectionObserver((entries) => {
      if (entries?.[0]?.isIntersecting && hasMore) {
        setPageForTest((prevPageNumber) => prevPageNumber + 1);
      }
    });

    if (node) testChangeRef?.current?.observe?.(node);
  };

  const getDataTestCase = async (id: string) => {
    try {
      const details = await axiosService.get(
        "/projects/" + params.pid + "/test-cases/" + id + "/details"
      );
      navigate(
        `${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTCASES}/${details.data.data.id}/${testCaseRoutes.TESTCASE}`
      );
    } catch (err) {
      showError(err.response.data.message);
    }
  };
  const NotAvailable = ({ text }: any) => {
    return (
      <div className="mt-10 text-center mr-4 text-gray-500 text-sm font-normal">
        {t("No")} {<Trans>{text}</Trans>} {t("available")}
      </div>
    );
  };

  return (
    <>
      {showLoader ? (
        <div className="flex justify-center items-center content-center my-32">
          <Loader />
        </div>
      ) : (
        <div className="flex-grow min-h-full h-auto flex">
          <div className="w-9/12 p-4 pb-14 lg:border-r lg:border-gray-200 2xl:pl-52">
            <div className="p-4 overviewChart" data-cy="overview-chart">
              <OverviewCharts dataset={graphDataset} />
            </div>
            <div className="flex p-4 ">
              <div className="w-6/12">
                <div className="font-semibold bg-gray-200 text-gray-900 px-4 py-2 text-sm  sm:gap-4 sm:px-4 mr-4 rounded">
                  {t("Milestones")}
                </div>
                {!milestoneList.length && (
                  <>
                    <p className="mt-4 mr-4 mb-2 text-gray-500 text-sm font-normal">
                      {t("This project does not have any active milestones")}.
                    </p>
                    <AccessControl
                      permission={MilestonePermissions.CREATE_MILESTONE}
                    >
                      <Button
                        id="show-pop-up"
                        data-cy="add-milestone"
                        type="button"
                        onClick={() => navigateAdd("Milestone")}
                      // className="mt-2"
                      >
                        {t("Add Milestones")}
                      </Button>
                    </AccessControl>
                  </>
                )}
                {milestoneList?.length ? (
                  milestoneList.map((ele: any) => {
                    return (
                      <div
                        key={ele.id}
                        className="border-b mt-4 pb-2 pl-2 mr-4"
                      >
                        <Link
                          to={`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.MILESTONES}/${ele.id}/${milestoneRoutes.MILESTONE}`}
                          className="text-gray-900 font-normal text-sm cursor-pointer"
                        >
                          {ele.name}
                        </Link>
                        {ele?.endDate && (
                          <p className="text-xs text-gray-500">
                            {t("Due on")}{" "}
                            {ele?.endDate
                              ? dayjs(new Date(ele?.endDate)).format(
                                DateFormat.LONG
                              )
                              : t("No due date")}
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <></>
                )}
              </div>
              <div className="w-6/12">
                <div className="rounded text-sm font-semibold bg-gray-200 px-4 py-2 sm:gap-4 sm:px-4 text-gray-900">
                  {t("Test Runs")}
                </div>
                {testRunList.map((ele: any) => {
                  return (
                    <div key={ele.id} className="border-b mt-4 pb-2 pl-2">
                      <Link
                        to={`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTRUNS}/${ele.id}/${testRunRoutes.TEST_RESULTS}`}
                        className="text-gray-900 font-normal text-sm cursor-pointer"
                      >
                        {ele.name}
                      </Link>
                      {ele?.user && ele?.user?.firstName && (
                        <p className="text-xs text-gray-500">
                          {t("By")}{" "}
                          {`${ele?.user.firstName} ${ele?.user?.lastName ? ele.user.lastName : ""
                            }`}{" "}
                          {t("on")}{" "}
                          {dayjs(new Date(ele.createdAt)).format(
                            DateFormat.LONG
                          )}
                        </p>
                      )}
                    </div>
                  );
                })}
                {!testRunList.length && (
                  <>
                    <p className="mt-4 mb-2 text-gray-500 font-normal text-sm">
                      {t("This project does not have any active test run")}.
                    </p>
                    <Button
                      onClick={() => navigateAdd("Test-run")}
                      data-cy="add-test-run"
                      id="show-pop-up"
                      type="button"
                    >
                      {t("Add Test Run")}
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="px-4 py-2 text-gray-900 bg-gray-200 mr-4 text-sm  ml-4 rounded font-semibold">
              <span>{t("Activity")}</span>
              <span className="float-right">
                <span
                  className={` border-gray-600 cursor-pointer ${defaultActivity === "history" ? "font-medium" : ""
                    }`}
                  onClick={() => setDefaultActivity("history")}
                >
                  {t("History")}
                </span>
                <span className="border-l border-gray-600 mx-2"></span>
                <span
                  className={` border-gray-600  cursor-pointer ${defaultActivity === "testChanges" ? "font-medium" : ""
                    }`}
                  onClick={() => loadTestChanges()}
                >
                  {t("Test Changes")}
                </span>
              </span>
            </div>
            <div className="px-4">
              {defaultActivity === "history" &&
                (activityList.length === 0 ? (
                  <NotAvailable text="history" />
                ) : (
                  activityList.map((ele: any) => {
                    return (
                      <div key={ele.date}>
                        <div className="text-gray-900 text-sm my-2">
                          <h1 className="border-b border-gray-900 w-max">
                            {dayjs(ele.date).format(DateFormat.LONG)}
                          </h1>
                        </div>
                        <div>
                          {ele.activities.map((item: any) => {
                            return (
                              <div
                                key={item.id}
                                className="border-b p-2 flex items-center justify-between	"
                              >
                                <div className="flex items-center">
                                  <div>
                                    <span
                                      className={`mr-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-normal text-gray-100 ${item.entity === "MILESTONE"
                                        ? "bg-pink-400"
                                        : "mr-5 bg-purple-400"
                                        }`}
                                    >
                                      <Trans>{item.entity}</Trans>
                                    </span>
                                  </div>
                                  <div>
                                    {item.entity === "TESTRUN" ? (
                                      <Link
                                        to={`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTRUNS}/${item.testSuite.id}/${testRunRoutes.TEST_RESULTS}`}
                                        className="text-gray-900 text-sm font-normal break-normal whitespace-normal w-3/4"
                                      >
                                        {item?.testSuite?.name}
                                      </Link>
                                    ) : (
                                      <Link
                                        to={`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.MILESTONES}/${item.milestone.id}/${milestoneRoutes.MILESTONE}`}
                                        className="text-gray-900 text-sm font-normal break-normal whitespace-normal w-3/4"
                                      >
                                        {item.entity === "MILESTONE"
                                          ? item?.milestone?.name
                                          : item.name}
                                      </Link>
                                    )}
                                  </div>
                                </div>
                                {item?.user && item?.user?.firstName && (
                                  <div className="text-gray-500 text-sm w-1/3 min-w-max text-right">
                                    {item.status === "COMPLETED" ? (
                                      t("Completed")
                                    ) : (
                                      <Trans>{item.status}</Trans>
                                    )}
                                    &nbsp;{t("by")}&nbsp;
                                    {`${item?.user.firstName} ${item?.user?.lastName
                                      ? item.user.lastName
                                      : ""
                                      }`}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ))}
              <div>
                {defaultActivity === "testChanges" &&
                  (testChangeList?.length === 0 ? (
                    <NotAvailable text="test changes" />
                  ) : (
                    <>
                      {testChangeList?.map(
                        (testChange: any, indexOfTestChangeList: number) => {
                          return (
                            <div key={indexOfTestChangeList}>
                              <div className="text-gray-900 text-sm my-2">
                                <h1 className="border-b border-gray-900 w-max">
                                  {dayjs(testChange.date).format(
                                    DateFormat.LONG
                                  )}
                                </h1>
                              </div>
                              {testChange.activities.map(
                                (activity: any, index: number) => (
                                  <div
                                    className="border-b p-2 flex justify-between items-center"
                                    key={index}
                                    ref={
                                      indexOfTestChangeList ===
                                        testChangeList?.length - 1 &&
                                        index ===
                                        testChange?.activities.length - 1
                                        ? lastElementRef
                                        : null
                                    }
                                  >
                                    <div className="flex items-center">
                                      <div>
                                        <span
                                          className={`mr-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-normal text-gray-100 `}
                                          style={
                                            activity.status === "UNTESTED"
                                              ? {
                                                backgroundColor:
                                                  "rgb(151, 151, 151)",
                                              }
                                              : activity.status === "PASSED"
                                                ? {
                                                  backgroundColor:
                                                    "rgb(60, 184, 80)",
                                                }
                                                : {
                                                  backgroundColor:
                                                    "rgb(228, 0, 70)",
                                                }
                                          }
                                        >
                                          <Trans>{activity.status}</Trans>
                                        </span>
                                      </div>
                                      <div
                                        className="text-gray-900 font-normal text-sm cursor-pointer hover:underline break-normal whitespace-normal w-3/4"
                                        onClick={() =>
                                          getDataTestCase(
                                            activity.testCaseResult.testCaseId
                                          )
                                        }
                                      >
                                        {activity.testCaseResult.testCaseTitle}
                                      </div>
                                    </div>

                                    {activity?.user &&
                                      activity?.user?.firstName && (
                                        <div className="text-gray-500 text-sm w-1/3 min-w-max text-right">
                                          {t("Tested by")}{" "}
                                          {activity.user.firstName +
                                            " " +
                                            activity.user.lastName}
                                        </div>
                                      )}
                                  </div>
                                )
                              )}
                            </div>
                          );
                        }
                      )}
                      {loadingTestChange && <div> {t("Loading")}....</div>}
                    </>
                  ))}
              </div>
            </div>
          </div>
          <div className="w-3/12 bg-gray-50 py-4 px-7 2xl:pr-52">
            <div className="bg-gray-200 px-4 py-2 rounded text-sm font-semibold">
              {t("Action")}
            </div>
            <div className="border-b mt-4 pb-2 pl-2">
              <p className="text-gray-900 text-sm">{t("Milestones")}</p>
              <div>
                <AccessControl
                  permission={MilestonePermissions.CREATE_MILESTONE}
                >
                  <Link
                    to={`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.CREATE_MILESTONE}`}
                    className="cursor-pointer  text-xs text-gray-500"
                  >
                    <span className="underline">{t("Add")}</span>&nbsp;&nbsp;|
                  </Link>
                </AccessControl>
                &nbsp;&nbsp;
                <Link
                  to={`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.MILESTONES}`}
                  className="cursor-pointer underline text-xs text-gray-500"
                >
                  {t("View All")}
                </Link>
              </div>
            </div>
            <div className="border-b mt-4 pb-2  pl-2">
              <p className="text-gray-900 text-sm">{t("Test Runs")}</p>
              <div>
                <Link
                  to={`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.CREATE_TESTRUN}`}
                  className="cursor-pointer  text-xs text-gray-500"
                >
                  <span className="underline">{t("Add")}</span>&nbsp;&nbsp;|
                </Link>
                &nbsp;&nbsp;
                <Link
                  to={`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTRUNS}`}
                  className=" cursor-pointer underline text-xs text-gray-500"
                >
                  {t("View All")}
                </Link>
              </div>
            </div>
            <div className="border-b mt-4 pb-2 pl-2">
              <p className="text-gray-900 text-sm">{t("Test Cases")}</p>
              <div>
                <Link
                  to={`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.CREATE_TESTCASE}`}
                  className="cursor-pointer  text-xs text-gray-500"
                >
                  <span className="underline">{t("Add")}</span>&nbsp;&nbsp;|
                </Link>
                &nbsp;&nbsp;
                <Link
                  to={`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTCASES}`}
                  className="cursor-pointer underline text-xs text-gray-500"
                >
                  {t("View All")}
                </Link>
              </div>
            </div>
            <div className="bg-gray-200 px-4 py-2 rounded text-sm font-semibold">
              {t("Todos")}
            </div>
            {todoList.length ? (
              todoList.map((ele: any) => {
                return (
                  <div
                    key={ele.id}
                    className="flex justify-between border-b mt-2 p-2"
                  >
                    <Link
                      to={`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTRUNS}/${ele.id}/${testRunRoutes.TEST_RESULTS}`}
                      className="text-gray-900 text-sm ml-1 cursor-pointer"
                    >
                      {ele.name}
                    </Link>
                    <span className="text-gray-900 text-sm">
                      {ele?.testreport?.total - ele?.testreport?.passed}
                    </span>
                  </div>
                );
              })
            ) : (
              <></>
            )}
          </div>
        </div>
      )}
    </>
  );
}
