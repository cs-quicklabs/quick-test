import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { appRoutes, projectRoutes } from "../Utils/constants/page-routes";

const SingleList = (props: any) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const navigatePage = (id: string, place: string) => {
    navigate(`${appRoutes.PROJECTS}/${id}/${place}`);
  };
  return (
    <div
      data-cy={`favorite-project-${props?.index}`}
      className="pl-4 border-b w-full py-2 capitalize text-sm font-medium text-gray-900"
    >
      <div className="flex space-x-2  items-center ">
        <div className="">
          <svg
            onClick={() => props.deleteFromFavouriteList(props?.list?.id)}
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 cursor-pointer text-indigo-700 hover:text-indigo-100"
            viewBox="0 0 20 20"
            fill="currentColor"
            data-cy={`remove-favorite-${props?.index}`}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <h1 className="">{props?.list?.name}</h1>
      </div>
      <div className="flex space-x-2 text-xs">
        <h2
          className="underline text-gray-600 cursor-pointer pr-2 border-gray-400 border-r"
          onClick={() => navigatePage(props?.list?.id, "overview")}
        >
          {t("Overview")}
        </h2>
        <h2
          className="underline text-gray-600 cursor-pointer pr-2 border-gray-400 border-r"
          onClick={() => navigatePage(props?.list?.id, "todo")}
        >
          {t("Todos")}
        </h2>
        <h2
          className="underline text-gray-600 cursor-pointer pr-2 border-gray-400 border-r"
          onClick={() => navigatePage(props?.list.id, projectRoutes.MILESTONES)}
        >
          {t("Milestones")}
        </h2>
        <h2
          className="underline text-gray-600 cursor-pointer pr-2 border-gray-400 border-r"
          onClick={() => navigatePage(props?.list.id, projectRoutes.TESTCASES)}
        >
          {t("Test Cases")}
        </h2>
        <h2
          className="underline text-gray-600 cursor-pointer pr-2"
          onClick={() => navigatePage(props?.list.id, projectRoutes.TESTRUNS)}
        >
          {t("Test Runs")}
        </h2>
      </div>
    </div>
  );
};
export default SingleList;
