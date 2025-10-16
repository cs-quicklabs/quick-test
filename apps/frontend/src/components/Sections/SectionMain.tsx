import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { ButtonCSSStyles, ToastMessage } from "../Utils/constants/misc";
import { showError, showSuccess } from "../Toaster/Toast";
import SectionListing from "./SectionListing";
import Button from "../Button";
import DeleteConfirmationModal from "../Common/DeleteModal";
import SectionPopUp from "./SectionPopUp";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { getSectionsData } from "../../reducers/sectionSlice";
import { useAppDispatch } from "../../store/hooks";
import { deleteSectionApi } from "../../services/sectionServices";

const SectionMain = (props: any) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { pid } = useParams();
  const [popup, setPopUp] = useState(false);
  const [showModal, toggleModal] = useState(false);
  const [modalMsg, setMsg] = useState(<></>);
  const [selectedId, setSelectedId] = useState("");
  const [editValue, setEditValue] = useState({});

  const showPopUp = () => {
    setEditValue({});
    setPopUp(true);
  };

  const hidePopUp = () => {
    setPopUp(false);
    setTimeout(() => {
      document.getElementById("show-pop-up")?.blur();
    }, 0);
  };

  const editSection = (values: {
    id: string;
    name: string;
    description: string;
  }) => {
    setPopUp(true);
    setEditValue({ ...values });
  };

  const getSections = useCallback(async () => {
    dispatch(getSectionsData(pid as string)).catch((error) => {
      error?.response?.data?.message
        ? showError(error.response.data.message)
        : showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
    });
  }, [pid, dispatch]);

  const openDeleteModal = (value: any) => {
    const msg = (
      <>
        {t("Are you sure want to delete the section")}{" "}
        <span className="font-semibold text-red-500">{`"${value?.name}"`}</span>
        ?
      </>
    );
    setMsg(msg);
    setSelectedId(value.id);
    toggleModal(true);
  };

  const deleteSection = async () => {
    toggleModal(false);
    deleteSectionApi(pid as string, selectedId)
      .then((res) => {
        props.getTestCases();
        getSections();
        showSuccess(res.data.message);
      })
      .catch((err) => {
        if (err?.response?.data) {
          showError(err.response.data.message);
        }
      });
  };

  useEffect(() => {
    getSections();
  }, [getSections]);

  return (
    <div
      className="h-screen lg:border-l lg:border-gray-200 grid-cols-1 lg:gap-2 xl:w-96"
      data-cy="section-area"
    >
      <div className="px-6">
        <div className="bg-white">
          <div className="py-4 ">
            <h3 className="form-title">
              {t("Add New Section/Test Case")}
            </h3>
            <div className="form-subtitle">
              <p>
                {t(
                  "Create new test cases and assign them to different sections or create a new section to group your test cases."
                )}
              </p>
            </div>
            <div className="mt-5 flex gap-4">
              <Button
                id="show-pop-up"
                data-cy="add-section"
                type="button"
                onClick={() => showPopUp()}
                className={ButtonCSSStyles.btnPrimary}
              >
                {t("Add Section")}
              </Button>
              <Button
                id={"New Test Case"}
                loading={false}
                type="button"
                data-cy={"new-test-case"}
                onClick={() => {
                  props.addTestCase();
                }}
                className={ButtonCSSStyles.btnPrimary}
              >
                {t("Add Test Case")}
              </Button>
            </div>
          </div>
        </div>
        <SectionListing
          editPopUp={editSection}
          openDeleteModal={openDeleteModal}
        />
      </div>
      {popup && (
        <SectionPopUp
          popup={popup}
          hidePopUp={hidePopUp}
          editValue={editValue}
          getSection={() => getSections()}
        />
      )}
      {showModal && (
        <DeleteConfirmationModal
          msg={modalMsg}
          open={showModal}
          toggleModal={toggleModal}
          delete={deleteSection}
        />
      )}
    </div>
  );
};

export default SectionMain;
