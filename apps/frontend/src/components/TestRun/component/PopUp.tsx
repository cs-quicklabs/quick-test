import { Fragment } from "react";
import { Dialog, Transition, TransitionChild } from "@headlessui/react";
import { Formik, Form } from "formik";
import { FormikCheckbox, FormikTextArea } from "../../Common/FormikInput";
import Button from "../../Button";
import CancelButton from "../../Button/cancelButton";
import UploadImage from "./UploadImage";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  setOpen?: (val: boolean) => void | any;
  submitData: (
    comment: string,
    image: string,
    addCommentJira: boolean,
    doNotUpdate?: boolean
  ) => void | any;
  defectStatus: any;
  refetch: () => void;
}

export default function PopUp({
  open,
  submitData,
  defectStatus,
  refetch,
}: Props) {
  const { t } = useTranslation(["common"]);

  return (
    <Transition show={open} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed z-10 inset-0 overflow-y-auto"
        open={open}
        onClose={() => submitData("", "", false, true)}
      >
        <div className="flex items-end justify-center min-h-screen pt-1 px-1 pb-20 text-center sm:block sm:p-0">
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

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-2 pt-2 pb-2 text-left overflow-hidden shadow-xl transform transition-all sm:my-2 sm:align-middle sm:max-w-sm sm:w-full sm:p-2 h-2/5 md:max-w-xl">
              <div className="mx-auto pt-2 pb-2 px-4 lg:pb-4 h-full">
                <div className="w-full h-full">
                  <Formik
                    initialValues={{
                      comment: "",
                      image: "",
                      addCommentJira: false,
                    }}
                    onSubmit={({ comment, image, addCommentJira }) => {
                      submitData(comment, image, addCommentJira);
                    }}
                  >
                    {(formik) => {
                      const { isValid, dirty } = formik;
                      return (
                        <Form className="space-y-3" autoComplete="off">
                          <div>
                            <FormikTextArea
                              type="text"
                              name="comment"
                              label={t("Comment")}
                              isOptional
                              markdownPreview={true}
                            />
                          </div>
                          <div className="flex flex-col space-y-1">
                            <UploadImage name="image" />
                          </div>
                          {defectStatus?.pluginKey ? (
                            <div className="flex flex-col space-y-2">
                              <span className="text-sm font-medium text-gray-700">
                                {t("Would you like to update")}{" "}
                                {defectStatus.pluginKey} {t("on Jira?")}
                              </span>
                              <FormikCheckbox
                                name="addCommentJira"
                                type="checkbox"
                                label="Update on Jira"
                              />
                            </div>
                          ) : null}
                          <div className="flex justify-end pt-0.5">
                            <CancelButton
                              data-cy="skip-and-submit"
                              onMouseDown={() => submitData("", "", false)}
                              type="button"
                              onClick={() => refetch()}
                            >
                              {t("Skip & Submit")}
                            </CancelButton>
                            <Button
                              id="submit-inside-popup"
                              type="submit"
                              className={`ml-3 w-12${!(dirty && isValid)
                                  ? "cursor-not-allowed bg-indigo-600/50 hover:bg-indigo-600/50"
                                  : ""
                                }`}
                              disabled={!(dirty && isValid)}
                            >
                              {t("Add")}
                            </Button>
                          </div>
                        </Form>
                      );
                    }}
                  </Formik>
                </div>
              </div>
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
