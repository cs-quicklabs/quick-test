import { useMemo } from "react";
import { useParams } from "react-router-dom";

import dayjs from "dayjs";

import Loader from "../Loader/Loader";
import Header from "../ProjectDetails/component/Header";
import { DateFormat } from "../Utils/constants/date-format";
import { appRoutes, projectRoutes } from "../Utils/constants/page-routes";

import i18next from "i18next";
import { useQuery } from "@tanstack/react-query";
import { getProjectsDetails } from "../../services/headerServices";
import { getSingleMilestoneDataDetails } from "../../services/milestoneServices";
import BreadCrumb from "../BreadCrumb/BreadCrumb";
import { showError } from "../Toaster/ToasterFun";
import { ToastMessage } from "../Utils/constants/misc";
import TestRunTable from "./Component/TestRunTable";

export default function ViewMilestone() {
  const params = useParams();
  const pid = params.pid;
  const id = params.id;

  const description = useMemo(
    () => (
      <>
        <div className="flex items-center">
          {/* <span className="text-xs">
            <span className="font-medium pr-2">{t("Start Date:")}</span>
            {dayjs(RowData.startDate).format(DateFormat.LONG)}
          </span> */}
          {/* <span className="text-xs mx-2">
            <span className="font-medium px-2 border-l-2 border-gray-500">
              {t("End Date:")}
            </span>
            {dayjs(RowData.endDate).format(DateFormat.LONG)}
          </span> */}
        </div>
      </>
    ),
    []
  );

  const { data: projectDetail } = useQuery({ queryKey: ["projects-data", pid], queryFn: () => getProjectsDetails({ pid }) });
  const {
    data: milestoneDetail,
    isLoading,
    error,
  } = useQuery({ queryKey: ["single-milestone-data", id], queryFn: () => getSingleMilestoneDataDetails({ id }) });

  if (error instanceof Error) {
    const errorMessage =
      error?.message || i18next.t(ToastMessage.SOMETHING_WENT_WRONG);
    showError(errorMessage);
  }

  const breadCrumbDetails = [
    {
      name: "Projects",
      href: `${appRoutes.PROJECTS}`,
      current: false,
      style: "hover:text-blue-600",
      dividerStyle: "hidden",
    },
    {
      name: projectDetail?.name,
      href: `${appRoutes.PROJECTS}/${params?.pid}/${projectRoutes.MILESTONES}`,
      current: false,
      style: "hover:text-blue-600",
      dividerStyle: "h-5 w-5 flex-shrink-0 text-gray-300 hover:text-blue-600",
    },
    {
      name: "Milestone",
      href: `#`,
      current: false,
      style: "te",
      dividerStyle: "h-5 w-5 flex-shrink-0 text-gray-300",
    },
  ];

  return isLoading ? (
    <Loader withoverlay={true} />
  ) : (
    <>
      <BreadCrumb pages={breadCrumbDetails} />
      <div className="bg-gray-50 border-b border-gray-200">
        <Header
          title={milestoneDetail?.name}
          description={description}
          redirectToBack={`${appRoutes.PROJECTS}/${params?.pid}/${projectRoutes.MILESTONES}`}
          text={milestoneDetail?.description}
        />
      </div>
      <div className="mx-auto w-full grow lg:flex">
        <div className="flex-1 xl:flex">
          <div className="xl:flex-1">
            <div className="flow-root">
              <div className="-my-2 overflow-x-auto ">
                <div className="inline-block min-w-full py-3 align-middle sm:px-6 lg:px-8 2xl:pl-52">
                  <div className="overflow-hidden">
                    <TestRunTable
                      RowData={milestoneDetail?.testsuites}
                      endDate={milestoneDetail?.endDate}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="shrink-0 border-t border-gray-200 px-4 py-6 sm:px-6 lg:w-96 lg:border-l lg:border-t-0 lg:pr-8 xl:pr-6 h-screen 2xl:pr-52">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            {milestoneDetail?.name}
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>{milestoneDetail?.description}</p>
          </div>
          <div className="flex justify-between">
            <div className="mt-4 text-sm">
              <label htmlFor="small" className="font-medium text-gray-900">
                Start Date
              </label>
              <p className="text-gray-500">
                {dayjs(milestoneDetail?.startDate).format(DateFormat.LONG)}
              </p>
            </div>
            <div className="mt-4 text-sm">
              <label htmlFor="small" className="font-medium text-gray-900">
                End Date
              </label>
              <p className="text-gray-500">
                {dayjs(milestoneDetail?.endDate).format(DateFormat.LONG)}
              </p>
            </div>
          </div>
          <div className="flex justify-between">
            {/* <div className="mt-4 text-sm">
              <label htmlFor="small" className="font-medium text-gray-900">
                Created By
              </label>
              <p className="text-gray-500">Aashish Dhawan</p>
            </div> */}
            <div className="mt-4 text-sm">
              <label htmlFor="small" className="font-medium text-gray-900">
                Created on
              </label>
              <p className="text-gray-500">
                {dayjs(milestoneDetail?.createdAt).format(DateFormat.LONG)}
              </p>
            </div>
          </div>
          {/* <div className="mt-5">
            <button className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
              Add Another Test Run
            </button>
          </div> */}
        </div>
      </div>
    </>
  );
}
