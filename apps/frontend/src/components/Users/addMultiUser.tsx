/* eslint-disable react/no-unescaped-entities */

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { InformationCircleIcon } from "@heroicons/react/24/solid";

import { appRoutes, settingsRoutes } from "../Utils/constants/page-routes";
import axiosService from "../Utils/axios";
import BackButton from "../Button/cancelButton";
import Button from "../Button";
import { ToastMessage } from "../Utils/constants/misc";
import { showError } from "../Toaster/ToasterFun";

import MultipleMemberList from "./multipleMemberList";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { RoleId, RoleType } from "../Utils/constants/roles-permission";

function validateEmail(email: string) {
  const re = /^([\w\-+]|(?<!\.)\.)+[a-z0-9]@[a-z]+\.[a-z]{2,64}$/;
  return re.test(String(email).toLowerCase());
}

function validateName(name: string) {
  const re = /^(?=)[a-zA-Z æøåÆØÅ]+(?:[-' ][a-zA-Z æøåÆØÅ]+)*$/;
  return re.test(String(name).toLowerCase());
}

const AddMultiUser = () => {
  const { t } = useTranslation(["common"]);
  const [data, setData] = useState<any>([]);
  const navigate = useNavigate();
  const [roleList, setRoleList] = useState<any>([]);
  const [apiloading, setApiLoading] = useState(false);

  const getRoleList = useCallback(async () => {
    try {
      const resp = await axiosService.get("/roles/role");
      if (resp?.data?.data) {
        const respArray = resp.data.data;
        let tempArray: any[] = [];
        respArray.map((obj: any) => (tempArray = [...tempArray, obj.roleType]));
        let capitalizeArray: any[] = [];
        // let newValue:string;
        capitalizeArray = tempArray.map(
          (ele: string) =>
            ele &&
            (ele =
              ele.toLowerCase().charAt(0).toUpperCase() +
              ele.slice(1).toLowerCase())
        );
        setRoleList(capitalizeArray);
      }
    } catch (err) {
      // console.log(err?.message);
    }
  }, []);

  useEffect(() => {
    getRoleList();
  }, [getRoleList]);

  function validateRole(role: string) {
    if (roleList.includes(role.trim())) {
      return true;
    }
  }

  const submitFormAddMultipleUser = async () => {
    setApiLoading(true);

    const formData = {
      members: data,
    };
    try {
      await axiosService.post("/organizations/members/multiple", formData);
      navigate(`${appRoutes.SETTINGS}/${settingsRoutes.USERS}`);
    } catch (error) {
      if (error?.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
      }
    } finally {
      setApiLoading(false);
    }
  };

  const textAreahandler = (e: any) => {
    const listString = e?.target?.value.split("\n");
    setData([]);
    const array: any = [];
    listString.forEach((item: any) => {
      const stringArray = item.split(",");

      if (stringArray.length === 4) {
        array.push({
          firstName: stringArray[0]?.trim(),
          lastName: stringArray[1]?.trim(),
          email: stringArray[2]?.trim(),
          role: stringArray[3]?.trim(),
          valid:
            validateName(stringArray[0]?.trim()) &&
            validateName(stringArray[1]?.trim()) &&
            validateEmail(stringArray[2]?.trim()) &&
            validateRole(stringArray[3]?.trim()) &&
            stringArray[0]?.trim() !== "" &&
            stringArray[1]?.trim() !== "" &&
            stringArray[3]?.trim() !== "" &&
            array?.filter((obj: any) => obj?.email === stringArray[2]?.trim())
              ?.length === 0,
        });
      }
    });

    array.map((obj: any) => {
      if (obj.role.toUpperCase() === RoleType.OWNER) {
        const roleId = RoleId.OWNER;
        return (obj.roleId = roleId);
      } else if (obj.role.toUpperCase() === RoleType.ADMIN) {
        const roleId = RoleId.ADMIN;
        return (obj.roleId = roleId);
      } else {
        const roleId = RoleId.MEMBER;
        return (obj.roleId = roleId);
      }
    });
    const newArray = array.map(({ role, ...rest }: any) => rest);
    setData(newArray);
  };

  return (
    <>
      <div className=" mx-8 pb-10">
        <div className="flex w-full justify-between mt-4 items-center">
          <div>
            <label className="block text-lg font-medium text-gray-900">
              {t("Add New Users")}
            </label>
            <p className="block text-sm font-normal text-gray-500">
              {t("Please fill in details for new users.")}
            </p>
          </div>

          <div className="flex items-center">
            <BackButton
              onMouseDown={() => navigate(-1)}
              className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
              type="button"
            >
              {t("Back")}
            </BackButton>
          </div>
        </div>

        <div className="w-full mt-4">
          <div className="border p-5 rounded-md border-gray-900 mb-2 bg-indigo-100">
            <div className=" flex">
              <InformationCircleIcon className="text-blue-600 h-8 w-8" />
              <div>
                <div className="font-bold text-sm mb-2 ml-4 text-gray-800">
                  {t("Steps to add multiple users")}
                </div>
                <div className="text-sm ml-10">
                  <ol className="list-decimal">
                    <li className="empty-ol-item">
                      <p>
                        {t(
                          "Enter each user on a separate line in the text box below using the following format:"
                        )}
                      </p>

                      <div className="m-4">
                        <p className="text-gray-600 italic">
                          {t("FirstName, LastName, Email, Role")}
                          <br />
                          {t("Bob, Doe, bob@example.com, Member")}
                          <br />
                        </p>
                      </div>
                    </li>

                    <li className="empty-ol-item">
                      {t(
                        "Please ensure that first & last name should only contain letters."
                      )}
                    </li>
                    <li className="empty-ol-item">
                      {t(
                        "Please ensure that all user's email should be unique."
                      )}
                    </li>
                    <li className="empty-ol-item">
                      {t(`Please ensure role is `)}
                      <span>
                        {roleList.join(" or ")}. {t(`(case-sensitive)`)}
                      </span>
                    </li>
                    <li className="empty-ol-item">
                      {t(
                        "Use the Submit button at the bottom of the page to add the users."
                      )}
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-7 min-h-20">
            <div>
              <label
                htmlFor="Users*"
                className="block text-base font-medium text-gray-700"
              >
                {t("Users")}*
              </label>
              <div className="mt-1 relative">
                <textarea
                  id='Users*'
                  data-cy="textarea-multiple-user"
                  onChange={textAreahandler}
                  className="w-full border-2 border-gray-200 text-sm p-3"
                  rows={9}
                  cols={5}
                  placeholder={t("Please enter user's details.")}
                />
              </div>
            </div>
            <div>
              <MultipleMemberList users={data} />
            </div>
          </div>
          <div className="flex justify-end gap-4 -mt-4">
            <BackButton
              onMouseDown={() => navigate(-1)}
              type="button"
              className="inline-flex items-center rounded border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
            >
              {t("Cancel")}
            </BackButton>
            <Button
              id="add-user-submit"
              onClick={submitFormAddMultipleUser}
              loading={apiloading}
              type="submit"
              disabled={
                data?.length === 0 || data?.find((obj: any) => !obj?.valid)
              }
            >
              {t("Submit")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddMultiUser;
