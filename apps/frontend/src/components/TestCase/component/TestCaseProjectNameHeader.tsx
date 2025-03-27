import { useTranslation } from "react-i18next";

interface projectNameType {
  projectName: string;
}

export default function TestCaseProjectNameHeader({
  projectName,
}: projectNameType) {
  const { t } = useTranslation();
  return (
    <div className=" text-xl font-medium">
      {projectName}
      {projectName && (
        <span className=" text-xs ml-1 text-gray-500">{t("in Projects")}</span>
      )}
    </div>
  );
}
