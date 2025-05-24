import './OutputBox.css';

export default function OutputBox({$=1, text='', handleMouseClick, handleKeyPress}) {
  return (
    <textarea
      placeholder={'$'+$}
      value={text}
      spellCheck={false}
      onMouseUp={handleMouseClick}
      onKeyUp={handleKeyPress}
    />
  )
}