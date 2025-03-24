import CancelButton from "../../Button/cancelButton";
import Button from "../../Button";
import { useTranslation } from "react-i18next";
interface IProps {
  submitTitle: string;
  onCancel?: () => void;
  loading?: boolean | undefined;
  validateFunc?: () => void;
  validSubmit?: boolean;
  toched?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  idForSubmit?: string;
  dataAttr?: string;
}
export const FormSubmitPanel = ({
  submitTitle,
  validSubmit,
  onCancel,
  loading,
  validateFunc,
  idForSubmit,
  onClick,
  type,
  dataAttr,
}: IProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-4 justify-end pt-0.5 pb-20 flex-shrink-0">
      {onCancel && (
        <CancelButton
          onMouseDown={onCancel}
          type="button"
          className="py-1.5 px-2.5 text-xs inline-flex items-center border border-gray-300 rounded-md shadow-sm  font-medium focus:outline-none "
          data-cy="cancel-form-submit"
        >
          {t("Cancel")}
        </CancelButton>
      )}
      <Button
        onClick={onClick && onClick}
        id={idForSubmit}
        disabled={validSubmit}
        onMouseDown={validateFunc && validateFunc}
        loading={loading}
        type={type || "submit"}
        className={
          validSubmit
            ? "cursor-not-allowed bg-indigo-600/50 hover:bg-indigo-600/50"
            : ""
        }
        data-cy={dataAttr}
      >
        {submitTitle}
      </Button>
    </div>
  );
};
