"use client";

import { Box } from "@mui/material";
import style from "../../styles/css/loading.module.css";

export default function Loading() {
  return (
    <Box className={style.localloader}>
      <Box className={style.container}>
        <Box className={style.dot}></Box>
        <Box className={style.dot}></Box>
        <Box className={style.dot}></Box>
        <Box className={style.dot}></Box>
      </Box>
    </Box>
  );
}
