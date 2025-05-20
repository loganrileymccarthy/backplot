import React, { useState } from 'react';
import {Box, Container} from "@mui/material";

import './App.css';
import Title from './components/Title';
import InputForm from './components/InputForm';
import OutputForm from './components/OutputForm';

function App() {
  const [inputText, setInputText] = useState();
  
  return (
    <div className="App">
      <>

      <Container maxWidth={false} sx={{bgcolor: 'lightsteel', height: '5vh'}}>
        <Box display="flex" flexDirection={'row'} justifyContent={'center'}>
          <Title/>
        </Box>
      </Container>
      
      <Container maxWidth={false} sx={{ bgcolor: 'lightsteel', height: '90vh'}}>
        <Box display="flex" flexDirection={'row'} justifyContent={'center'} height={'100%'}>
          <InputForm {...{ inputText, setInputText}}/>
          <OutputForm input={inputText}/>
        </Box>
      </Container>

      </>
    </div>
  );
}

export default App;

/*
<Container maxWidth={false} display="flex" flexDirection="column" sx={{ bgcolor: 'lightsteel', height: '100%'}}>
        <Box display="flex" flexDirection={'row'}>
          <InputForm/>
          <Plot/>
        </Box>
        <Box display="flex" flexDirection="row" justifyContent={'right'} sx={{height: '5vh'}}>
          <CtrlButton1/>
          <CtrlButton2/>
          <CtrlButton3/>
        </Box>
      </Container>

<Button 
          variant="outlined"
          color='secondary'
          onClick={handleUploadClick}>
          UPLOAD
        </Button>
*/