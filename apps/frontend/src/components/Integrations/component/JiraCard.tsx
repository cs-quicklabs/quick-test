import { useState } from "react";
import Button from "../../Button";
import JiraLogo from "../../../assets/images/jira.svg";

import JiraModal from "./JiraModal";
import { useTranslation } from "react-i18next";
import AccessControl from "../../AccessControl";
import { JiraPluginPermissions } from "../../Utils/constants/roles-permission";

const JiraCard = ({ pluginConfig, getPluginConfig }: any) => {
  const { t } = useTranslation();
  const [showPopup, setShowPopup] = useState<boolean>(false);

  return (
    <>
      <div className="col-span-1 flex flex-col bg-white rounded-lg shadow-sm space-y-3 px-3 sm:px-6 py-5">
        <div className="w-36">
          {/* https://www.atlassian.com/company/news/press-kit */}
          <img
            src={JiraLogo}
            alt="JIRA Logo"
            title="Jira Logo"
            height={144}
            width={144}
            loading="eager"
          />
        </div>
        <p className="text-xs text-gray-500 ml-5">
          {t(
            "Using JIRA? Click the button below to set up the integration between JIRA and Quick Test. The integration enables you to view JIRA issues and add new issues directly from Quick Test."
          )}
        </p>
        <AccessControl
          permission={[
            JiraPluginPermissions.UPDATE_PLUGIN,
            JiraPluginPermissions.ADD_PLUGIN,
          ]}
        >
          <Button
            className="ml-1"
            data-cy="jira-configure-btn"
            onClick={() => setShowPopup(true)}
          >
            {pluginConfig.isIntegrated
              ? t("Re-configure Jira Integration")
              : t("Configure JIRA Integration")}
          </Button>
        </AccessControl>
      </div>

      {showPopup && (
        <JiraModal
          open={showPopup}
          setOpen={setShowPopup}
          pluginConfig={pluginConfig}
          getPluginConfig={getPluginConfig}
        />
      )}
    </>
  );
};

export default JiraCard;
