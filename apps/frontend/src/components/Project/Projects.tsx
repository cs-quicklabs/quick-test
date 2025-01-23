import { Menu, Transition } from "@headlessui/react";
import {
  ArchiveBoxIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import { Fragment, useCallback, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import DeleteConfirmationModal from "../Common/DeleteModal";
import Loader from "../Loader/Loader";
import { showError, showSuccess } from "../Toaster/ToasterFun";
import axiosService from "../Utils/axios";
import { DateFormat } from "../Utils/constants/date-format";
import { NoOfDaysForGraph } from "../Utils/constants/misc";
import { appRoutes, projectRoutes } from "../Utils/constants/page-routes";

import { Tooltip } from "react-tooltip";

import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProjects } from "../../services/projectPageServices";
import AccessControl from "../AccessControl";
import ConfirmModal from "../Common/ConfirmModal";
import TestCaseHeading from "../ProjectDetails/component/Header";
import {
  ArchivePermissions,
  ProjectPermissions,
} from "../Utils/constants/roles-permission";
import Modal from "./Modal";
import { EyeIcon } from "@heroicons/react/24/outline";
function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Projects() {
  const { t } = useTranslation(["common"]);

  const [modalMsg, setMsg] = useState(<></>);

  const deleteFromFavouriteList = async (id: string) => {
    try {
      const resp = await axiosService.delete(`/projects/${id}/favorites`, {});
      if (resp.status === 200) {
        refetch();
      }
    } catch (error) {
      // showError(ToastMessage.SOMETHING_WENT_WRONG)
    }
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const daysFromQuery = searchParams.get("days");

  const [showModal, toggleModal] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [isDelete, setIsDelete] = useState(false);

  const [daysModal, setDaysModal] = useState(false);
  const [numberOfDays, setNumberOfDays] = useState(
    daysFromQuery ? parseInt(daysFromQuery) : NoOfDaysForGraph.DEFAULT
  );

  const queryClient = useQueryClient();

  // const colorArr = useMemo(
  //   () => ["#184BB8", "#5584E9", "#A3BCF3", "#DDE7FB"],
  //   []
  // );

  const openModal = (e: React.MouseEvent<HTMLSpanElement>, project: any) => {
    setSelectedId(project?.id);
    if (e.currentTarget.textContent === "Archive") {
      const msg = (
        <>
          {t("Are you sure you want to archive the project")}{" "}
          <span className="font-semibold text-gray-500">{`"${project?.name}"`}</span>
          ?
        </>
      );
      setIsDelete(false);
      setMsg(msg);
      toggleModal(!showModal);
    } else {
      const msg = (
        <>
          {t("Are you sure you want to delete the project")}{" "}
          <span className="font-semibold text-red-500">{`"${project?.name}"`}</span>
          ?
        </>
      );
      setIsDelete(true);
      setMsg(msg);
      toggleModal(!showModal);
    }
  };

  const { data, refetch, isLoading } = useQuery({ queryKey: ["all-projects"], queryFn: getProjects });

  const makeFavorite = async (id: string) => {
    const resp = await axiosService.post(`/projects/${id}/favorites`, {});
    if (resp?.data?.data) {
      refetch();
    }
  };

  const moveToArchive = useCallback(async () => {
    try {
      const resp = await axiosService.delete(
        `/projects/${selectedId}/archive`,
        {}
      );
      if (resp?.data?.success) {
        showSuccess(resp.data.message);
      }
      toggleModal(false);
      refetch();
    } catch (err) {
      if (err?.response?.data) {
        showError(err.response.data.message);
      }
    }
  }, [refetch, selectedId]);

  const deleteProject = useCallback(async () => {
    try {
      const resp = await axiosService.delete(
        `projects/${selectedId}/delete`,
        {}
      );
      showSuccess(resp.data.message);
      toggleModal(false);
      queryClient.invalidateQueries({ queryKey: ["all-projects"] });
    } catch (err) {
      // console.log(err.messsage)
    }
  }, [selectedId, queryClient]);

  return (
    <>
      <div className="bg-gray-50">
        <TestCaseHeading
          title={t("Projects")}
          redirectToPage={{
            url: appRoutes.CREATE_PROJECT,
            text: i18next.t("New Project"),
          }}
          dataAttr="new-project"
        />
      </div>
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
              <div className="mt-10 sm:hidden">
                <div className="px-4 sm:px-6">
                  <h2 className="text-gray-500 text-xs font-medium tracking-wide">
                    {t("Projects")}
                  </h2>
                </div>
                <ul className="mt-3 border-t border-gray-200 divide-y divide-gray-100">
                  {data?.data?.data.map((project: any) => (
                    <li key={project.id}>
                      <a
                        href={`${appRoutes.PROJECTS}/${project?.id}/${projectRoutes.TESTCASES}`}
                        className="group flex items-center justify-between px-4 py-4 hover:bg-gray-50 sm:px-6"
                      >
                        <span className="flex items-center truncate space-x-3">
                          <span
                            className="bg-indigo-400 w-2.5 h-2.5 flex-shrink-0 rounded-full"
                            aria-hidden="true"
                          />
                          <span className="font-medium truncate text-sm leading-6">
                            {project?.name}
                          </span>
                        </span>
                        <ChevronRightIcon
                          className="ml-4 h-4 w-4 text-gray-400 group-hover:text-gray-500"
                          aria-hidden="true"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="min-h-full h-auto flex">
                <div className="w-full pb-14">
                  <div className="p-4 pb-0 hidden">
                    <div className=" border-gray-200 bg-gray-50 rounded 2xl:border-none">
                      <div className="px-4 py-2 text-sm text-left ">
                        <span className="text-gray-900">
                          {t("Favorite Projects")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="align-middle inline-block min-w-full border-b border-gray-200 2xl:border-none">
                      <table className="min-w-full">
                        <thead className="">
                          <tr className="text-right">
                            <th className="border-b border-gray-200 bg-gray-50 px-8 py-2 text-left text-sm font-semibold text-gray-900 2xl:pl-52">
                              {t("Projects")}
                            </th>
                            <th className="border-b border-gray-200 bg-gray-50 px-6 py-2 text-sm font-semibold text-gray-900 text-center">
                              {t("Runs")}
                            </th>
                            <th className="border-b border-gray-200 bg-gray-50 px-6 py-2 text-left text-sm font-semibold text-gray-900">
                              {t("Milestones")}
                            </th>
                            <th className="border-b border-gray-200 bg-gray-50 px-6 py-2 text-sm font-semibold text-gray-900 text-center">
                              {t("Created At")}
                            </th>

                            <th className="border-b border-gray-200 bg-gray-50 px-6 py-2 text-left text-sm font-semibold text-gray-900 2xl:pr-52">
                              {t("Options")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {data?.data?.data.map(
                            (project: any, index: number) => (
                              <tr key={project.id}>
                                <td className="w-full max-w-0 whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-900 2xl:pl-52">
                                  <div className="flex items-center space-x-3 lg:pl-2 text-[0.875rem] 2xl:pl-0">
                                    {project.favorite ? (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-4 w-4 cursor-pointer hover:text-indigo-100 ${project.favorite
                                          ? "text-indigo-700"
                                          : "text-indigo-100 hover:text-indigo-700"
                                          }`}
                                        data-cy={`add-favorite-${index}`}
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        onClick={() =>
                                          deleteFromFavouriteList(project.id)
                                        }
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ) : (
                                      <div
                                        data-tooltip-id="projects-tooltip-id"
                                        data-tooltip-content={t("Mark as Favourite")}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className={`h-4 w-4 cursor-pointer hover:text-indigo-100 ${project.favorite
                                            ? "text-indigo-700"
                                            : "text-indigo-100 hover:text-indigo-700"
                                            }`}
                                          data-cy={`add-favorite-${index}`}
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                          onClick={() =>
                                            makeFavorite(project.id)
                                          }
                                        >
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      </div>
                                    )}
                                    <div
                                      className="bg-indigo-400 w-2.5 h-2.5 flex-shrink-0 rounded-full"
                                      aria-hidden="true"
                                    />
                                    <Link
                                      data-cy={"project-" + index}
                                      to={`${appRoutes.PROJECTS}/${project.id}/${projectRoutes.OVERVIEW}`}
                                      className="truncate hover:text-gray-900 hover:underline cursor-pointer"
                                    >
                                      <span>{project?.name}</span>
                                    </Link>
                                  </div>
                                </td>
                                <td className="hidden whitespace-nowrap px-6 py-3 text-left text-sm text-gray-500 md:table-cell">
                                  <h1>
                                    {project?.testsuites?.length}
                                    {project?.testsuites?.length > 1
                                      ? t(` Test Runs`)
                                      : t(` Test Run`)}
                                  </h1>
                                </td>
                                <td className="hidden whitespace-nowrap px-6 py-3 text-left text-sm text-gray-500 md:table-cell">
                                  <h1>
                                    {project?.milestones?.length}
                                    {project?.milestones?.length > 1
                                      ? t(` Milestones`)
                                      : t(` Milestone`)}
                                  </h1>
                                </td>
                                <td className="hidden  md:table-cell px-4 py-3  whitespace-nowrap text-[.875rem] leading-5 text-gray-500 text-right">
                                  <h1>
                                    {dayjs(new Date(project?.createdAt)).format(
                                      DateFormat.LONG
                                    )}
                                  </h1>
                                </td>

                                <td className="pr-6 2xl:pr-52">
                                  <Menu
                                    data-cy={`three-dots-menu-${index}`}
                                    as="div"
                                    className="relative flex justify-end items-center"
                                  >
                                    {({ open }) => (
                                      <>
                                        <Menu.Button
                                          className={`w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full hover:text-gray-500 focus:outline-none ${open &&
                                            "ring-2 ring-offset-2 ring-purple-500"
                                            }`}
                                        >
                                          <span className="sr-only">
                                            {t("Open options")}
                                          </span>
                                          <EllipsisVerticalIcon
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                          />
                                        </Menu.Button>
                                        <Transition
                                          show={open}
                                          as={Fragment}
                                          enter="transition ease-out duration-100"
                                          enterFrom="transform opacity-0 scale-95"
                                          enterTo="transform opacity-100 scale-100"
                                          leave="transition ease-in duration-75"
                                          leaveFrom="transform opacity-100 scale-100"
                                          leaveTo="transform opacity-0 scale-95"
                                        >
                                          <Menu.Items
                                            static
                                            style={
                                              data?.data?.length - 1 ===
                                                index &&
                                                data?.data?.length !== 1
                                                ? {
                                                  transform:
                                                    "translateY(-55%)",
                                                }
                                                : {}
                                            }
                                            className="mx-3 cursor-pointer origin-top-right absolute right-7 top-0 w-48 mt-1 rounded-md shadow-lg z-10 bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 focus:outline-none"
                                          >
                                            <div className="py-1">
                                              <AccessControl
                                                permission={
                                                  ProjectPermissions.EDIT_PROJECT
                                                }
                                              >
                                                <Menu.Item>
                                                  {({ active }) => (
                                                    <Link
                                                      to={`${appRoutes.PROJECTS}/${project.id}/${projectRoutes.EDIT_PROJECT}`}
                                                      className={classNames(
                                                        active
                                                          ? "bg-gray-100 text-gray-900"
                                                          : "text-gray-700",
                                                        "group flex items-center px-4 py-1.5 text-xs"
                                                      )}
                                                    >
                                                      <PencilSquareIcon
                                                        className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500"
                                                        aria-hidden="true"
                                                      />
                                                      {t("Edit")}
                                                    </Link>
                                                  )}
                                                </Menu.Item>
                                              </AccessControl>
                                              <Menu.Item>
                                                {({ active }) => (
                                                  <Link
                                                    to={`${appRoutes.PROJECTS}/${project.id}/${projectRoutes.OVERVIEW}`}
                                                    className={classNames(
                                                      active
                                                        ? "bg-gray-100 text-gray-900"
                                                        : "text-gray-700",
                                                      "group flex items-center px-4 py-1.5 text-xs"
                                                    )}
                                                  >
                                                    <EyeIcon
                                                      className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500"
                                                      aria-hidden="true"
                                                    />
                                                    {t("View")}
                                                  </Link>
                                                )}
                                              </Menu.Item>
                                              <AccessControl
                                                permission={
                                                  ArchivePermissions.ARCHIVE_PROJECT &&
                                                  ArchivePermissions.LIST_ARCHIVE_PROJECT
                                                }
                                              >
                                                <Menu.Item>
                                                  {({ active }) => (
                                                    <span
                                                      onClick={(e) =>
                                                        openModal(e, project)
                                                      }
                                                      className={classNames(
                                                        active
                                                          ? "bg-gray-100 text-gray-900"
                                                          : "text-gray-700",
                                                        "group flex items-center px-4 py-1.5 text-xs"
                                                      )}
                                                    >
                                                      <ArchiveBoxIcon
                                                        className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500"
                                                        aria-hidden="true"
                                                      />
                                                      {t("Archive")}
                                                    </span>
                                                  )}
                                                </Menu.Item>
                                              </AccessControl>
                                            </div>
                                          </Menu.Items>
                                        </Transition>
                                      </>
                                    )}
                                  </Menu>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                      <Tooltip id="projects-tooltip-id" />
                    </div>
                    {data?.data?.data.length === 0 && (
                      <div className="flex justify-center items-center content-center text-gray-500 text-xs font-normal my-4">
                        {t("No project added yet")}.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      )}
      {showModal && isDelete ? (
        <DeleteConfirmationModal
          msg={modalMsg}
          open={showModal}
          toggleModal={toggleModal}
          delete={deleteProject}
        />
      ) : (
        showModal && (
          <ConfirmModal
            message={modalMsg}
            open={showModal}
            handleConfirm={moveToArchive}
            handleCancel={() => toggleModal(false)}
          />
        )
      )}
    </>
  );
}
