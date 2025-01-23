import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import Badge from "../../Badge";
import DeleteConfirmationModal from "../../Common/DeleteModal";
import { showError, showSuccess } from "../../Toaster/ToasterFun";
import axiosService from "../../Utils/axios";
import {
  appRoutes,
  projectRoutes,
  testRunRoutes,
} from "../../Utils/constants/page-routes";
import dayjs from "dayjs";
import { DateFormat } from "../../Utils/constants/date-format";
import Loader from "../../Loader/Loader";
import { Tooltip } from "react-tooltip";
interface Props {
  RowData: (string | number)[];
  editTestRun: (id: string) => void | any;
  getTestRun: () => void | any;
  projectName: string;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export default function Table(props: Props) {
  const { t } = useTranslation(["common"]);
  const [showModal, toggleModal] = useState(false);
  const [modalMsg, setMsg] = useState(<></>);
  const [selectedId, setSelectedId] = useState("");
  const params = useParams();
  const testChangeRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = (node: any) => {
    if (testChangeRef?.current) testChangeRef?.current?.disconnect?.();

    testChangeRef.current = new IntersectionObserver((entries) => {
      if (entries?.[0]?.isIntersecting && props.hasNextPage) {
        props.fetchNextPage();
      }
    });

    if (node) testChangeRef?.current?.observe?.(node);
  };

  const openDeleteModal = (value: any) => {
    setSelectedId(value?.id);
    const msg = (
      <>
        {t("Are you sure want to delete the test run")}{" "}
        <span className="font-semibold text-red-500">{`"${value?.name}"`}</span>
        ?
      </>
    );
    setMsg(msg);
    toggleModal(true);
  };

  const deleteTestRun = async () => {
    toggleModal(false);
    try {
      const response = await axiosService.delete(
        `/test-suites/${selectedId}`,
        {}
      );
      if (response?.data?.success) {
        showSuccess(response.data.message);
        props.getTestRun();
      }
    } catch (err) {
      if (err?.response?.data) {
        showError(err.response.data.message);
      }
    }
  };
  return (
    <>
      {showModal && (
        <DeleteConfirmationModal
          msg={modalMsg}
          open={showModal}
          toggleModal={toggleModal}
          delete={deleteTestRun}
        />
      )}
      <div className="flex flex-col overflow-hidden ">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div
            className="py-1 align-middle inline-block min-w-full sm:px-6 lg:pr-10 lg:pl-8"
            id="test-run-report"
          >
            <div
              id="pdf-header"
              className=" flex item-center justify-center font-medium text-gray-900 py-3 hidden"
            >
              {props?.projectName}&nbsp;{t("Project Test Run Report")}
            </div>
            <div
              className={` border-b border-gray-200 ${props.RowData?.length < 1 && "hidden"
                } `}
            >
              <table className="min-w-full ">
                <tbody className="bg-white divide-y divide-gray-200">
                  {props.RowData &&
                    props.RowData?.map((value: any, i) => (
                      <tr key={i} className={`rounded`} ref={lastElementRef}>
                        <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0 w-full hover:underline cursor-pointer">
                          <Link
                            to={`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTRUNS}/${value?.id}/${testRunRoutes.TEST_RESULTS}`}
                            data-cy={"test-run-" + i}
                          >
                            <span>{value?.name}</span>
                            <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500 font-normal">
                              {value?.status === "COMPLETED" ? (
                                <p className="whitespace-nowrap">
                                  Completed on{" "}
                                  {dayjs(value?.testreport?.createdAt).format(
                                    DateFormat.LONG
                                  )}
                                </p>
                              ) : (
                                <p className="whitespace-nowrap">
                                  Started on{" "}
                                  {dayjs(value?.testreport?.createdAt).format(
                                    DateFormat.LONG
                                  )}
                                </p>
                              )}
                              <svg
                                viewBox="0 0 2 2"
                                className="h-0.5 w-0.5 fill-current"
                              >
                                <circle cx="1" cy="1" r="1"></circle>
                              </svg>{" "}
                              <p className="whitespace-nowrap">
                                {value?.testreport?.total}{" "}
                                {value.testreport?.total > 1
                                  ? t("Test Cases")
                                  : t("Test Case")}
                              </p>
                              {value.status === "COMPLETED" && (
                                <>
                                  <svg
                                    viewBox="0 0 2 2"
                                    className="h-0.5 w-0.5 fill-current"
                                  >
                                    <circle cx="1" cy="1" r="1"></circle>
                                  </svg>
                                  <p className="whitespace-nowrap">
                                    {value?.testreport?.passed} Passed,{" "}
                                    {value?.testreport?.failed} Failed,{" "}
                                    {value?.testreport?.blocked} Blocked
                                  </p>
                                </>
                              )}
                            </div>
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                          <div className="flex justify-end text-center items-center gap-2 text-xs">
                            {value.status === "PENDING" && (
                              <Badge className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-600/20">
                                {t("Pending")}
                              </Badge>
                            )}
                            {value.status === "INPROGRESS" && (
                              <Badge className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                                {t("In Progress")}
                              </Badge>
                            )}
                            {value.status === "COMPLETED" && (
                              <Badge className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                {t("Completed")}
                              </Badge>
                            )}
                            {value.status === "BLOCKED" && (
                              <Badge className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                {t("Blocked")}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex justify-end text-center items-center gap-2 text-xs">
                            <PencilSquareIcon
                              data-tooltip-id="test-run-table-tooltip-id"
                              data-tooltip-content={t("Edit")}
                              data-cy={"test-run-" + i + "-edit"}
                              onClick={() => props.editTestRun(value.id)}
                              className="text-indigo-500 h-4 w-4 cursor-pointer"
                            />
                            <div
                              data-tooltip-id="test-run-table-tooltip-id"
                              data-tooltip-content={t("Delete")}
                            >
                              <TrashIcon
                                data-tooltip-id="test-run-table-tooltip-id"
                                data-tooltip-content={t("Delete")}
                                data-cy={"test-run-" + i + "-delete"}
                                onClick={() => openDeleteModal(value)}
                                className="text-red-400 h-4 w-4 cursor-pointer"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <div className="flex items-center justify-center">
                {props.isFetchingNextPage && <Loader />}
              </div>
              <Tooltip id="test-run-table-tooltip-id" />
            </div>
          </div>
        </div>
      </div>
      {props.RowData?.length === 0 && (
        <div className="flex justify-center items-center content-center text-gray-500 text-xs font-normal my-2">
          {t("No test run added yet.")}
        </div>
      )}
    </>
  );
}
