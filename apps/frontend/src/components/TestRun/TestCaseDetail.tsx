import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import dayjs from "dayjs";

import axiosService from "../Utils/axios";
import { DateFormat } from "../Utils/constants/date-format";
import { ToastMessage } from "../Utils/constants/misc";
import Loader from "../Loader/Loader";
import { showError } from "../Toaster/ToasterFun";

import DropDownMenuButton from "./component/DropDownMenuButton";
import Pagination from "./component/Pagination";
import PopUp from "./component/PopUp";
import PreviewMarkdown from "../Common/PreviewMarkdown";
import DefectDetailsModal from "../Defects/DefectDetailsModal";
import { Trans, useTranslation } from "react-i18next";
import i18next from "i18next";
import Badge from "../Badge/Badge";
import ImageViewer from "../ImageViewer/ImageViewer";

interface payloadType {
  status: string;
  comment?: string;
  image?: string;
  addCommentJira: boolean;
  refetch: () => void;
}

const TestCaseDetail = ({ page, submitStatus, refetch }: any) => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const params = useParams();

  const [openPopUp, setOpenPopUp] = useState(false);
  const [statusData, setStatusData] = useState({
    status: "",
    id: "",
  });
  const [defectStatus, setDefectStatus] = useState<any>({});
  const [showModal, setShowModal] = useState<boolean>(false);

  const submitData = async (
    text: string,
    imageUrl: string,
    addCommentJira: boolean,
    doNotUpdate?: boolean
  ) => {
    if (doNotUpdate) return setOpenPopUp(false);
    setOpenPopUp(false);

    const _submitData = () => {
      const payload: payloadType = {
        status: statusData.status,
        addCommentJira,
        refetch,
      };
      if (text) payload.comment = text;
      if (imageUrl) payload.image = imageUrl;

      return payload;
    };
    await submitStatus(statusData.id, _submitData());
    getTestRunResult();
  };

  const [paginationData, setPaginationData] = useState({
    itemCount: 0,
    page: 0,
    pageCount: 0,
    take: 0,
  });

  interface DataType {
    comment: null | string;
    id: string;
    sectionDescription: string;
    sectionName: string;
    status: string;
    testCaseExpectedResults: string;
    testCaseId: number | string;
    testCasePreconditions: string;
    testCaseSteps: string;
    testCaseTitle: string;
    createdAt: string;
    updatedAt: string;
    testCaseExecutionPriority: string;
    image: string;
    defect: any;
  }

  const [data, setData] = useState<DataType>({
    comment: "",
    id: "",
    sectionDescription: "",
    sectionName: "",
    status: "",
    testCaseExpectedResults: "",
    testCaseId: "",
    testCasePreconditions: "",
    testCaseSteps: "",
    testCaseTitle: "",
    createdAt: "",
    updatedAt: "",
    testCaseExecutionPriority: "",
    image: "",
    defect: {},
  });

  const [PageNum, setPageNum] = useState(page);
  const [loading, setLoading] = useState(true);

  const getTestRunResult = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosService.get(
        `/test-suites/${params.id}/test-results?order=ASC&page=${PageNum}&take=1`
      );
      setData(response?.data?.data?.data?.[0]);
      setPaginationData(response.data.data.meta);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data) {
        if (err.response.status === 401) {
          localStorage.clear();
          sessionStorage.clear();
          navigate("/");
          return;
        }
        showError(err.response.data.message);
      } else showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
    }
  }, [PageNum, navigate, params.id]);

  useEffect(() => {
    getTestRunResult();
  }, [PageNum, getTestRunResult]);

  return (
    <>
      <PopUp
        open={openPopUp}
        submitData={submitData}
        defectStatus={defectStatus}
        refetch={refetch}
      />

      {loading && <Loader withoverlay={true} />}
      <div className="pt-2 pb-4 px-8 sm:flex sm:items-center sm:justify-between bg-gray-50 2xl:px-52">
        <div className="flex flex-grow justify-between items-center">
          <div className="pb-1 flex items-center">
            <span className="inline-flex items-center flex-shrink-0 px-2.5 py-0.5 rounded-md text-base font-medium bg-indigo-100 text-indigo-800">
              #{data?.testCaseId}
            </span>
            <p className="px-4 text-base font-medium text-gray-800">
              {data?.testCaseTitle}
            </p>
          </div>
          <div className="flex">
            <Pagination
              setPageNum={setPageNum}
              paginationData={paginationData}
            />
            {data?.status && (
              <div className="w-24">
                <div className={`inline-flex justify-between rounded-md  `}>
                  <Badge
                    className={`mr-2 capitalize flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${data?.status === "PASSED"
                      ? "bg-green-100 text-green-800"
                      : data?.status === "FAILED"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-200 text-gray-00"
                      }`}
                  >
                    <Trans>{data?.status.toLowerCase()}</Trans>
                  </Badge>

                  <DropDownMenuButton
                    value={data}
                    setStatusData={setStatusData}
                    statusData={statusData}
                    setOpenPopUp={setOpenPopUp}
                    setDefectStatus={setDefectStatus}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-screen flex flex-col-reverse md:flex-row md:flex-grow border-t border-gray-200">
        <div className="md:w-8/12 lg:w-9/12 p-4 2xl:pl-52">
          <div className="">
            <dl>
              <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 2xl:pl-0">
                <dt className="text-sm font-medium text-gray-900">
                  {t("Preconditions")}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-normal break-all">
                  <PreviewMarkdown markdown={data?.testCasePreconditions} />
                </dd>
              </div>
              <div className="bg-white px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 2xl:pl-0">
                <dt className="text-sm font-medium text-gray-900">
                  {t("Steps")}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-normal break-all">
                  <PreviewMarkdown markdown={data?.testCaseSteps} />
                </dd>
              </div>
              <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 2xl:pl-0">
                <dt className="text-sm font-medium text-gray-900">
                  {t("Expected Results")}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-normal break-all">
                  <PreviewMarkdown markdown={data?.testCaseExpectedResults} />
                </dd>
              </div>
              <div className="bg-white px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 2xl:pl-0">
                <dt className="text-sm font-medium text-gray-900">
                  {t("Comment")}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-normal break-all">
                  <PreviewMarkdown
                    markdown={data?.comment || t("No comment added")}
                  />
                </dd>
              </div>
              <div className="bg-white px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 2xl:pl-0">
                <dt className="text-sm font-medium text-gray-900">
                  {t("Attached Image")}
                  {data?.image ? (
                    <div className="text-xs font-normal">
                      {t("Click image to view in full size")}
                    </div>
                  ) : null}
                </dt>
                <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2 md:w-1/2">
                  {data?.image ? (
                    <img
                      className="rounded-md cursor-pointer"
                      src={data?.image}
                      alt="Test Case Features"
                      onClick={() => {
                        setShowModal(!showModal);
                      }}
                    />
                  ) : (
                    t("No image attached")
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <aside className="md:w-4/12 lg:w-3/12 p-4 lg:border-l lg:border-gray-200 px-8 py-4 space-y-6 w-screen">
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
                <Trans>{data?.sectionName}</Trans>
              </span>
            </div>
            {data?.defect?.pluginKey ? (
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  {t("Reference")}
                </span>
                <DefectDetailsModal pluginKey={data?.defect?.pluginKey} />
              </div>
            ) : null}
            <div>
              <span className="block text-sm font-medium text-gray-700">
                {t("Priority")}
              </span>
              <span className="block text-sm text-gray-500">
                <Trans>{data?.testCaseExecutionPriority}</Trans>
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
      {showModal && (
        <ImageViewer
          source={data?.image}
          open={showModal}
          setOpen={setShowModal}
          alt={"Test Case Features"}
        />
      )}
    </>
  );
};

export default TestCaseDetail;
