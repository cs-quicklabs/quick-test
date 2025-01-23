import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Tooltip } from "react-tooltip";
import dayjs from "dayjs";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getArchiveMembers } from "../../services/archiveUsers";
import AccessControl from "../AccessControl";
import ConfirmModal from "../Common/ConfirmModal";
import DeleteConfirmationModal from "../Common/DeleteModal";
import Loader from "../Loader/Loader";
import { showError, showSuccess } from "../Toaster/ToasterFun";
import axiosService from "../Utils/axios";
import { DateFormat } from "../Utils/constants/date-format";
import { ArchivePermissions } from "../Utils/constants/roles-permission";
import { ToastMessage } from "../Utils/constants/misc";
import i18next from "i18next";

const ArchivedUsers = () => {
  const { t } = useTranslation(["common"]);
  const [showModal, setShowModal] = useState(false);
  const [ifRestore, setIfRestore] = useState(false);
  const [modalMsg, setModalMsg] = useState(<></>);
  const [selectedId, setSelectedId] = useState("");
  const {
    data: archiveMembers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["archiveMembers"], // This is your query key
    queryFn: getArchiveMembers,  // This is the function to fetch data
  });

  const openConfirmationModal = (
    e: React.MouseEvent<HTMLButtonElement>,
    user: any
  ) => {
    setSelectedId(user.id);
    if (e.currentTarget.value === "remove") {
      const msg = (
        <>
          {t("Are you sure you want to delete the user")}{" "}
          <span className="font-semibold text-red-500">{`"${user?.firstName}"`}</span>
          ?
        </>
      );
      setIfRestore(false);
      setModalMsg(msg);
      setShowModal(!showModal);
    } else {
      const msg = (
        <>
          {t("Are you sure you want to restore the user")}{" "}
          <span className="font-semibold text-red-500">{`"${user?.firstName}"`}</span>
          ?
        </>
      );
      setIfRestore(true);
      setModalMsg(msg);
      setShowModal(!showModal);
    }
  };

  const restoreUsers = useCallback(async () => {
    try {
      const resp = await axiosService.patch(
        `users/${selectedId}/reactivate`,
        {}
      );
      showSuccess(resp.data.message);
      setShowModal(false);
      refetch();
    } catch (err) {
      // console.log(err.message)
    }
  }, [refetch, selectedId]);

  const deleteUsers = useCallback(async () => {
    try {
      const resp = await axiosService.delete(`users/${selectedId}/delete`, {});
      showSuccess(resp.data.message);
      setShowModal(false);
      refetch();
    } catch (err) {
      // console.log(err.messsage)
    }
  }, [refetch, selectedId]);

  if (error instanceof Error) {
    const errorMessage =
      error.message || i18next.t(ToastMessage.SOMETHING_WENT_WRONG);
    showError(errorMessage);
  }

  return (
    <main className="pb-12 lg:col-span-9">
      <div className="overflow-x-auto">
        <div className="flex flex-col px-2 lg:px-0 space-y-6">
          <div className=" pb-2 sm:pb-6 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {t("Archived Users")}
            </h3>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center content-center my-32">
              <Loader />
            </div>
          ) : (
            <table className="w-3/4">
              <tbody className="bg-white divide-y divide-gray-200">
                {archiveMembers?.data?.data?.data?.map(
                  (user: any, idx: number) => (
                    <tr
                      key={user.id}
                      className="flex justify-between py-2 sm:py-3 whitespace-nowrap font-normal text-gray-600"
                    >
                      <td className="flex flex-col gap-2">
                        <div className="font-medium tracking-wide text-md">
                          {user.firstName}
                        </div>
                        <div className="flex text-sm items-center gap-2">
                          <div>
                            <ArchiveBoxIcon
                              className="h-4 w-4 text-gray-400 group-hover:text-gray-500"
                              aria-hidden="true"
                            />
                          </div>
                          <div>
                            {t("Archived on ")}
                            {dayjs(user.deletedAt).format(DateFormat.LONG)}
                            {user.archivedByUser && (
                              <span>
                                {" "}
                                {t("by")} {user.archivedByUser.firstName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="flex text-sm">
                        <button
                          className="mx-2"
                          data-cy={`restore-user-${idx}`}
                          value="restore"
                          onClick={(e) => openConfirmationModal(e, user)}
                        >
                          <AccessControl
                            permission={ArchivePermissions.REACTIVATE_USER}
                          >
                            <span
                              data-tooltip-id="archived-users-tooltip-id"
                              data-tooltip-content={t("Restore Users")}
                            >
                              <ArrowPathIcon
                                className="h-4 w-4 text-indigo-600 group-hover:text-indigo-800"
                                aria-hidden="true"
                              />
                            </span>
                          </AccessControl>
                        </button>
                        <button
                          className="mx-2"
                          data-cy={`delete-user-${idx}`}
                          value="remove"
                          onClick={(e) => openConfirmationModal(e, user)}
                        >
                          <AccessControl
                            permission={ArchivePermissions.DELETE_USER}
                          >
                            <span
                              data-tooltip-id="archived-users-tooltip-id"
                              data-tooltip-content={t("Permanently Delete Users")}
                            >
                              <TrashIcon
                                className="h-4 w-4 text-red-400 group-hover:text-indigo-800"
                                aria-hidden="true"
                              />
                            </span>
                          </AccessControl>
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
              {archiveMembers?.data?.data?.data?.length === 0 && (
                <tfoot>
                  <tr>
                    <td
                      className="text-center text-gray-400 text-base italic my-2"
                      colSpan={5}
                    >
                      {t("No Users archived yet.")}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
          {/* <Pagination setPageNum={setPageNum} paginationData={paginationData} /> */}
        </div>
        <Tooltip id="archived-users-tooltip-id" />
      </div>
      {showModal && ifRestore ? (
        <ConfirmModal
          open={showModal}
          message={modalMsg}
          handleConfirm={restoreUsers}
          handleCancel={() => setShowModal(false)}
        />
      ) : (
        showModal && (
          <DeleteConfirmationModal
            msg={modalMsg}
            open={showModal}
            toggleModal={setShowModal}
            delete={deleteUsers}
          />
        )
      )}
    </main>
  );
};

export default ArchivedUsers;
