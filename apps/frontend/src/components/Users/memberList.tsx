import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PencilSquareIcon, EnvelopeIcon } from "@heroicons/react/24/solid";
import { Tooltip } from "react-tooltip";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getUserProfileDetails } from "../../services/profileServices";
import Button from "../Button";
import Loader from "../Loader/Loader";
import { showError, showSuccess } from "../Toaster/ToasterFun";
import axiosService from "../Utils/axios";
import { ToastMessage } from "../Utils/constants/misc";
import {
  appRoutes,
  settingsRoutes,
  usersRoutes,
} from "../Utils/constants/page-routes";
import {
  ArchivePermissions,
  RoleId,
  UserManagementPermissions,
} from "../Utils/constants/roles-permission";
import AccessControl from "../AccessControl";
import { AppContext } from "../Context/mainContext";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";
import ConfirmModal from "../Common/ConfirmModal";

const MemberList = () => {
  const { t } = useTranslation(["common"]);
  const [userRoleId, setUserRoleId] = useState<number>(RoleId.MEMBER);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [modalMsg, setModalMsg] = useState(<></>);
  const navigate = useNavigate();
  const { state } = useContext(AppContext);
  const response = state.userDetails;
  const testChangeRef = useRef<IntersectionObserver | null>(null);

  const {
    data,
    isLoading,
    refetch,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["users-data"],
    queryFn: ({ pageParam }) =>
      getUserProfileDetails({
        pageNum: pageParam ?? 1,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage?.prevOffSet > lastPage.data.meta.pageCount
        ? undefined
        : lastPage?.prevOffSet;
    }
  });

  const userData = data?.pages.reduce((acc, page) => {
    return [...acc, ...page.data.data];
  }, []);

  if (error instanceof Error) {
    const errorMessage =
      error.message || i18next.t(ToastMessage.SOMETHING_WENT_WRONG);
    showError(errorMessage);
  }

  const openModal = (user: any) => {
    setSelectedId(user.id);
    const msg = (
      <>
        {t("Are you sure you want to archive the user")}{" "}
        <span className="font-semibold">{`"${user?.firstName} ${user?.lastName}"`}</span>
        ?
      </>
    );
    setModalMsg(msg);
    setShowModal(true);
  };

  useEffect(() => {
    if (localStorage.getItem("roleId")) {
      setUserRoleId(JSON.parse(localStorage.getItem("roleId") || ""));
    }
  }, []);

  const resendPassword = async (email: string) => {
    const response = await axiosService.post("/auth/send-reset-link", {
      email: email,
    });
    showSuccess(response.data.message);
  };

  const moveToArchive = useCallback(async () => {
    try {
      const resp = await axiosService.delete(`users/${selectedId}/archive`, {});
      if (resp?.data?.success) {
        showSuccess(resp.data.message);
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      if (err?.response?.data) {
        showError(err.response.data.message);
      }
    }
  }, [refetch, selectedId]);

  const lastElementRef = (node: any) => {
    if (testChangeRef?.current) testChangeRef?.current?.disconnect?.();

    testChangeRef.current = new IntersectionObserver((entries) => {
      if (entries?.[0]?.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    if (node) testChangeRef?.current?.observe?.(node);
  };

  return (
    <main className="pb-12 lg:col-span-9">
      <div className="overflow-x-contain">
        <div className="flex flex-col px-2 lg:px-0 space-y-6">
          <div className=" pb-2 border-gray-200 sm:flex sm:items-start sm:justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {t("Users")}
            </h3>
            {response.roleId !== RoleId.MEMBER && (
              <div className="flex gap-4 sm:mt-1 mr-1  sm:ml-0">
                <AccessControl
                  permission={UserManagementPermissions.ADD_MEMBERS}
                >
                  <Button
                    className="ml-0"
                    id="add-new-member"
                    data-cy="add-user"
                    onClick={() =>
                      navigate(
                        `${appRoutes.SETTINGS}/${settingsRoutes.USERS}/${usersRoutes.ADD}`
                      )
                    }
                    type="button"
                  >
                    {t("Add New")}
                  </Button>
                </AccessControl>
                <AccessControl
                  permission={UserManagementPermissions.ADD_MEMBERS}
                >
                  <Button
                    id="add-new-member"
                    data-cy="add-multiple-user"
                    onClick={() =>
                      navigate(
                        `${appRoutes.SETTINGS}/${settingsRoutes.USERS}/${usersRoutes.ADD_MULTIPLE}`
                      )
                    }
                    type="button"
                  >
                    {t("Add Multiple Users")}
                  </Button>
                </AccessControl>
              </div>
            )}
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center content-center my-32">
              <Loader />
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 border-t">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-2 text-left text-sm font-semibold text-gray-900 tracking-wider"
                  >
                    {t("Name")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-2 text-left text-sm font-semibold text-gray-900 tracking-wider"
                  >
                    {t("Title")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-2 text-left text-sm font-semibold text-gray-900 tracking-wider"
                  >
                    {t("Email")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-2 text-sm font-semibold text-gray-900 tracking-wider text-left"
                  >
                    {t("Role")}
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-2 text-sm font-semibold text-gray-900 tracking-wider text-center"
                  >
                    <span className="sr-only">{t("Edit")}</span>
                    {t("Options")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userData?.map((user: any, index: any) => (
                  <tr key={index} ref={lastElementRef}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                      {user.roleId === RoleId.OWNER
                        ? t("Owner")
                        : user.roleId === RoleId.ADMIN
                          ? t("Admin")
                          : t("Member")}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-center">
                      <span
                        data-tooltip-id="member-list-tooltip-id"
                        data-tooltip-content={t("Resend Password Link")}>
                        <AccessControl
                          permission={
                            UserManagementPermissions.RESET_PASSWORD_LINK
                          }
                        >
                          <EnvelopeIcon
                            className="text-indigo-600 h-4 w-4 cursor-pointer mr-3"
                            onClick={() => resendPassword(user.email)}
                          />
                        </AccessControl>
                      </span>
                      <span data-cy={`edit-user-${index}`}
                        data-tooltip-id="member-list-tooltip-id"
                        data-tooltip-content={t("Edit Member")}>
                        <AccessControl
                          permission={UserManagementPermissions.UPDATE_MEMBER}
                          upperRoleEditPermission={
                            user.roleId >= userRoleId &&
                            userRoleId !== RoleId.MEMBER
                          }
                        >
                          <PencilSquareIcon
                            onClick={() => {
                              navigate(
                                `${appRoutes.SETTINGS}/${settingsRoutes.USERS}/${user.id}/${usersRoutes.EDIT}`
                              );
                            }}
                            className="text-indigo-500 h-4 w-4 cursor-pointer mr-3"
                          />
                        </AccessControl>
                      </span>
                      <span
                        data-tooltip-id="member-list-tooltip-id"
                        data-tooltip-content={t("Archive Member")}
                        data-cy={`archive-user-${index}`}
                        onClick={() => openModal(user)}
                      >
                        <AccessControl
                          permission={ArchivePermissions.ARCHIVE_USER}
                          upperRoleEditPermission={
                            user.roleId >= userRoleId &&
                            userRoleId !== RoleId.MEMBER
                          }
                        >
                          <ArchiveBoxIcon
                            className="text-indigo-600 h-4 w-4 cursor-pointer mr-3"
                            aria-hidden="true"
                          />
                        </AccessControl>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {isFetchingNextPage && <Loader />}
              {userData?.data?.data?.data.length === 0 && (
                <tfoot>
                  <tr>
                    <td
                      className="text-center text-gray-500 text-xs font-normal mt-2"
                      colSpan={5}
                    >
                      {t("No Users added yet.")}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>
        <Tooltip id="member-list-tooltip-id" />
      </div>
      {
        showModal && (
          <ConfirmModal
            message={modalMsg}
            open={showModal}
            handleConfirm={moveToArchive}
            handleCancel={() => setShowModal(false)}
          />
        )
      }
    </main >
  );
};

export default MemberList;
