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