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
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : 'green',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,

}));

const replacer = (key:any, value:any) =>
  typeof value === 'undefined' ? null : value;

const replacer1 = (key:any, value:any) =>
  typeof value === 'undefined' ? '0' : value;


export default function Home() {
  const socketData = useWebSocket() as any;

  const think = parseInt(JSON.stringify( (parseInt(socketData?.data?.mc_percent)), replacer1, 2).replaceAll( '\"', ''));
  // const data = async socketData=>data;
  // name of print | {(JSON.stringify((socketData.data?.subtask_name), replacer, 2))}
  // {(JSON.stringify((socketData?.data?.mc_remaining_time), replacer, 2).replaceAll( '\"', ''))}
// setProgress((parseInt( (JSON.stringify((socketData?.data?.mc_percent), replacer, 2).replaceAll( '\"', ''))) ));
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((think) => ( think  ));
    }, 800);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={{ xs: 20, sm:0,  md: 10 }} columns={{ xs: 4, sm: 8, md: 12 }}>
          {Array.from(Array(1)).map((_, index) => (
            <Grid  xs={2} sm={4} md={12} key={index}>
              
              <Item >{socketData ? (
                <p>{(JSON.stringify((socketData?.data?.subtask_name), replacer, 2).replaceAll( '\"', ''))}</p>
                  ) : (
                      <p>No socketData received yet...</p>
                    )}
                    <p>Time Remaining: {(JSON.stringify((socketData?.data?.mc_remaining_time), replacer, 2).replaceAll( '\"', ''))}</p>
                    <Box sx={{ width: '100%' }}>
                      <LinearProgressWithLabel value={progress} />
                    </Box>
                    <p>|{think}|</p>
              </Item>
            </Grid>
          ))}
        </Grid>
      </Box>
      <div>
        <h1>Device socketData</h1>
        {socketData ? (
          <pre>{JSON.stringify(socketData?.data, null, 100)}</pre>
        ) : (
          <p>No socketData received yet...</p>
        )}
      </div>
    </main>

    
  );
}
