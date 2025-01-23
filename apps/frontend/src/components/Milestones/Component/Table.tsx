import { useState } from "react";

import dayjs from "dayjs";
import { CheckCircleIcon as CheckCircleOutline } from "@heroicons/react/24/outline";
import {
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { Tooltip } from "react-tooltip";
import Badge from "../../Badge";

import axiosService from "../../Utils/axios";
import ConfirmModal from "../../Common/ConfirmModal";
import { DateFormat } from "../../Utils/constants/date-format";
import DeleteConfirmationModal from "../../Common/DeleteModal";
import { showError, showSuccess } from "../../Toaster/ToasterFun";
import { useTranslation } from "react-i18next";
import AccessControl from "../../AccessControl";
import { MilestonePermissions } from "../../Utils/constants/roles-permission";
import { Link, useParams } from "react-router-dom";
import {
  appRoutes,
  milestoneRoutes,
  projectRoutes,
} from "../../Utils/constants/page-routes";
import useAccessControl from "../../AccessControl/useAccessControl";
import { NO_PERMISSION_TOOLTIP_MESSAGE } from "../../Utils/constants/misc";

interface PropsType {
  RowData?: {
    createdAt: string;
    description: string;
    endDate: string;
    id: string;
    name: string;
    startDate: string;
    status: string;
    updatedAt: string;
    testsuites: any[];
  }[];
  editMilestone: (id: string) => void | any;
  getMilestones: () => void | any;
}

export default function Table({
  RowData,
  editMilestone,
  getMilestones,
}: PropsType) {
  const [ShowConfirmModal, setShowConfirmModal] = useState({
    open: false,
    message: <></>,
    id: "",
  });

  const { t } = useTranslation(["common"]);
  const [state, setstate] = useState({
    showModal: false,
    modalMsg: <></>,
    selectedId: "",
  });
  const params = useParams();

  const isMilestoneDeleteable = useAccessControl({
    permission: MilestonePermissions.DELETE_MILESTONE,
  });

  const openDeleteModal = (value: any) => {
    const msg = (
      <>
        {t("Are you sure want to delete this Milestone")}{" "}
        <span className="font-semibold text-red-500">{`"${value.name}"`}</span>{" "}
        ?
      </>
    );
    setstate({ showModal: true, modalMsg: msg, selectedId: value?.id });
  };

  const deleteMilestone = async () => {
    setstate({ ...state, showModal: false });
    try {
      const response = await axiosService.delete(
        `/milestones/${state.selectedId}`,
        {}
      );
      if (response?.data?.success) {
        showSuccess(response.data.message);
        getMilestones();
      }
    } catch (err) {
      if (err?.response?.data) {
        showError(err.response.data.message);
      }
    }
  };

  const changeStatus = async () => {
    setShowConfirmModal({
      ...ShowConfirmModal,
      open: false,
    });
    try {
      const response = await axiosService.put(
        `/milestones/${ShowConfirmModal.id}/status`,
        {
          status: "COMPLETED",
        }
      );
      if (response?.data?.success) {
        showSuccess(response.data.message);
        getMilestones();
      }
    } catch (err) {
      if (err?.response?.data) {
        showError(err.response.data.message);
      }
    }
  };

  return (
    <>
      <DeleteConfirmationModal
        msg={state.modalMsg}
        open={state.showModal}
        toggleModal={(val: boolean) => setstate({ ...state, showModal: val })}
        delete={deleteMilestone}
      />

      <ConfirmModal
        handleCancel={() =>
          setShowConfirmModal({ ...ShowConfirmModal, open: false })
        }
        handleConfirm={() => changeStatus()}
        message={ShowConfirmModal.message}
        open={ShowConfirmModal.open}
      />

      <div className="flex flex-col overflow-hidden">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div
            className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-10"
            id="test-run-list"
          >
            <div className="overflow-hidden ">
              <table
                className={`min-w-full divide-y divide-gray-200 mb-6 mx-4 2xl:mx-0`}
              >
                <tbody className="bg-white divide-y divide-gray-200">
                  {RowData?.map((value, i) => (
                    <tr key={i} className={`rounded`}>
                      <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0 w-full hover:underline cursor-pointer px-4 2xl:pl-2">
                        <Link
                          to={`${appRoutes.PROJECTS}/${params?.pid}/${projectRoutes.MILESTONES}/${value.id}/${milestoneRoutes.MILESTONE}`}
                          className="truncate font-medium text-sm text-gray-900 hover:underline cursor-pointer"
                        >
                          <span>{value?.name}</span>
                        </Link>
                        <Link
                          to={`${appRoutes.PROJECTS}/${params?.pid}/${projectRoutes.MILESTONES}/${value.id}/${milestoneRoutes.MILESTONE}`}
                        >
                          <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500 font-normal">
                            <p className="whitespace-nowrap truncate">
                              {/* {value.description} */}
                              {value.description
                                .split(" ")
                                .slice(0, 6)
                                .join(" ")}
                            </p>
                          </div>
                        </Link>
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                        <p>
                          {value.testsuites.length <= 1
                            ? `${value.testsuites.length} active Test run`
                            : `${value.testsuites.length} active Test runs`}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                        {value.status === "COMPLETED"
                          ? `Done on ${dayjs(value.endDate).format(
                            DateFormat.MEDIUM
                          )}`
                          : `Due on ${dayjs(value.endDate).format(
                            DateFormat.MEDIUM
                          )}`}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                        <div className="flex justify-end text-center items-center gap-2 text-xs">
                          {value.status === "START" && (
                            <Badge className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-600/20">
                              {t("Pending")}
                            </Badge>
                          )}
                          {value.status === "OPEN" && (
                            <Badge className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                              {t("In Progress")}
                            </Badge>
                          )}
                          {value.status === "COMPLETED" && (
                            <Badge className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              {t("Completed")}
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-normal">
                        <div className="flex justify-end">
                          <AccessControl
                            permission={MilestonePermissions.UPDATE_MILESTONE}
                          >
                            <PencilSquareIcon
                              data-tooltip-id="table-tooltip-id"
                              data-tooltip-content={t("Edit")}
                              onClick={() => editMilestone(value.id)}
                              className="text-indigo-500 h-4 w-4 cursor-pointer mr-3"
                            />
                          </AccessControl>
                          {isMilestoneDeleteable ? (
                            <button
                              data-tooltip-id="table-tooltip-id"
                              data-tooltip-content={t("Delete")}
                              onClick={() => openDeleteModal(value)}
                            >
                              <TrashIcon className="text-red-400 h-4 w-4 mr-3 cursor-pointer" />
                            </button>
                          ) : (
                            <button
                              data-tooltip-id="table-tooltip-id"
                              data-tooltip-content={NO_PERMISSION_TOOLTIP_MESSAGE}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                            >
                              <TrashIcon className="text-red-400 h-4 w-4 mr-3 cursor-not-allowed" />
                            </button>
                          )}
                          {value.status === "OPEN" ? (
                            <div
                              data-tooltip-id="table-tooltip-id"
                              data-tooltip-content={t("Mark as Complete")}
                            >
                              <AccessControl
                                permission={
                                  MilestonePermissions.UPDATE_MILESTONE_STATUS
                                }
                              >
                                <CheckCircleOutline
                                  onClick={() => {
                                    setShowConfirmModal({
                                      message: (
                                        <>
                                          {t("Are you sure you want to mark")}{" "}
                                          <span className="font-medium text-indigo-500">
                                            {`"${value.name}"`}
                                          </span>{" "}
                                          {t("as complete?")}
                                        </>
                                      ),
                                      id: value.id,
                                      open: true,
                                    });
                                  }}
                                  className="text-indigo-600 h-4 w-4 cursor-pointer mr-1"
                                />
                              </AccessControl>
                            </div>
                          ) : (
                            <div
                              data-tooltip-id="table-tooltip-id"
                              data-tooltip-content={t("Completed")}>
                              <CheckCircleIcon className="text-green-500 h-5 w-5 mr-1" />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Tooltip id="table-tooltip-id" />
          </div>
        </div>
      </div>
    </>
  );
}
