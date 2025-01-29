import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Formik, Form } from "formik";
import * as Yup from "yup";

import { appRoutes, projectRoutes } from "../Utils/constants/page-routes";
import axiosService from "../Utils/axios";
import { ToastMessage, ValidatorMessage } from "../Utils/constants/misc";
import {
  FormikInput,
  FormikInputSearch,
  FormikTextArea,
} from "../Common/FormikInput";
import { FormSubmitPanel } from "../Common/FormSubmitPanel";
import Loader from "../Loader/Loader";
import { showError } from "../Toaster/ToasterFun";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

const EditTestRun = () => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const params = useParams();

  const editTestRunSchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .max(32, t(ValidatorMessage.NAME_MAX_LENGTH))
      .required(t(ValidatorMessage.NAME_REQ)),
    assignTo: Yup.string().required(t(ValidatorMessage.ASSIGN_REQ)),
  });

  const initialValues = {
    name: "",
    description: "",
    assignTo: "",
    nameOfAssignee: "",
    milestone: "",
    currentMilestone: "",
  };

  const [data, setData] = useState({ ...initialValues });
  const [showLoader, setShowLoader] = useState(true);
  const [apiloading, setApiLoading] = useState(false);
  const [options, setOptions] = useState<any>([]);
  const [milestoneOptions, setMilestoneOptions] = useState([]);

  const returnToMainPage = () =>
    navigate(`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTRUNS}`);

  const getSelectOptions = useCallback(async () => {
    try {
      const response = await axiosService.get(
        `/organizations/members/all/${params.pid}`
      );
      const memberData = response.data.data;
      const memberList = memberData.map((item: any) => {
        return { value: item.id, label: item.firstName + " " + item.lastName };
      });

      const milestoneResponse = await axiosService.get(
        `projects/${params.pid}/open/milestones`
      );
      const milestoneData = milestoneResponse.data.data;
      const milestoneList = milestoneData.map((item: any) => {
        return { value: item.id, label: item.name };
      });

      setMilestoneOptions(milestoneList);

      setOptions(memberList);
    } catch (error) {
      // console.log(error);
    }
  }, [params.pid]);
  const getTestRunDetails = useCallback(async () => {
    try {
      getSelectOptions();
      const response = await axiosService.get(
        `/projects/${params.pid}/test-suite-detail/${params.id}`
      );
      if (response.data.data.assignedTo === null) {
        setData({
          name: response.data.data.name,
          description: response.data.data.description || "",
          assignTo: "",
          nameOfAssignee: "",
          currentMilestone: response.data.data.milestoneId?.name,
          milestone: response.data.data.milestoneId?.id,
        });
      } else {
        setData({
          name: response.data.data.name,
          description: response.data.data.description || "",
          assignTo: response.data.data.assignedTo.id,
          nameOfAssignee:
            response.data.data.assignedTo.firstName +
            " " +
            response.data.data.assignedTo.lastName,
          currentMilestone: response.data.data.milestoneId?.name,
          milestone: response.data.data.milestoneId?.id,
        });
      }
      setShowLoader(false);
    } catch (err) {
      setShowLoader(false);
      if (err.response && err.response.data) {
        showError(err.response.data.message);
        if (err.response.status === 401) {
          localStorage.clear();
          sessionStorage.clear();
          navigate("/");
        }
      } else showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
    }
  }, [getSelectOptions, navigate, params.id, params.pid]);

  const submitFormEditTestRun = async (value: typeof initialValues) => {
    setApiLoading(true);
    try {
      let data = {};
      if (!value?.description?.trim() && !value?.milestone) {
        data = { name: value.name.trim(), assignTo: value.assignTo };
      } else if (!value?.description?.trim()) {
        data = {
          name: value.name.trim(),
          assignTo: value.assignTo,
          milestone: value.milestone,
        };
      } else if (!value?.milestone) {
        data = {
          name: value.name.trim(),
          assignTo: value.assignTo,
          description: value.description.trim(),
        };
      } else
        data = {
          name: value.name.trim(),
          description: value.description.trim(),
          assignTo: value.assignTo,
          milestone: value.milestone,
        };

      await axiosService.put(
        `/projects/${params.pid}/test-suite/${params.id}`,
        data
      );

      navigate(`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTRUNS}`);
      setApiLoading(false);
    } catch (err) {
      if (err.response && err.response.data) {
        showError(err.response.data.message);
      } else showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
      setApiLoading(false);
    }
  };

  useEffect(() => {
    if (params?.pid) {
      getTestRunDetails();
    }
  }, [getTestRunDetails, params]);

  return showLoader ? (
    <Loader withoverlay={true} />
  ) : (
    <>
      <div className="flex items-center justify-center mt-12 sm:mx-4 md:mx-20 lg:mx-4  xl:mx-16 ">
        <div className="sm:w-2/3 w-full mx-6 md:w-2/3 lg:w-2/4 xl:w-1/3 ">
          <Formik
            initialValues={data}
            validationSchema={editTestRunSchema}
            onSubmit={submitFormEditTestRun}
            enableReinitialize
          >
            {(formik) => {
              const { dirty } = formik;
              return (
                <Form className="space-y-6" autoComplete="off">
                  <div>
                    <h1 className="text-lg leading-6 font-medium text-gray-900">
                      {t("Edit Test Run")}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                      {t("Please update the details of your test run.")}
                    </p>
                  </div>
                  <div>
                    <FormikInput type="text" name="name" label="Name" />
                  </div>
                  <div>
                    <FormikInputSearch
                      type="text"
                      label={t("Assign To")}
                      name="assignTo"
                      optionsForSelect={options}
                      valueOfLabel={data.nameOfAssignee}
                    />
                  </div>
                  <div>
                    <FormikInputSearch
                      type="text"
                      label={t("Milestone")}
                      name="milestone"
                      optionsForSelect={milestoneOptions}
                      valueOfLabel={data.currentMilestone}
                      isOptional
                    />
                  </div>
                  <div>
                    <FormikTextArea
                      type="text"
                      name="description"
                      label={t("Description")}
                      isOptional
                    />
                  </div>
                  <FormSubmitPanel
                    dataAttr="update-test-run"
                    idForSubmit="edit-test-run"
                    onCancel={returnToMainPage}
                    loading={apiloading}
                    validSubmit={params?.id && !dirty ? true : false}
                    submitTitle={t("Update")}
                  />
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default EditTestRun;
