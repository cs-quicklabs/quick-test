import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import dayjs from "dayjs";

import axiosService from "../Utils/axios";
import { appRoutes, projectRoutes } from "../Utils/constants/page-routes";
import CancelButton from "../Button/cancelButton";
import { DateFormat } from "../Utils/constants/date-format";
import { ToastMessage } from "../Utils/constants/misc";
import Loader from "../Loader/Loader";
import PreviewMarkdown from "../Common/PreviewMarkdown";
import { showError } from "../Toaster/Toast";
import ReferenceMenu from "../Defects/ReferenceMenu";
import AddReferenceModal from "../Defects/AddReferenceModal";
import MapReferenceModal from "../Defects/MapReferenceModal";
import DefectDetailsModal from "../Defects/DefectDetailsModal";
import { Trans, useTranslation } from "react-i18next";
import i18next from "i18next";

const TestView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const [data, setData] = useState<any>({
    title: "",
    preconditions: "",
    steps: "",
    expectedResults: "",
    sectionName: "",
    priority: "",
  });
  const [loading, setLoading] = useState(true);
  const [showAddReferencePopup, setShowAddReferencePopup] =
    useState<boolean>(false);
  const [showMapReferencePopup, setShowMapReferencePopup] =
    useState<boolean>(false);

  const [isJiraIntegrated, setIsJiraIntegrated] = useState(false);
  const serialNumber = searchParams.get("number");

  const getTestCaseDetail = async (projectId: any, id: any) => {
    try {
      const response = await axiosService.get(
        `/projects/${projectId}/test-cases/${id}`
      );
      setData(response?.data?.data);
      setLoading(false);
    } catch (err) {
      if (err?.response?.data?.message) {
        showError(err.response?.data?.message);
      } else {
        showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
      }
      setLoading(false);
    }
  };
  useEffect(() => {
    if (params?.id && params?.pid) {
      getTestCaseDetail(params?.pid, params?.id);
      setIsJiraIntegrated(() => {
        if (localStorage.getItem("isJiraIntegrated") === "true") return true;
        else return false;
      });
    }
  }, [params]);
  const returnToPage = () => {
    navigate(`${appRoutes.PROJECTS}/${params?.pid}/${projectRoutes.TESTCASES}`);
  };
  return (
    <>
      {loading && <Loader withoverlay={true} />}
      <div>
        <div className="pl-8 pt-4 pb-4 sm:flex sm:items-center sm:justify-between sm:pr-5 lg:pr-7">
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-lg font-medium bg-indigo-100 text-indigo-800">
              #{serialNumber}
            </span>
            <h3 className="px-4 inline text-lg leading-6 font-medium text-gray-900">
              {data?.title}
            </h3>
          </div>
          <div className="flex align-items-center space-x-3">
            {isJiraIntegrated ? (
              <ReferenceMenu
                setShowAddReferencePopup={setShowAddReferencePopup}
                setShowMapReferencePopup={setShowMapReferencePopup}
              />
            ) : null}
            <CancelButton
              id="back-test-view"
              onClick={returnToPage}
              className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
              type="button"
            >
              {t("Back")}
            </CancelButton>
          </div>
        </div>
        <div className="min-h-full h-auto flex flex-col-reverse md:flex-row md:flex-grow border-t border-gray-200">
          <div className="md:w-8/12 lg:w-9/12 p-4">
            <div className="">
              <dl>
                <div className="bg-gray-50 px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">
                    {t("Preconditions")}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-normal break-all">
                    <PreviewMarkdown markdown={data?.preconditions} />
                  </dd>
                </div>
                <div className="bg-white px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">
                    {t("Steps")}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-normal break-all">
                    <PreviewMarkdown markdown={data?.steps} />
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">
                    {t("Expected Results")}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-normal break-all">
                    <PreviewMarkdown markdown={data?.expectedResults} />
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          <aside className="md:w-4/12 lg:w-3/12 lg:border-l lg:border-gray-200 px-6 py-4 space-y-6">
            <div>
              <h3 className="text-base leading-6 font-medium text-gray-900">
                {t("Test Case Details")}
              </h3>
              <span className="mt-2 max-w-xl text-sm text-gray-500 font-normal block">
                {t("View the details of the test case.")}
              </span>
            </div>
            <div className="space-y-6">
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  {t("Section")}
                </span>
                <span className="block text-sm text-gray-500">
                  {data?.section?.name}
                </span>
              </div>
              {data?.defect?.pluginKey ? (
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    {t("Reference")}
                  </span>
                  <DefectDetailsModal pluginKey={data.defect.pluginKey} />
                </div>
              ) : null}
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  {t("Priority")}
                </span>
                <span className="block text-sm text-gray-500">
                  <Trans>{data?.executionPriority}</Trans>
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  {t("Created on")}
                </span>
                <span className="block text-sm text-gray-500">
                  {dayjs(data?.createdAt).format(DateFormat.LONG)}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  {t("Updated on")}
                </span>
                <span className="block text-sm text-gray-500">
                  {dayjs(data?.updatedAt).format(DateFormat.LONG)}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showAddReferencePopup && (
        <AddReferenceModal
          title={data.title}
          id={data.testcaseId}
          testcaseId={data.id}
          projectId={params?.pid}
          setOpen={setShowAddReferencePopup}
          getTestCaseDetail={getTestCaseDetail}
          open={showAddReferencePopup}
        />
      )}
      {showMapReferencePopup && (
        <MapReferenceModal
          testcaseId={data.id}
          projectId={params?.pid}
          setOpen={setShowMapReferencePopup}
          open={showMapReferencePopup}
          getTestCaseDetail={getTestCaseDetail}
        />
      )}
    </>
  );
};
export default TestView;
