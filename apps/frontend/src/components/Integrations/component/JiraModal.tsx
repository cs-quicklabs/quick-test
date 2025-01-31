/* eslint-disable react-hooks/exhaustive-deps */
/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import Button from "../../Button";
import CancelButton from "../../Button/cancelButton";
import { Formik, Form } from "formik";
import { FormikInput } from "../../Common/FormikInput";
import { validateJiraConfigurationSchema } from "../../Utils/validators";
import axiosService from "../../Utils/axios";
import { showError, showSuccess } from "../../Toaster/ToasterFun";
import { ToastMessage } from "../../Utils/constants/misc";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

export default function JiraModal(props: any) {
  const { t } = useTranslation(["common"]);
  const { setOpen, open, pluginConfig, getPluginConfig } = props;

  const initialValues = {
    apiToken: "",
    orgAddress: "",
    userEmail: "",
  };

  const [apiLoading, setApiLoading] = useState(false);
  const [initValues, setInitValues] = useState(initialValues);
  const [validation, setValidation] = useState(false);
  const headerRef = useRef<any>(null);
  const submitButtonRef = useRef<any>(null);

  const addJiraConfig = async (values: any) => {
    const requestBody = {
      accessToken: values.apiToken,
      webAddress: values.orgAddress,
      userName: values.userEmail,
      plugin: "jira",
    };

    try {
      setApiLoading(true);
      const response = await axiosService.post("/plugins/config", requestBody);
      localStorage.setItem("isJiraIntegrated", response.data.data.isIntegrated);
      showSuccess(response.data.message);
      setOpen(false);
      getPluginConfig();
    } catch (error) {
      if (error?.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
      }
    } finally {
      setApiLoading(false);
    }
  };

  const updateJiraConfig = async (values: any) => {
    const requestBody = {
      accessToken: values.apiToken,
      webAddress: values.orgAddress,
      userName: values.userEmail,
    };
    try {
      setApiLoading(true);
      const response = await axiosService.put(
        `/plugins/config/${pluginConfig.id}`,
        requestBody
      );
      localStorage.setItem("isJiraIntegrated", response.data.data.isIntegrated);
      showSuccess(response.data.message);
      setOpen(false);
      getPluginConfig();
    } catch (error) {
      if (error?.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
      }
    } finally {
      setApiLoading(false);
    }
  };

  const submitForm = (values: typeof initialValues) => {
    if (submitButtonRef.current?.id === "add") {
      addJiraConfig(values);
    }
    if (submitButtonRef.current?.id === "update") {
      updateJiraConfig(values);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      setInitValues({
        apiToken: pluginConfig.accessToken,
        orgAddress: pluginConfig.webAddress,
        userEmail: pluginConfig.userName,
      });
    }
    return () => {
      isMounted = false;
      setInitValues(initialValues);
    };
  }, [pluginConfig]);

  return (
    <Transition show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        initialFocus={headerRef}
        onClose={setOpen}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-1 sm:pt-5 pb-4 sm:p-6 sm:pb-4 space-y-6">
                <div ref={headerRef} className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <DialogTitle
                      as="div"
                      className="text-lg leading-6 font-medium text-gray-900"
                    >
                      {pluginConfig.isIntegrated
                        ? t("Re-configure JIRA Integration")
                        : t("Configure JIRA Integration")}
                    </DialogTitle>
                  </div>
                </div>

                {/* Integration Form */}

                <div className="w-full ">
                  <Formik
                    initialValues={initValues}
                    validationSchema={validateJiraConfigurationSchema}
                    onSubmit={submitForm}
                    enableReinitialize
                  >
                    {(formik) => {
                      const { dirty } = formik;
                      return (
                        <Form
                          className="space-y-4 sm:space-y-6"
                          autoComplete="off"
                          noValidate
                        >
                          <div>
                            <FormikInput
                              type="text"
                              name="orgAddress"
                              label={t("JIRA Address")}
                              validation={validation}
                            />
                          </div>
                          <div>
                            <FormikInput
                              type="text"
                              name="userEmail"
                              label={t("JIRA Email Address")}
                              validation={validation}
                            />
                          </div>
                          <div>
                            <FormikInput
                              type="password"
                              name="apiToken"
                              label={t("JIRA API Token")}
                              validation={validation}
                            />
                          </div>
                          <div
                            ref={submitButtonRef}
                            id={pluginConfig.isIntegrated ? "update" : "add"}
                            className="sm:flex sm:flex-row-reverse gap-x-4"
                          >
                            <Button
                              id="submit-button"
                              onMouseDown={() => setValidation(true)}
                              loading={apiLoading}
                              type="submit"
                              className={
                                !dirty
                                  ? "cursor-not-allowed bg-indigo-600/50 hover:bg-indigo-600/50"
                                  : ""
                              }
                              disabled={!dirty}
                            >
                              {pluginConfig.isIntegrated
                                ? t("Re-configure Jira Integration")
                                : t("Enable Jira Integration")}
                            </Button>
                            <CancelButton
                              type="button"
                              onMouseDown={() => setOpen(false)}
                            >
                              {t("Cancel")}
                            </CancelButton>
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
