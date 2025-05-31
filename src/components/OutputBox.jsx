import './OutputBox.css';
import React, {useRef} from 'react';
import { Box } from '@mui/material';

export default function OutputBox({$=1, text='', handleMouseClick, handleKeyPress, myRef}) {
  
  return (
    
    //only way I can get these damn things to size correctly is with dedicated boxes around them
      <>

      <Box height={'70%'}> 
      <canvas
      height={1000}
      width={1000}
      ref={myRef}
      />
      </Box>
      
      <Box height={'30%'}>
      <textarea 
      placeholder={'$'+$}
      value={text}
      spellCheck={false}
      onMouseUp={handleMouseClick}
      onKeyUp={handleKeyPress}
      />
      </Box>

      </>
  )
}