import { Fragment, useState, useRef, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";

import { Dialog, Transition, TransitionChild } from "@headlessui/react";
import * as Yup from "yup";
import { Formik, Form } from "formik";

import { AppContext } from "../Context/mainContext";
import axiosService from "../Utils/axios";
import Button from "../Button";
import CancelButton from "../Button/cancelButton";
import { ToastMessage, ValidatorMessage } from "../Utils/constants/misc";
import { FormikInput, FormikTextArea } from "../Common/FormikInput";
import { showError } from "../../components/Toaster/ToasterFun";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

interface Iprops {
  popup: boolean;
  hidePopUp: () => void;
  editValue: any;
  getSection: () => void;
}
export default function Example({ ...props }: Iprops) {
  const { t } = useTranslation(["common"]);
  const params = useParams();
  const { dispatch } = useContext(AppContext);
  const addSectionSchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .max(32, t(ValidatorMessage.NAME_MAX_LENGTH))
      .required(t(ValidatorMessage.NAME_REQ)),
    description: Yup.string().trim().max(500, t(ValidatorMessage.DESC_LENGTH)),
  });
  interface InitVal {
    name: string | string[] | undefined;
    description?: string | string[] | undefined;
  }
  const initialValues: InitVal = {
    name: "",
    description: "",
  };
  const [initValues, setInitValues] = useState(initialValues);
  const [apiloading, setApiLoading] = useState(false);
  const [validation, setValidation] = useState(false);

  const submitFormAddProject = async (values: InitVal) => {
    try {
      setApiLoading(true);
      const newValue = { ...values };
      if (newValue.name === initValues.name) {
        delete newValue.name;
      }
      if (props?.editValue?.id) {
        await axiosService.put(
          "/projects/" + params.pid + "/sections/" + props.editValue.id,
          { ...newValue }
        );
      } else {
        if (!newValue.description) {
          delete newValue.description;
        }
        await axiosService.post("/projects/" + params.pid + "/sections", {
          ...newValue,
        });
      }
      dispatch({ type: "UPDATE_SECTION_CREATED", data: true });
      props.getSection();
      props.hidePopUp();
      setApiLoading(false);
    } catch (error) {
      if (error?.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
      }
      setApiLoading(false);
    }
  };
  useEffect(() => {
    if (props.editValue) {
      setInitValues({
        name: props?.editValue?.name || "",
        description: props?.editValue?.description || "",
      });
    }
  }, [props?.editValue]);

  const labelref = useRef<HTMLLabelElement>(null);

  return (
    <Transition show={props.popup} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed z-10 inset-0 overflow-y-auto"
        open={props.popup}
        onClose={() => props.hidePopUp()}
        initialFocus={labelref}
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
            <div
              className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6"
              data-cy="section-modal"
            >
              <div className="w-full ">
                <Formik
                  initialValues={initValues}
                  validationSchema={addSectionSchema}
                  onSubmit={submitFormAddProject}
                  enableReinitialize
                >
                  {(formik) => {
                    const { dirty } = formik;
                    return (
                      <Form className="space-y-6" noValidate autoComplete="off">
                        <div>
                          <label
                            ref={labelref}
                            className="block text-lg font-medium text-gray-900"
                          >
                            {props?.editValue?.id
                              ? t("Edit Section Details")
                              : t("Create New Section")}
                          </label>
                          <p className="block text-sm font-normal text-gray-500">
                            {props?.editValue?.id
                              ? t("Please edit details of your section")
                              : t("Please fill in details of your new section")}
                          </p>
                        </div>
                        <div>
                          <FormikInput
                            type="text"
                            name="name"
                            label={t("Name")}
                            validation={validation}
                          />
                        </div>
                        <div>
                          <FormikTextArea
                            placeholder="Description max size can be 500"
                            type="text"
                            name="description"
                            label={t("Description")}
                            validation={validation}
                            isOptional
                          />
                        </div>
                        <div className="flex justify-end gap-4">
                          <CancelButton
                            onMouseDown={() => props.hidePopUp()}
                            type="button"
                            data-cy="cancel-section-button"
                            className="inline-flex items-center rounded border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                          >
                            {t("Cancel")}
                          </CancelButton>
                          <Button
                            onMouseDown={() => setValidation(true)}
                            loading={apiloading}
                            type="submit"
                            className={
                              props?.editValue?.id && !dirty
                                ? t(
                                  "cursor-not-allowed bg-indigo-600/50 hover:bg-indigo-600/50"
                                )
                                : ""
                            }
                            disabled={
                              props?.editValue?.id && !dirty ? true : false
                            }
                            id="section-pop-up-button"
                            data-cy="create-section-button"
                          >
                            {props.editValue.name ? t("Confirm") : t("Create")}
                          </Button>
                        </div>
                      </Form>
                    );
                  }}
                </Formik>
              </div>
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
