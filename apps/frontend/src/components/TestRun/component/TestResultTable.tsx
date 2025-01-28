import { useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import Badge from "../../Badge";
import DropDownMenuButton from "./DropDownMenuButton";
import PopUp from "./PopUp";
import axiosService from "../../Utils/axios";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../Button";
import i18next from "i18next";
import { showError, showSuccess } from "../../../components/Toaster/ToasterFun";
import { ToastMessage } from "../../Utils/constants/misc";
import Loader from "../../Loader/Loader";
import SidePanel from "../../TestCase/component/SidePanel";
import SidePanelData from "../../TestCase/component/SidePanelTestCaseData";
import { appRoutes, projectRoutes, testRunRoutes } from "../../Utils/constants/page-routes";
import { SerialisedTestCaseType } from "../../../types/testCaseTypes";
import { downloadFile } from "../../Utils/helpers";

interface payloadType {
  status: string;
  comment?: string;
  image?: string;
  addCommentJira: boolean;
}
interface Props {
  RowData: (string | number)[];
  submitStatus: (id: string, data: any) => void | any;
  seTestCaseNum: (num: number) => void | any;
  setPrinterIcon: any;
  getTestRunDetais: any;
  getTestRunResults: any;
  totalUserData: any;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  refetch: () => void;
}

interface statusData {
  status: string;
  comment?: string;
  image?: string;
}

export default function Table({
  RowData,
  getTestRunDetais,
  seTestCaseNum,
  getTestRunResults,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  refetch,
}: Props) {
  const { t } = useTranslation(["common"]);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [statusData, setStatusData] = useState({
    status: "",
    id: "",
  });
  const [defectStatus, setDefectStatus] = useState({});
  const [buttonLoader, setButtonLoader] = useState(false);
  const testChangeRef = useRef<IntersectionObserver | null>(null);
  const [selectedTestCase, setSelectedTestCase] =
    useState<SerialisedTestCaseType | null>(null);

  const params = useParams();
  const navigate = useNavigate();

  const submitData = (
    text: string,
    imageUrl: string,
    addCommentJira: boolean,
    doNotUpdate?: boolean
  ) => {
    if (doNotUpdate) return setOpenPopUp(false);

    const _submitData = () => {
      const payload: payloadType = {
        status: statusData.status,
        addCommentJira,
      };
      if (text) payload.comment = text;
      if (imageUrl) payload.image = imageUrl;

      return payload;
    };
    submitStatus(statusData.id, _submitData());
    setOpenPopUp(false);
  };

  const printDocument = async () => {
    const response = await axiosService.post(
      `/projects/${params.pid}/test-suites/${params.id}/pdf`,
      {}
    );
    downloadFile(response?.data?.data);
  };

  const submitStatus = async (id: string, Data: statusData) => {
    try {
      const response = await axiosService.put(
        `/test-suites/test-results/${id}`,
        Data
      );
      showSuccess(response?.data?.message);
      // getTestRunResults();
      getTestRunDetais();
      refetch();
      return true;
    } catch (err) {
      if (err.response && err.response.data) {
        showError(err.response.data.message);
        if (err.response.status === 401) {
          localStorage.clear();
          sessionStorage.clear();
          navigate("/");
        }
      } else showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
      return false;
    }
  };

  const lastElementRef = (node: any) => {
    if (testChangeRef?.current) testChangeRef?.current?.disconnect?.();

    testChangeRef.current = new IntersectionObserver((entries) => {
      if (entries?.[0]?.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    if (node) testChangeRef?.current?.observe?.(node);
  };

  const onClickNavigate = () => {
    seTestCaseNum(selectedTestCase?.index!)
  }

  return (
    <>
      {/* Side Panel logic to open individual test case */}
      <SidePanel
        isOpen={Boolean(selectedTestCase)}
        setIsOpen={setSelectedTestCase}
        expandRedirectTo={
          selectedTestCase
            ? `${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTRUNS}/${params.id}/${testRunRoutes.TEST_RESULTS}`
            : ""
        }
        onClickNavigate={onClickNavigate}
      >
        {selectedTestCase && <SidePanelData testCase={selectedTestCase} />}
      </SidePanel>

      <div className="border-t">
        <div className="grid grid-cols-3 min-h-screen">
          <div
            className={`col-span-2 border-r border-gray-200 min-w-full ${RowData?.length < 1 && "hidden"
              }`}
          >
            <div className="col-span-2 min-w-full">
              <table
                className={`min-w-full divide-y divide-gray-200 ${RowData?.length === 1
                  ? "mb-24"
                  : RowData?.length === 0
                    ? ""
                    : ""
                  }`}
              >
                <thead className="bg-gray-50 border-b  border-gray-200">
                  <tr>
                    <th
                      scope="col"
                      className="px-8 text-left text-sm font-semibold text-gray-900 w-1/12 2xl:pl-52"
                    >
                      {t("Sr.No.")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-2 text-left text-sm font-semibold text-gray-900 w-8/12"
                    >
                      {t("Title")}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-right text-sm font-semibold text-gray-900 w-8/12"
                    >
                      {t("Status")}
                    </th>
                    <th
                      scope="col"
                      className="border-b border-gray-200 bg-gray-50 px-8 py-2 text-left text-sm font-semibold text-gray-900"
                    >
                      {t("Options")}
                    </th>
                  </tr>
                </thead>
                {RowData ? (
                  <tbody className="bg-white divide-y divide-gray-200">
                    {RowData.map((value: any, i) => (
                      <tr key={i} className={`rounded`} ref={lastElementRef}>
                        <td className="px-8 py-2 whitespace-nowrap text-sm font-normal text-gray-900 2xl:pl-52">
                          <span
                            onClick={() => {
                              seTestCaseNum(1 + i);
                            }}
                            className="truncate hover:underline cursor-pointer"
                          >
                            <span>{i + 1}</span>
                          </span>
                        </td>
                        <td className="px-6 py-2 font-normal text-sm text-gray-900">
                          <span
                            onClick={() => {
                              let newObj = {
                                title: value?.testCaseTitle,
                                preconditions: value?.testCasePreconditions,
                                testcaseId: value?.testcaseId,
                                sectionName: value?.SectionName,
                                steps: value?.testCaseSteps,
                                executionPriority: value?.testCaseExecutionPriority,
                                expectedResults: value?.testCaseExpectedResults,
                                serialNumber: value?.testCaseId,
                                checked: false,
                                sectionId: value?.testcaseId,
                                createdAt: value?.createdAt,
                                updatedAt: value?.updatedAt,
                                priority: value?.testCaseExecutionPriority,
                                id: value?.id,
                                createdBy: value?.createdBy,
                                index: i + 1,
                              }
                              setSelectedTestCase(newObj)
                            }}
                            className="truncate break-normal whitespace-normal hover:underline cursor-pointer"
                          >
                            {value?.testCaseTitle}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-normal">
                          {value?.status === "PASSED" && (
                            <Badge className="bg-green-100 text-green-800">
                              <Trans>{value?.status.toLowerCase()}</Trans>
                            </Badge>
                          )}
                          {value?.status === "FAILED" && (
                            <Badge className="bg-red-100 text-red-800">
                              <Trans>{value?.status.toLowerCase()}</Trans>
                            </Badge>
                          )}
                          {value?.status === "UNTESTED" && (
                            <Badge className="bg-gray-100 text-gray-800">
                              <Trans>{value?.status.toLowerCase()}</Trans>
                            </Badge>
                          )}
                          {value?.status === "BLOCKED" && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Trans>{value?.status.toLowerCase()}</Trans>
                            </Badge>
                          )}
                        </td>
                        <td className="pr-6">
                          <DropDownMenuButton
                            value={value}
                            index={i}
                            setStatusData={setStatusData}
                            statusData={statusData}
                            setOpenPopUp={setOpenPopUp}
                            RowData={RowData}
                            setDefectStatus={setDefectStatus}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : null}
              </table>
              <div className="flex items-center justify-center">
                {isFetchingNextPage && <Loader />}
              </div>
            </div>
          </div>
          {RowData?.length === 0 && (
            <div className="col-span-2 border-r border-gray-200 min-w-full pt-2 justify-center text-center content-center text-gray-500 text-xs font-normal">
              {t("No active test runs in this milestone.")}
            </div>
          )}
          <div className="col-span-1 mx-4 my-4 2xl:pr-52">
            <h3 className="text-base leading-6 font-medium text-gray-900">
              {t("Test Run")}
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500 font-normal">
              <p>
                {t(
                  "A test run is a collection of test cases which are tested to create a report about passing and failing tests."
                )}
              </p>
            </div>

            <div className="mt-5">
              <Button
                id="generate-button"
                onClick={async () => {
                  setButtonLoader(true);
                  await printDocument();
                  setButtonLoader(false);
                }}
                loading={buttonLoader}
                type="button"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 "
              >
                {t("Generate Report")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {openPopUp ? (
        <PopUp
          open={openPopUp}
          submitData={submitData}
          defectStatus={defectStatus}
          refetch={refetch}
        />
      ) : null}
    </>
  );
}
