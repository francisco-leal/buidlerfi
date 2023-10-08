import { Typography } from "@mui/joy";
import { FC, ReactElement, cloneElement } from "react";
import { Flex } from "./flex";

interface Props {
  text: string;
  icon: ReactElement;
}

export const PageMessage: FC<Props> = ({ text, icon }) => {
  return (
    <Flex y yc xc grow gap3>
      {cloneElement(icon, { sx: { width: "128px", height: "128px", color: "neutral.700" } })}
      <Typography level={"body-lg"}>{text}</Typography>
    </Flex>
  );
};
