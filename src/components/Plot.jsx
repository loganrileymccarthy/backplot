import './Plot.css';
import { useRef } from 'react';
import { Box } from '@mui/material';

function Plot () {
    return (
        <div className='Plot'>
            <canvas></canvas>
        </div>
    )
}

export default Plot;