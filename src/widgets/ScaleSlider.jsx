import * as React from 'react';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import color from '../color/palettes';

const SliderTheme = createTheme({
  palette: {
    primary: {
      main: color.light3,
    },
  },
});

export default function ScaleSlider({onScale, currentScale}) {
  console.log(currentScale)
  const [scale, setScale] = useState(parseFloat(currentScale))
  const [initSale, setInitSale] = useState(parseFloat(currentScale))

 useEffect(() => {
   onScale(scale)
 }, [scale])

 useEffect(() => {
  setInitSale(parseFloat(currentScale))
 },[])
 

  return (
    <ThemeProvider theme={SliderTheme}>
      <Slider
        sx={{
          '& .MuiSlider-valueLabel': {
            fontSize: 12,
            zIndex: 20,
            fontWeight: 'normal',
            top: -40,
            backgroundColor: color.light3,
           // color: theme.palette.text.primary,
            '&:before': {
              display: 'none',
            },
            '& *': {
              background: 'transparent',
              color: '#fff',
            },
          },
        }}
        aria-label="Temperature"
        value={scale}
        valueLabelDisplay="auto"
        onChange={(e)=>{

        setScale( e.target.value)
        }}
        step={initSale*0.05}
        marks
        max={initSale*2}
        min={initSale*0.5}
      />
    </ThemeProvider>

  )
}
