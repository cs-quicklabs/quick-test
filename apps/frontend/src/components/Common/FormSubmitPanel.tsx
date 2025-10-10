import CancelButton from "../Button/cancelButton";
import Button from "../Button";
import { Trans, useTranslation } from "react-i18next";
import { ButtonCSSStyles } from "../Utils/constants/misc";

interface IProps {
  submitTitle: string;
  onCancel?: () => void;
  loading?: boolean | undefined;
  validateFunc?: () => void;
  validSubmit?: boolean;
  toched?: boolean;
  idForSubmit: string;
  dataAttr?: string;
}

export const FormSubmitPanel = ({
  submitTitle,
  validSubmit,
  onCancel,
  loading,
  validateFunc,
  idForSubmit,
  dataAttr,
}: IProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-end gap-4 pb-20 pl-30 sm:pl-40">
      {onCancel && (
        <CancelButton
          data-cy="cancel-form-submit"
          onMouseDown={onCancel}
          type="button"
          className={ButtonCSSStyles.btnSecondary}
        >
          {t("Cancel")}
        </CancelButton>
      )}
      <Button
        data-cy={dataAttr}
        id={idForSubmit}
        disabled={validSubmit}
        onMouseDown={validateFunc && validateFunc}
        loading={loading}
        type="submit"
        className={ButtonCSSStyles.btnPrimary}
      >
        <Trans>{submitTitle}</Trans>
      </Button>
    </div>
  );
};
