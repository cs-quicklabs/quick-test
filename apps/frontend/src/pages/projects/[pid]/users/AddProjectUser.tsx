import { Fragment, Key, useEffect, useState } from "react";
import {
  Dialog,
  Transition,
  Listbox,
  TransitionChild,
  ListboxButton,
  ListboxOptions,
  DialogPanel,
  ListboxOption,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import {
  getUnassignedProjectMembers,
  addProjectMembers,
} from "../../../../services/projectMemberService";
import { useQuery } from "@tanstack/react-query";
import i18next from "i18next";
import {
  showError,
  showSuccess,
} from "../../../../components/Toaster/ToasterFun";
import { ToastMessage } from "../../../../components/Utils/constants/misc";
import Loader from "../../../../components/Loader/Loader";
export default function AddProjectUser(props: any) {
  const [selected, setSelected] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const submitform = () => {
    setLoading(true);
    const users = selected.map((item: { id: string }) => item.id);
    if (users.length === 0) return false;
    addProjectMembers({ users, projectId: props.pid })
      .then((response) => {
        props.setShare(false);
        showSuccess(ToastMessage.MEMBER_ADDED);
        props.fetchData();
      })
      .catch((error) => {
        setLoading(false);
        props.setShare(false);
        if (error instanceof Error) {
          const errorMessage =
            error?.message || i18next.t(ToastMessage.SOMETHING_WENT_WRONG);
          showError(errorMessage);
        }
      });
  };

  const {
    data: members,
    refetch,
    error,
  } = useQuery({
    queryKey: ["unassigned-members"], // Query key
    queryFn: () => getUnassignedProjectMembers(props?.pid), // Query function
    enabled: false, // Disable the query on mount
  });

  if (error instanceof Error) {
    const errorMessage =
      error?.message || i18next.t(ToastMessage.SOMETHING_WENT_WRONG);
    showError(errorMessage);
  }

  useEffect(() => {
    if (props?.pid) {
      refetch();
    }
  }, [props?.pid, refetch]);

  return (
    <Transition show={props.isShare} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={props.setShare}>
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
          {isLoading && <Loader withoverlay={isLoading} />}
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
              <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div>
                  <div className="mx-auto flex text-xl font-bold mt-5 w-full ">
                    {props?.project?.name}
                  </div>
                  <div className="mx-auto flex text-sm font-light mt-1 mb-2 w-full">
                    Member can see milestone, testcase, testrun of the{" "}
                    {props?.project?.name}, after sharing access
                  </div>

                  <div>
                    <Listbox value={selected} onChange={setSelected} multiple>
                      <div className="relative mt-1">
                        <ListboxButton className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                          <span className="block truncate">
                            {selected && selected.length > 0
                              ? selected
                                .map(
                                  (member: { fullName: string }) =>
                                    member?.fullName
                                )
                                .join(", ")
                              : "Select Member"}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </span>
                        </ListboxButton>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <ListboxOptions className="mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                            {members &&
                              members.map((member: any, memberIdx: Key) => (
                                <ListboxOption
                                  key={memberIdx}
                                  className={({ focus }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${focus
                                      ? "bg-amber-100 text-amber-900"
                                      : "text-gray-900"
                                    }`
                                  }
                                  value={member}
                                >
                                  {({ selected }) => (
                                    <>
                                      <span
                                        className={`block truncate ${selected
                                          ? "font-medium"
                                          : "font-normal"
                                          }`}
                                      >
                                        {member.fullName}
                                      </span>
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <input
                                          type="checkbox"
                                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                          checked={selected}
                                        />
                                      </span>
                                    </>
                                  )}
                                </ListboxOption>
                              ))}
                          </ListboxOptions>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>
                  <div className="my-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 sm:ml-3 sm:w-auto"
                      onClick={() => submitform()}
                      disabled={!selected.length}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => props.setShare(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
