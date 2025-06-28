import React from "react";
import * as Icons from "@phosphor-icons/react";
import { Folder, FolderOpen } from "lucide-react";

// copied from Linkwarden: apps/web/components/Icon.tsx
// modified to handle cases where the icon is not found in the phosphor-icons module

type Props = {
  icon: string;
  isOpen: boolean;
} & Icons.IconProps;

const FolderIcon = ({ icon, isOpen, ...rest }) => {
  const IconComponent: any = Icons[icon as keyof typeof Icons];

  if (!IconComponent) {
    return isOpen ? <FolderOpen {...rest} /> : <Folder {...rest} />;
  } else return <IconComponent {...rest} />;
};

FolderIcon.displayName = "Icon";

export default FolderIcon;
