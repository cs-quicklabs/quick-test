import { ReactNode, useMemo } from "react";
import React from "react";
import { NO_PERMISSION_TOOLTIP_MESSAGE } from "../Utils/constants/misc";
import { Tooltip } from "react-tooltip";

interface AccessControlProps {
  permission: string | string[];
  upperRoleEditPermission?: boolean;
  children: ReactNode | any;
}

const AccessControl = (props: AccessControlProps) => {
  const { children, permission, upperRoleEditPermission } = props;

  const cachedPermissions = useMemo(
    () => localStorage.getItem("allowedPermissions"),
    []
  );

  let allowedPermission: string[] = [];
  if (typeof cachedPermissions === "string") {
    allowedPermission = JSON.parse(cachedPermissions);
  }

  let isAllowed;
  if (
    upperRoleEditPermission !== undefined &&
    upperRoleEditPermission !== null
  ) {
    isAllowed = upperRoleEditPermission;
  } else if (Array.isArray(permission)) {
    isAllowed = permission.some((value: string) =>
      allowedPermission.includes(value)
    );
  } else {
    isAllowed = allowedPermission.includes(permission);
  }

  if (isAllowed) return <>{children}</>;
  else
    return (
      <>
        <span
          data-tooltip-id="no-permission-tooltip"
          data-tooltip-content={NO_PERMISSION_TOOLTIP_MESSAGE}
          data-tooltip-place="top"
          data-tooltip-trigger="mouseenter"
          data-tooltip-hideonclick="false"
        >
          {/* Reference: https://blog.logrocket.com/using-react-cloneelement-function/ */}
          {React.Children.map(children, (child) => {
            return React.cloneElement(child, {
              "aria-disabled": true,
              className: "cursor-not-allowed",
              disabled: true,
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                e.stopPropagation();
                e.preventDefault();
              },
            });
          })}
        </span>
        <Tooltip id="no-permission-tooltip" style={{ zIndex: 9999 }} />
      </>
    );
};

export default AccessControl;
