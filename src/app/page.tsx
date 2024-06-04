"use client";
import useWebSocket from "../hooks/useWebSocket";
import * as React from 'react';
import { experimentalStyled as styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import "./page.css";
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
// import { get } from "http";

const serial: string[] = ["00M09A342600271", "00M09C431500177"];

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

  constructor(sNum:string) {
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
  };
};

const update = (socketData:any, device:Printer, serialNum:string) => {
  device = new Printer(serialNum);
  device.name = (JSON.stringify((socketData?.printer?.name), replacer, 2).replaceAll( '\"', ''));
  device.printJob = (JSON.stringify((socketData?.data?.subtask_name), replacer, 2).replaceAll( '\"', ''));
  device.temp = (JSON.stringify((socketData?.data?.ams?.ams[0]?.temp), replacer, 2).replaceAll( '\"', ''));
  device.timeLeft = (JSON.stringify((socketData?.data?.mc_remaining_time), replacer, 2).replaceAll( '\"', ''));
  device.percent = (parseFloat( (JSON.stringify((socketData?.data?.mc_percent), replacer, 2).replaceAll( '\"', ''))) );
  device.currentTray = parseInt( JSON.stringify((socketData?.data?.ams?.ams[0]?.id), replacer, 2).replaceAll( '\"', '') );
  device.filName = identifyTray(socketData);
  device.filColor = "#".concat((JSON.stringify((socketData?.data?.ams?.ams[0].tray[device.currentTray - 1]?.tray_color), replacer, 2).replaceAll( '\"', '')));
  device.error = JSON.stringify((socketData?.data?.ams?.print_error), replacer, 2).replaceAll( '\"', '');
  return device;
};

var printerArray: Printer[] = [];

const setPrinterArray = () => {
  for(let i =0; i<serial.length; i++){
    printerArray[i] = new Printer(serial[i]);
  }
};

const updatePrinterArray = (socketData:any) => {
  for(let i =0; i<serial.length; i++){
    // console.log("serial:",serial[i]);
    // console.log("printer:", (JSON.stringify((socketData?.printer?.id), replacer, 2).replaceAll( '\"', '')));
    if(serial[i] == (JSON.stringify((socketData?.printer?.id), replacer, 2).replaceAll( '\"', ''))){
      // console.log(socketData);
      printerArray[i] = update(socketData , printerArray[i], serial[i]);
      // console.log(printerArray);
      break;
    }
  }
};


function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${props.value}%`}</Typography>
      </Box>
    </Box>
  );
};

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : 'green',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const replacer = (key:any, value:any) =>
  typeof value === 'undefined' ? null : value;

const getError = (code:string) => {
  const elem = document.getElementById("1234");
  const bigGuy = document.getElementById("money");
  if(code == "1" && elem != null && bigGuy != null){
    elem.setAttribute("style", "color:red; font-size:20px;");
    bigGuy.setAttribute("style", "background-color:maroon;")
    return "ERROR"
  }
  else if (code != "1" && elem != null){
    elem.setAttribute("style","font-size:20px; color:white;");
    return "Good"
  }
};

const identifyTray = (socketData:any) => {
  const currentTray = JSON.stringify((socketData?.data?.ams?.ams[0]?.id));
  
  switch(currentTray) {
  case '"0"':
      // console.log(JSON.stringify((socketData?.data?.ams.ams[0].tray[0].name)).replaceAll( '\"', ''));
      return JSON.stringify((socketData?.data?.ams.ams[0].tray[0].name)).replaceAll( '\"', '');
    case '"1"':
      return JSON.stringify((socketData?.data?.ams.ams[0].tray[1].name)).replaceAll( '\"', '');
    case '"2"':
      return JSON.stringify((socketData?.data?.ams.ams[0].tray[2].name)).replaceAll( '\"', '');
    case '"3"':
      return JSON.stringify((socketData?.data?.ams.ams[0].tray[3].name)).replaceAll( '\"', '');
    default:
      // console.log(currentTray);
      return "None";
  }
  };
  

export default function Home() {
  const socketData = useWebSocket() as any;
  React.useEffect(() => {
    updatePrinterArray(socketData);
  },[socketData]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={{ xs: 20, sm:0,  md: 10 }} columns={{ xs: 4, sm: 8, md: 12 }}>
          {Array.from(Array(1)).map((_, index) => (
            <Grid  xs={2} sm={4} md={12} key={index}>
              {printerArray.map(printerArray => 
                <Item id="money">
                  <p>{printerArray.name}</p>
                  <p>{printerArray.printJob}</p>
                  <p>Time Remaining: {printerArray.timeLeft}</p>
                  <Box sx={{ width: '100%' }}>
                    <LinearProgressWithLabel value={printerArray.percent} />
                  </Box>

                  <p>Active Filament: {printerArray.filName}</p>

                  {/* <p style={{color:"#".concat((JSON.stringify((socketData?.data?.ams?.ams[0].tray[0].tray_color), replacer, 2).replaceAll( '\"', '')))}}>{(JSON.stringify((socketData?.data?.ams?.ams[0].tray[0].name), replacer, 2).replaceAll( '\"', ''))} </p> */}
                  {/* <p style={{color:"#".concat((JSON.stringify((socketData?.data?.ams?.ams[0].tray[1].tray_color), replacer, 2).replaceAll( '\"', '')))}}>{(JSON.stringify((socketData?.data?.ams?.ams[0].tray[1].name), replacer, 2).replaceAll( '\"', ''))} </p> */}
                  {/* <p style={{color:"#".concat((JSON.stringify((socketData?.data?.ams?.ams[0].tray[2].tray_color), replacer, 2).replaceAll( '\"', '')))}}>{(JSON.stringify((socketData?.data?.ams?.ams[0].tray[2].name), replacer, 2).replaceAll( '\"', ''))} </p> */}
                  {/* <p style={{color:"#".concat((JSON.stringify((socketData?.data?.ams?.ams[0].tray[3].tray_color), replacer, 2).replaceAll( '\"', '')))}}>{(JSON.stringify((socketData?.data?.ams?.ams[0].tray[3].name), replacer, 2).replaceAll( '\"', ''))} </p> */}
                  {/* <p id="1234" style={{fontSize: 200}}>Status: {getError("1")}</p> */}
                  <p id="1234" >Status: {getError(printerArray.error)}</p> 
                  {/* <p>{(JSON.stringify((socketData?.data?.ams?.ams[0].tray[3].name), replacer, 2).replaceAll( '\"', ''))}</p> */}
                  <p>{printerArray.temp}</p>
                </Item> 
              )}
            </Grid>
          ))}
        </Grid>
      </Box>
      <div>
        {/* <p>{printerArray[0].id}</p> */}
        <h1>Device socketData</h1>
        {socketData ? (
          <pre>{JSON.stringify(socketData, null, 100)}</pre>
        ) : (
          <p>No socketData received yet...</p>
        )}
      </div>
    </main>

    
  );
};
