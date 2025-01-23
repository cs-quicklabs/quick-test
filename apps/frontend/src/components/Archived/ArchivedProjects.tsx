import { Tooltip } from "react-tooltip";
import React, { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getArchiveProjects } from "../../services/archivePageServices";
import AccessControl from "../AccessControl";
import Loader from "../Loader/Loader";
import { showError, showSuccess } from "../Toaster/ToasterFun";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import {
  TrashIcon,
  ArrowPathIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/solid";
import DeleteConfirmationModal from "../Common/DeleteModal";
import ConfirmModal from "../Common/ConfirmModal";
import dayjs from "dayjs";
import { DateFormat } from "../Utils/constants/date-format";
import { ToastMessage } from "../Utils/constants/misc";
import {
  ArchivePermissions,
  ProjectPermissions,
} from "../Utils/constants/roles-permission";
import axiosService from "../Utils/axios";

const ArchivedProjects = () => {
  const { t } = useTranslation(["common"]);
  const [showModal, setShowModal] = useState(false);
  const [ifRestore, setIfRestore] = useState(false);
  const [modalMsg, setModalMsg] = useState(<></>);
  const [selectedId, setSelectedId] = useState("");
  const {
    data: archiveProjects,
    error,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["archiveProjects"], // This is your query key
    queryFn: getArchiveProjects,  // This is the function to fetch data
  });

  if (error instanceof Error) {
    const errorMessage =
      error.message || i18next.t(ToastMessage.SOMETHING_WENT_WRONG);
    showError(errorMessage);
  }

  const openConfirmationModal = (
    e: React.MouseEvent<HTMLButtonElement>,
    project: any
  ) => {
    setSelectedId(project.id);
    if (e.currentTarget.value === "remove") {
      const msg = (
        <>
          {t("Are you sure you want to delete the project")}{" "}
          <span className="font-semibold text-gray-500">{`"${project?.name}"`}</span>
          ?
        </>
      );
      setIfRestore(false);
      setModalMsg(msg);
      setShowModal(!showModal);
    } else {
      const msg = (
        <>
          {t("Are you sure you want to restore the project")}{" "}
          <span className="font-semibold text-gray-500">{`"${project?.name}"`}</span>
          ?
        </>
      );
      setIfRestore(true);
      setModalMsg(msg);
      setShowModal(!showModal);
    }
  };

  const restoreProject = useCallback(async () => {
    try {
      const resp = await axiosService.patch(
        `projects/${selectedId}/restore`,
        {}
      );
      setShowModal(false);
      showSuccess(resp.data.message);
      refetch();
    } catch (err) {
      // console.log(err.message)
    }
  }, [refetch, selectedId]);

  const deleteProject = useCallback(async () => {
    try {
      const resp = await axiosService.delete(
        `projects/${selectedId}/delete`,
        {}
      );
      showSuccess(resp.data.message);
      setShowModal(false);
      refetch();
    } catch (err) {
      // console.log(err.messsage)
    }
  }, [refetch, selectedId]);

  return (
    <main className="pb-12 lg:col-span-9">
      <div className="overflow-x-auto">
        <div className="flex flex-col px-2 lg:px-0 space-y-4">
          <div className=" pb-2 sm:pb-4 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {t("Archived Projects")}
            </h3>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center content-center my-32">
              <Loader />
            </div>
          ) : (
            <table className="w-3/4">
              <tbody className="bg-white divide-y divide-gray-200">
                {archiveProjects?.data?.data.map((project: any) => (
                  <tr
                    key={project.id}
                    className="flex justify-between py-2 sm:py-3 whitespace-nowrap font-normal text-gray-600"
                  >
                    <td className="flex flex-col gap-2">
                      <div className="text-sm font-medium text-gray-900 tracking-wide">
                        {project.name}
                      </div>
                      <div className="flex text-xs items-center gap-2 text-gray-500 font-normal">
                        <div>
                          <ArchiveBoxIcon
                            className="h-4 w-4 text-gray-400 group-hover:text-gray-500"
                            aria-hidden="true"
                          />
                        </div>
                        <div>
                          {t("Archived on ")}
                          {dayjs(project.deletedAt).format(DateFormat.LONG)}
                          {project.archivedBy && (
                            <span>
                              {" "}
                              {t("by")} {project.archivedBy.firstName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="flex text-sm">
                      <button
                        className="mx-2"
                        value="restore"
                        onClick={(e) => openConfirmationModal(e, project)}
                      >
                        <AccessControl
                          permission={ArchivePermissions.RESTORE_PROJECT}
                        >
                          <span
                            data-tooltip-id="archived-projects-tooltip-id"
                            data-tooltip-content={t("Restore Project")}
                          >
                            <ArrowPathIcon
                              className="h-4 w-4 text-indigo-600 group-hover:text-indigo-800"
                              aria-hidden="true"
                            />
                          </span>
                        </AccessControl>
                      </button>
                      <button
                        className="mx-2 text-xs "
                        value="remove"
                        onClick={(e) => openConfirmationModal(e, project)}
                      >
                        <AccessControl
                          permission={ProjectPermissions.DELETE_PROJECT}
                        >
                          <span
                            data-tooltip-id="archived-projects-tooltip-id"
                            data-tooltip-content={t("Permanently Delete Project")}
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
                ))}
              </tbody>
              {archiveProjects?.data?.length === 0 && (
                <tfoot>
                  <tr>
                    <td
                      className="text-center text-gray-400 text-base italic my-2"
                      colSpan={5}
                    >
                      {t("No Projects archived yet.")}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>
        <Tooltip id="archived-projects-tooltip-id" />
      </div>
      {
        showModal && ifRestore ? (
          <ConfirmModal
            open={showModal}
            message={modalMsg}
            handleConfirm={restoreProject}
            handleCancel={() => setShowModal(false)}
          />
        ) : (
          showModal && (
            <DeleteConfirmationModal
              msg={modalMsg}
              open={showModal}
              toggleModal={setShowModal}
              delete={deleteProject}
            />
          )
        )
      }
    </main >
  );
};

export default ArchivedProjects;
