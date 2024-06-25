"use client";
import useWebSocket from "../hooks/useWebSocket";
import * as React from "react";
import { experimentalStyled as styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Unstable_Grid2";
import LinearProgress, {
  LinearProgressProps,
} from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { Hidden } from "@mui/material";

const serial: string[] = [
  // "00M09A342600271",
  // "00M09A342600260",
  // "00M09C431500177",
  // "00M09C431903549",
  // "00M09C431903109",
  // "00M09C411300736",
  // "00M09C412401291",
  // "00M09A381800295",
  // "00M09A381601473",
  // "00M00A2C0603600",
  // "00M09A381800295",
  // "00M09A351803089",
  // "00M09C431501094",
  "01S00C372600138",
  "01S00A2B0702006",
];

class Printer {
  public id: string;
  public name: string;
  public printJob: string;
  public temp: string;
  public timeLeft: string;
  public percent: number;
  public currentTray: number;
  public filName: string;
  public filColor: string;
  public error: string;

  constructor(sNum: string) {
    this.id = sNum;
    this.name = "";
    this.printJob = "";
    this.temp = "";
    this.timeLeft = "";
    this.percent = 0;
    this.currentTray = 0;
    this.filName = "";
    this.filColor = "";
    this.error = "";
  }
}

const update = (socketData: any, device: Printer, serialNum: string) => {
  device = new Printer(serialNum);
  device.name = JSON.stringify(
    socketData?.printer?.name,
    replacer,
    2
  ).replaceAll('"', "");
  device.printJob = JSON.stringify(
    socketData?.data?.subtask_name,
    replacer,
    2
  ).replaceAll('"', "");
  device.temp = JSON.stringify(
    socketData?.data?.ams?.ams[0]?.temp,
    replacer,
    2
  ).replaceAll('"', "");
  device.timeLeft = JSON.stringify(
    socketData?.data?.mc_remaining_time,
    replacer,
    2
  ).replaceAll('"', "");
  device.percent = parseFloat(
    JSON.stringify(socketData?.data?.mc_percent, replacer, 2).replaceAll(
      '"',
      ""
    )
  );
  device.currentTray = parseInt(
    JSON.stringify(socketData?.data?.ams?.ams[0]?.id, replacer, 2).replaceAll(
      '"',
      ""
    )
  );
  device.filName = identifyTray(socketData);
  device.filColor = "#".concat(
    JSON.stringify(
      socketData?.data?.ams?.ams[0]?.tray[device.currentTray - 1]?.tray_color,
      replacer,
      2
    ).replaceAll('"', "")
  );
  device.error = JSON.stringify(
    socketData?.data?.print_error,
    replacer,
    2
  ).replaceAll('"', "");
  return device;
};

var printerArray: Printer[] = [];

const updatePrinterArray = (socketData: any) => {
  for (let i = 0; i < serial.length; i++) {
    if (
      serial[i] ==
      JSON.stringify(socketData?.printer?.id, replacer, 2).replaceAll('"', "")
    ) {
      delete printerArray[i];
      printerArray[i] = update(socketData, printerArray[i], serial[i]);
      if (printerArray[i].id === "01S00A2B0702006") {
        console.log(socketData);
      }
      break;
    }
  }
};

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number }
) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", marginRight: 1 }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress
          className="loadingBar"
          sx={{ height: 20 }}
          variant="determinate"
          {...props}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          variant="body2"
          color="white"
          fontSize={20}
        >{`${props.value}%`}</Typography>
      </Box>
    </Box>
  );
}

const replacer = (key: any, value: any) =>
  typeof value === "undefined" ? null : value;

const getError = (code: string) => {
  const elem = document.getElementById("1234");
  const bigGuy = document.getElementById("money");
  if (code == "1" && elem != null && bigGuy != null) {
    elem.setAttribute("style", "color:red; font-size:20px;");
    bigGuy.setAttribute("style", "background-color:maroon;");
    return "ERROR";
  } else if (code != "1" && elem != null) {
    elem.setAttribute("style", "font-size:20px; color:white;");
    return "Good";
  }
};

