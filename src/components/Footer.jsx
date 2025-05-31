import React from 'react';
import { Box } from '@mui/material';
import tux from '../images/linux.svg';
import './Footer.css';

export default function Footer() {
    return (
        <div className='Footer'>
            <Box display={'flex'} flexDirection={'row'}>
            
            <p>May 2025 | Logan McCarthy</p>
            <img src={tux} width={30}/>

            </Box>
        </div>
    )
}