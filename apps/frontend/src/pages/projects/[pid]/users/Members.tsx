import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import AddProjectUser from "./AddProjectUser";
import i18next, { t } from "i18next";
import Button from "../../../../components/Button";
import {
  deleteProjectMembers,
  getAssignedProjectMembers,
} from "../../../../services/projectMemberService";

import {
  showError,
  showSuccess,
} from "../../../../components/Toaster/ToasterFun";
import { ToastMessage } from "../../../../components/Utils/constants/misc";
import Loader from "../../../../components/Loader/Loader";
import { useQuery } from "@tanstack/react-query";
import { Tooltip } from "react-tooltip";

export default function ProjectMembers(props: any) {
  const [open, setOpen] = useState(false);
  const [isShare, setShare] = useState(false);
  const [message, setMessge] = useState("");
  const [deleteUser, setDeleteUser] = useState("");
  const cancelButtonRef = useRef(null);
  const [isLoading, setLoading] = useState(false);

  const {
    data: members,
    refetch,
    error,
  } = useQuery({
    queryKey: ["project-members"],
    queryFn: () => getAssignedProjectMembers(props?.pid),
    enabled: false, // Disable the query on mount
  });

  const fetchData = useCallback(() => {
    setLoading(true);
    refetch()
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, [refetch]);

  if (error instanceof Error) {
    const errorMessage =
      error?.message || i18next.t(ToastMessage.SOMETHING_WENT_WRONG);
    showError(errorMessage);
  }

  useEffect(() => {
    if (props?.pid) {
      fetchData();
    }
  }, [props?.pid, fetchData]);

  const getConfirmation = (user: { fullName: string; id: string }) => {
    setMessge(
      `after deleting  ${user.fullName} will no longer have access to any ${props?.pname}-related data, including milestones, testcases and other`
    );
    setDeleteUser(user.id);
    setOpen(true);
  };

  const deleteMember = () => {
    setLoading(true);
    deleteProjectMembers(props?.pid, deleteUser)
      .then((response) => {
        setOpen(false);
        fetchData();
        showSuccess(ToastMessage.MEMBER_DELETED);
      })
      .catch((error) => {
        setLoading(false);
        if (error instanceof Error) {
          const errorMessage =
            error?.message || i18next.t(ToastMessage.SOMETHING_WENT_WRONG);
          showError(errorMessage);
        }
      });
  };

  return isLoading ? (
    <Loader withoverlay={true} />
  ) : (
    <>
      <main>
        <h1 className="sr-only">{t("Page title")}</h1>

        <div className="grid items-start grid-cols-2 lg:grid-cols-3">
          <div className="grid grid-cols-1 gap-4 lg:col-span-2  ">
            <section aria-labelledby="participants_section">
              <div className="overflow-hidden bg-white">
                <div className="px-5 2xl:pl-48">
                  <table className="min-w-full divide-y divide-gray-300 px-2 2xl:pl-48">
                    <tbody className="divide-y divide-gray-200">
                      {members &&
                        members !== undefined &&
                        members.length > 0 ? (
                        members.map((member: any) => (
                          <tr key={member["fullName"]}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                              {member["fullName"]}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {member["email"]}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                              {/* <div className="text-indigo-600 hover:text-indigo-900 cursor-pointer"> */}
                              <TrashIcon
                                data-tooltip-id="delete-id"
                                data-tooltip-content="Delete"
                                onClick={() => getConfirmation(member)}
                                className="w-4 h-8 text-red-400"
                              />
                              {/* </div> */}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr >
                          <td className="text-center p-10">
                            No Member Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <Tooltip id="delete-id" />
                </div>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-3 h-screen lg:border-l lg:border-gray-200 xl:w-full">
            <section aria-labelledby="add-participant-section">
              <div className="overflow-hidden bg-white">
                <div>
                  <div className="bg-white">
                    <div className="px-2 md:px-4 py-5 sm:p-6 2xl:pr-52">
                      <h3 className="text-base font-semibold leading-6 text-gray-900">
                        {t("Manage Members")}
                      </h3>
                      <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>
                          {t(
                            "A project member can create milestones, test cases and test runs including other things."
                          )}
                        </p>
                      </div>
                      <Button
                        id="new member"
                        onClick={() => setShare(true)}
                        type="button"
                        className="inline-flex items-center rounded-md bg-indigo-600 mt-3 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 "
                      >
                        {t("Add Member")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Transition show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={cancelButtonRef}
          onClose={setOpen}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </TransitionChild>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon
                        className="h-6 w-6 text-red-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <DialogTitle
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Delete Member
                      </DialogTitle>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">{message}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                      onClick={() => {
                        deleteMember();
                      }}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                    >
                      Cancel
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      <AddProjectUser
        isShare={isShare}
        setShare={setShare}
        pname={props.pname}
        pid={props.pid}
        fetchData={fetchData}
      />
    </>
  );
}
