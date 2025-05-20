import './InputForm.css';
import {Box, Button} from "@mui/material";

export default function InputForm({inputText, setInputText}) {
  return (
    <Box display="flex" flexDirection={'column'} height={'100%'} width={'25%'}>
      <textarea
        name="inputBox"
        placeholder="enter code"
        value = {inputText}
        onChange = {(e) => {setInputText(e.target.value)}}
        
        spellCheck={false}
      />
    </Box>
  )
}