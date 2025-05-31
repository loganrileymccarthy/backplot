import React from 'react';
import { Button, ButtonGroup, Box} from '@mui/material';
import './ViewButtons.css';

export default function ViewButtons({click1, click2, click3}) {
  return (
    <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>

      <ButtonGroup variant='contained' size='small' color='secondary' fullWidth>
        <Button onClick={click1}>ZX</Button>
        <Button onClick={click2}>ZY</Button>
        <Button onClick={click3}>XY</Button>
      </ButtonGroup>

    </Box>
  )
}