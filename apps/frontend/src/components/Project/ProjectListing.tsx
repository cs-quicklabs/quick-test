import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Loader from "../Loader/Loader";
import OverviewCharts from "../ProjectDetails/component/OverviewChart";
import { showError } from "../Toaster/ToasterFun";
import axiosService from "../Utils/axios";
import { DateFormat } from "../Utils/constants/date-format";
import { NoOfDaysForGraph, ToastMessage } from "../Utils/constants/misc";
import { appRoutes, projectRoutes } from "../Utils/constants/page-routes";

import i18next from "i18next";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";

import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../../services/projectPageServices";

export default function Example() {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const daysFromQuery = searchParams.get("days");

  const [grData, setGRData] = useState({});

  const [daysModal, setDaysModal] = useState(false);
  const [numberOfDays, setNumberOfDays] = useState(
    daysFromQuery ? parseInt(daysFromQuery) : NoOfDaysForGraph.DEFAULT
  );

  const [mostActiveResult, setMostActiveResult] = useState([]);
  const [activeProjectData, setActiveProjectData] = useState([]);
  const [isLoadingActiveResults, setIsLoadingActiveResults] = useState(false);

  const colorArr = useMemo(
    () => ["#184BB8", "#5584E9", "#A3BCF3", "#DDE7FB"],
    []
  );

  const { data, isLoading, error } = useQuery({ queryKey: ["all-projects"], queryFn: getProjects });

  if (error instanceof Error) {
    const errorMessage =
      error?.message || i18next.t(ToastMessage.SOMETHING_WENT_WRONG);
    showError(errorMessage);
  }

  const getActiveProject = useCallback(async () => {
    try {
      setIsLoadingActiveResults(true);
      const resp = await axiosService.get(
        `/organizations/active/projects?days=${numberOfDays}`
      );

      if (resp?.data?.data) {
        setIsLoadingActiveResults(false);
        setActiveProjectData(resp.data.data);
        const graphData = resp.data.data;

        const gl: any[] = [];
        const dataSet: any[] = [];
        const data: any[] = [];
        graphData.forEach((ele: any) => {
          gl.push(dayjs(ele.date).format(DateFormat.SHORT));

          data.length = 0;
          ele.projects.forEach((item: any) => {
            if (dataSet.length === 0) {
              dataSet.push({
                project: item.name,
                data: [...data, item.totalTestChanges],
              });
            } else {
              const saveData = dataSet.find((ele) => ele.project === item.name);
              if (saveData) {
                saveData.data = [...saveData.data, item.totalTestChanges];
                data.pop();
              } else {
                dataSet.push({
                  project: item.name,
                  data: [...data, item.totalTestChanges],
                });
              }
            }
          });
        });

        const calculateGraph: any = dataSet
          .map((ele: any) => {
            const sumOfChanges = ele.data.reduce((ele: any, acc: any) => {
              return ele + acc;
            });
            return {
              name: ele.project,
              noOfChanges: sumOfChanges,
            };
          })
          .sort((a: any, b: any) => b.noOfChanges - a.noOfChanges);
        setMostActiveResult(calculateGraph);

        const iterateData = dataSet.map((ele: any, index: number) => {
          return {
            label: ele.project,
            data: [...ele.data],
            backgroundColor: colorArr[index],
          };
        });

        const loopLength = numberOfDays - gl.length;

        const additionalData: any[] = [];

        if (gl.length < numberOfDays) {
          for (let i = 0; i < loopLength; i++) {
            gl.unshift(
              dayjs(gl[0]).subtract(1, "days").format(DateFormat.SHORT)
            );
            additionalData.push(0);
          }
        }
        iterateData.forEach((ele: any) => {
          ele.data = [...additionalData, ...ele.data];
        });

        const dataOfGraph = {
          labels: [...gl],
          datasets: iterateData
            .sort(
              (a, b) =>
                b.data.reduce((total = 0, val) => total + val) -
                a.data.reduce((total = 0, val) => total + val)
            )
            .map((val, i) => ({ ...val, backgroundColor: colorArr[i] })),
        };
        setGRData(dataOfGraph);
      }
    } catch (err) {
      setIsLoadingActiveResults(false);
      if (err?.response?.data) {
        showError(err.response.data.message);
      }
    }
  }, [colorArr, numberOfDays]);

  useEffect(() => {
    getActiveProject();
  }, [getActiveProject]);

  const openDaysModal = () => {
    setDaysModal(true);
  };

  const goToTodos = (projId: string) => {
    navigate(`${appRoutes.PROJECTS}/${projId}/${projectRoutes.TODO}`);
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center content-center my-32">
          <Loader />
        </div>
      ) : (
        <div className="h-full border flex flex-grow overflow-hidden bg-white">
          <Modal
            open={daysModal}
            toggleModal={setDaysModal}
            setNumberOfDays={setNumberOfDays}
            defaultVal={numberOfDays}
            setSearchParams={setSearchParams}
          />
          <div className="flex flex-col w-0 flex-1 overflow-hidden">
            <main className="flex-1 relative overflow-y-auto z-0 focus:outline-none">
              <div className="min-h-full h-auto flex">
                <div className="w-9/12 p-4 pb-14 2xl:ml-52">
                  {isLoadingActiveResults ? (
                    <div className="flex justify-center items-center content-center my-32">
                      <Loader />
                    </div>
                  ) : (
                    <div className="flex">
                      {activeProjectData.length === 0 ? (
                        <div className="overviewChart w-10/12 h-screen ">
                          <div className="flex justify-center items-center content-center my-2 text-gray-500 text-xs font-normal">
                            {t("No chart data found yet.")}
                          </div>
                        </div>
                      ) : (
                        <div
                          className="p-4 overviewChart w-10/12"
                          data-cy="dashboard-chart"
                        >
                          <OverviewCharts dataset={grData} />
                        </div>
                      )}
                      <div>
                        <div className="mt-2 pb-1 pl-6 text-gray-900 text-sm mb-4">
                          {t("Most active")}{" "}
                          <span
                            className="cursor-pointer  "
                            onClick={() => openDaysModal()}
                          >
                            (
                            <span className="underline">
                              {numberOfDays} {t("Days")}
                            </span>
                            )
                          </span>
                        </div>
                        {mostActiveResult.map((ele: any, index: any) => {
                          return (
                            <div key={ele.name} className="mb-4 pl-2">
                              <div className="flex align-center">
                                <div
                                  className="h-4 w-4 mr-2 flex-shrink-0 self-center"
                                  style={{
                                    backgroundColor: `${colorArr[index]}`,
                                  }}
                                ></div>
                                <p className="text-gray-900 font-medium text-sm lg:text-md self-center">
                                  {ele?.name}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500">
                                {ele.noOfChanges} {t("recent test changes")}.
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-3/12 bg-gray-50 px-7 py-4 lg:border-l lg:border-gray-200 2xl:pr-52">
                  {/* <div className="p-4"> */}
                  <div className="bg-gray-200 text-sm px-4 py-2 mb-2 rounded text-gray-900 font-semibold">
                    {t("Todos")}
                  </div>
                  {data?.data?.data.map((ele: any) => {
                    const activeEle = ele.testsuites.length
                      ? ele.testsuites.filter(
                        (item: any) => item.status !== "COMPLETED"
                      )
                      : [];
                    if (!activeEle.length) return null;
                    return (
                      <div
                        className="flex justify-between align-center
                                      text-sm text-gray-500 p-2 border-b-2"
                        key={ele?.id}
                      >
                        <span
                          onClick={() => goToTodos(ele.id)}
                          className="text-gray-900 hover:text-gray-900 hover:underline cursor-pointer"
                        >
                          {ele?.name}
                        </span>
                        <span>{activeEle.length}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </main>
          </div>
        </div>
      )}
    </>
  );
}
