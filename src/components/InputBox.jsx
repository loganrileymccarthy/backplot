import './InputBox.css';

export default function InputBox({text, handleChange}) {
  return (
    <textarea
      placeholder="enter code"
      value = {text}
      onChange = {handleChange}  
      spellCheck={false}
    />
  )
}
/*
export default function InputForm({inputText, setInputText}) {
  return (
    <textarea
      name="inputBox"
      placeholder="enter code"
      value = {inputText}
      onChange = {(e) => {setInputText(e.target.value)}}  
      spellCheck={false}
    />
  )
}
*/