const identifyTray = (socketData: any) => {
  const currentTray = JSON.stringify(socketData?.data?.ams?.ams[0]?.id);

  switch (currentTray) {
    case '"0"':
      // console.log(JSON.stringify((socketData?.data?.ams.ams[0].tray[0].name)).replaceAll( '\"', ''));
      return JSON.stringify(
        socketData?.data?.ams?.ams[0]?.tray[0]?.name,
        replacer,
        2
      ).replaceAll('"', "");
    case '"1"':
      return JSON.stringify(
        socketData?.data?.ams?.ams[0]?.tray[1]?.name,
        replacer,
        2
      ).replaceAll('"', "");
    case '"2"':
      return JSON.stringify(
        socketData?.data?.ams?.ams[0]?.tray[2]?.name,
        replacer,
        2
      ).replaceAll('"', "");
    case '"3"':
      return JSON.stringify(
        socketData?.data?.ams?.ams[0]?.tray[3]?.name,
        replacer,
        2
      ).replaceAll('"', "");
    default:
      // console.log(currentTray);
      return "None";
  }
};

export default function Home() {
  const socketData = useWebSocket() as any;
  React.useEffect(() => {
    updatePrinterArray(socketData);
  }, [socketData]);
  // console.log(socketData);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Box sx={{ flexGrow: 1 }}>
        <Grid
          margin={0}
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
        >
          {printerArray.map((printerArray, index) => (
            <Grid key={index} xs={2} sm={4} md={4}>
              <div id={`main-${printerArray?.error}`} className="box">
                <div className="innerContainer">
                  <div className="title">
                    <p>{printerArray.name}</p>
                  </div>
                  <p>Current Print: {printerArray.printJob}</p>

                  <p>Active Filament: {printerArray.filName}</p>

                  {/* <p style={{color:"#".concat((JSON.stringify((socketData?.data?.ams?.ams[0].tray[0].tray_color), replacer, 2).replaceAll( '\"', '')))}}>{(JSON.stringify((socketData?.data?.ams?.ams[0].tray[0].name), replacer, 2).replaceAll( '\"', ''))} </p> */}
                  {/* <p style={{color:"#".concat((JSON.stringify((socketData?.data?.ams?.ams[0].tray[1].tray_color), replacer, 2).replaceAll( '\"', '')))}}>{(JSON.stringify((socketData?.data?.ams?.ams[0].tray[1].name), replacer, 2).replaceAll( '\"', ''))} </p> */}
                  {/* <p style={{color:"#".concat((JSON.stringify((socketData?.data?.ams?.ams[0].tray[2].tray_color), replacer, 2).replaceAll( '\"', '')))}}>{(JSON.stringify((socketData?.data?.ams?.ams[0].tray[2].name), replacer, 2).replaceAll( '\"', ''))} </p> */}
                  {/* <p style={{color:"#".concat((JSON.stringify((socketData?.data?.ams?.ams[0].tray[3].tray_color), replacer, 2).replaceAll( '\"', '')))}}>{(JSON.stringify((socketData?.data?.ams?.ams[0].tray[3].name), replacer, 2).replaceAll( '\"', ''))} </p> */}
                  <p>
                    Status:{" "}
                    {printerArray?.error === "0"
                      ? "OK"
                      : printerArray?.error === "117473284"
                      ? "Spagetti"
                      : "ERROR CODE: " + printerArray?.error}
                  </p>
                  {/* <p id="1234" >Status: {getError(printerArray.error)}</p>  */}
                  {/* <p>{(JSON.stringify((socketData?.data?.ams?.ams[0].tray[3].name), replacer, 2).replaceAll( '\"', ''))}</p> */}
                  <div className="time">
                    <p>Time Remaining:</p>
                    <p style={{ fontSize: 20, paddingLeft: 4 }}>
                      {printerArray.timeLeft}
                    </p>
                  </div>
                  <Box sx={{ width: "100%" }}>
                    <LinearProgressWithLabel value={printerArray.percent} />
                  </Box>
                </div>
              </div>
            </Grid>
          ))}
        </Grid>
      </Box>
      <div>
        {/* <p>{printerArray[0].id}</p>
        <h1>Device socketData</h1>
        {socketData ? (
          <pre>{JSON.stringify(socketData, null, 100)}</pre>
        ) : (
          <p>No socketData received yet...</p>
        )} */}
      </div>
    </main>
  );
}
