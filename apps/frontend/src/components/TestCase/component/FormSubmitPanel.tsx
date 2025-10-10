import CancelButton from "../../Button/cancelButton";
import Button from "../../Button";
import { useTranslation } from "react-i18next";
import { ButtonCSSStyles } from "../../Utils/constants/misc";
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
          className={ButtonCSSStyles.btnSecondary}
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
        className={ButtonCSSStyles.btnPrimary}
        data-cy={dataAttr}
      >
        {submitTitle}
      </Button>
    </div>
  );
};
