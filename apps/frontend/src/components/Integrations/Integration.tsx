import JiraCard from "./component/JiraCard";
import Loader from "../Loader/Loader";
import { useState, useEffect } from "react";
import axiosService from "../Utils/axios";
import { showError } from "../Toaster/Toast";
import { useTranslation } from "react-i18next";

const Integration = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  const [jiraPluginConfig, setJiraPluginConfig] = useState({
    accessToken: "",
    webAddress: "",
    userName: "",
    isIntegrated: "",
    id: "",
  });

  const getPluginConfig = async () => {
    try {
      setLoading(true);
      const response = await axiosService.get("/plugins/config");
      if (response.data.data === undefined) return;
      const { isIntegrated, accessToken, webAddress, userName, id } =
        response.data.data;

      setJiraPluginConfig({
        accessToken,
        webAddress,
        userName,
        isIntegrated,
        id,
      });
    } catch (error) {
      showError(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPluginConfig();
  }, []);

  return (
    <>
      <main className="pb-12 lg:col-span-9">
        <div className="flex flex-col px-2 lg:px-0 space-y-6">
          <div className=" pb-2 border-gray-200 sm:flex sm:items-center sm:justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {t("Integrations")}
            </h3>
          </div>
          {loading ? (
            <div className="flex justify-center items-center content-center my-32">
              <Loader withoverlay={true} />
            </div>
          ) : (
            <div
              id="integration-list"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3"
            >
              <JiraCard
                setLoading={setLoading}
                pluginConfig={jiraPluginConfig}
                getPluginConfig={getPluginConfig}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Integration;
