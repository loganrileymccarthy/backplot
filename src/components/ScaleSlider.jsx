import React from 'react';
import { Slider, Box } from '@mui/material';
import './ScaleSlider.css';

export default function ScaleSlider({handleChange}) {
  return (
    <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
      
      <Slider 
      size='small' 
      color='inherit' 
      min={10} 
      max={1000} 
      defaultValue={100} 
      onChange={handleChange}
      />
      
    </Box>
  )
}