import './InputBox.css';

export default function InputBox({text, handleChange}) {
  return (
    <textarea
      placeholder="[enter code]

-include $1/$2/$0
-no expressions including letters
-no unclosed parentheses"
      value = {text}
      onChange = {handleChange}  
      spellCheck={false}
    />
  )
}