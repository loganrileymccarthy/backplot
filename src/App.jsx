import React, { useState } from 'react';
import {Box, Container, Button, Chip} from "@mui/material";
import { create, all } from 'mathjs';

import './App.css';
import Title from './components/Title';
import OutputBox from './components/OutputBox';
import InputBox from './components/InputBox';

function App() {
  
  //~~~ INITIALIZE USESTATE ~~~//
  //for things that should change and cause the page to re-render

  const [inputText, setInputText] = useState();
  const [output1, setOutput1] = useState();
  const [output2, setOutput2] = useState();
  const [output3, setOutput3] = useState();
  const [lineItems1, setLineItems1] = useState([{x1:0, y1:0, z1:0, x2:0, y2:0, z2:0}]);
  const [lineItems2, setLineItems2] = useState([{x1:0, y1:0, z1:0, x2:0, y2:0, z2:0}]);
  const [currentWindow, setCurrentWindow] = useState(0);
  const [currentLine1, setCurrentLine1] = useState(1);
  const [currentLine2, setCurrentLine2] = useState(1);

  //~~~ INITIALIZE MATHJS INSTANCE ~~~//
  //for evaluating expressions

  const math = create(all,  {});

  //~~~ MAIN OUTPUT FUNCTION ~~~//
  //set $ = which section to output
  //no $ = whole code

  function outputFunction (s, $) {

    //CHILD FUNCTIONS
    //to be called later

    function getNumberAfterChar(str, char) {    //used multiple places
      const index = str.indexOf(char);
      if (index === -1) {
        return '';  //no code
      }
      const substr = str.substring(index + char.length);
      const n = parseInt(substr);
      if (isNaN(n)) {
        return '';  //code with no number
      }
      return n;
    }
    function getFloatAfterChar(str, char) {     //will need this
      const index = str.indexOf(char);
      if (index === -1) {
        return '';  //no code
      }
      const substr = str.substring(index + char.length);
      const n = parseFloat(substr);
      if (isNaN(n)) {
        return '';  //code with no number
      }
      return n;
    }
    function getCharAfterSubstr(str, substr) {
      const index = str.indexOf(substr);
      if (index !== -1 && index + substr.length < str.length) {
        return str.charAt(index + substr.length);
      } else {
        return ''; 
      }
    }
    function getCharsUntilLetter(str) {         //for gathering expressions
      let substr = '';
      for (let i = 0; i < str.length; i++) {
        if (/[a-zA-Z]/.test(str[i])) {
          break;
        }
        substr += str[i];
      }
      return substr;
    }
    function addBits(s) {                       //for evaluating expressions
      var total = 0,
          s = s.match(/[+\-]*(\.\d+|\d+(\.\d+)?)/g) || [];
          
      while (s.length) {
        total += parseFloat(s.shift());
      }
      return total;
    }
    function strBetweenChars(str, char1, char2) {
      const index1 = str.indexOf(char1);
      const index2 = str.indexOf(char2);
        if (index1 !== -1 && index2 !== -1 && index1 < index2) {
          return str.substring(index1 + 1, index2);
        } else {
          return "";
    }
    }
    function getVars(str) {   //initial scan whole text for $0
      const index = str.indexOf("$0");
      if (index === -1) {
        return '';    //$0 not found
      }
      let vars = str.substring(index);
      while (vars.includes('#')) {
        let varNum = getNumberAfterChar(vars, '#');
        let varVal = getFloatAfterChar(vars.substr(vars.indexOf('#')), '=')
        varArr[varNum] = varVal / 10000;
        vars = vars.replace('#', '');
      }
      return vars;
    }
    function clean(line) {    //better to clean line by line instead of all at once
      
      //initial clean up
      line = line.replace(/\s/g, '');             //whitespace
      line = line.replace(/\([\s\S]*?\)/g, '');   //comments
      line = line.toUpperCase();                  //capitalize
      
      //ignoring these
      if (line.includes("IF")) line = '';
      if (line.includes("WHILE")) line = '';
      if (line.includes("M350")) line = '';

      //handle all #
      while (line.includes('#')) {
        let varNum = getNumberAfterChar(line, '#');
        let varText = '#' + varNum.toString();
        
        //declaration
        if (getCharAfterSubstr(line, varText) == '=') {
          
          //declared equal to another variable
          if (getCharAfterSubstr(line, varText + '=') == '#') {
            let var2Num = getNumberAfterChar(line, "=#");
            let var2Text = '#' + var2Num.toString();
            line = line.replace(var2Text, varArr[var2Num].toString());
          }
          
          let varVal = getFloatAfterChar(line, varText+'=');
          varArr[varNum] = varVal;
          line = line.replace(varText + '=', varNum.toString() + "::");
        }

        //regular variable occurrence
        line = line.replace(varText, varArr[varNum].toString());
      }

      return line;
    }
    function codeFilter(letter, num) {
      switch (letter) {
        case 'G':
          switch (num) {
            case 1: case 2: case 3: case 33: case 38: case 73: case 76: case 80: case 81: case 82: case 84: case 85: case 86: case 87: case 88: case 89:
              return 'A';
            case 17: case 18: case 19: case 17.1: case 17.2: case 17.3:
              return 'B';
            case 90: case 91:
              return 'C';
            case 90.1: case 91.1:
              return 'D';
            case 93: case 94:
              return 'E';
            case 20: case 21:
              return 'F';
            case 40: case 41: case 42: case 41.1: case 41.2:
              return 'G';
            case 43: case 43.1: case 49:
              return 'H';
            case 98: case 99:
              return 'I';
            case 54: case 55: case 56: case 57: case 58: case 59: case 59.1: case 59.2: case 59.3:
              return 'J';
            case 61: case 61.1: case 64:
              return 'K';
            case 96: case 97:
              return 'L';
            case 7: case 8:
              return 'M';
            default:
              return 'Z';
          }
        case 'M':
          switch (num) {
            case 0: case 1: case 2: case 30: case 60:
              return 'A';
            case 3: case 4: case 5:
              return 'B';
            case 23: case 24: case 25:
              return 'C';
            case 7: case 8: case 9:
              return 'D';
            case 48: case 49:
              return 'E';
            default:
              return 'Z';
          }
        default:
          return 'Z';    
      } 
    }
    function getCoord (line, char) {
      if (line.includes(char)) {
        let expr = getCharsUntilLetter(line.substring(line.indexOf(char)+1));
        expr = expr.replace(',' , '');
        expr = expr.replace('[' , '(');
        expr = expr.replace(']' , ')');
        console.log(expr);
        
        let res = parseFloat(math.evaluate(expr));
        console.log(res);

        return (res);
      }
      else return 99999;
    }
    function getCodes(line) {  //scan line, update codes, create array of findings
      
      var arr = [];
      
      //coords
      if (line.includes('X')) currentX = getCoord(line, 'X');
      if (line.includes('Y')) currentY = getCoord(line, 'Y');
      if (line.includes('Z')) currentZ = getCoord(line, 'Z');
      if (line.includes('U')) currentX += getCoord(line, 'U');
      if (line.includes('V')) currentY += getCoord(line, 'V');
      if (line.includes('W')) currentZ += getCoord(line, 'W');

      //T
      if (line.includes("T")) activeT = getFloatAfterChar(line, "T");

      //M,G
      while (line.includes('M')) {
        let n = getFloatAfterChar(line, 'M');
        switch(codeFilter('M', n)) {
          case 'A':
            activeMA = n;
            break;
          case 'B':
            activeMB = n;
            break;
          case 'C':
            activeMC = n;
            break;
          case 'D':
            activeMD = n;
            break;
          case 'E':
            activeME = n;
            break;
          default:
            arr.push('M' + n);
            break;
        }
        line = line.replace('M' + n, '_');
      }
      while (line.includes('G')) {
        let n = getFloatAfterChar(line, 'G');
        switch(codeFilter('G', n)) {
          case 'A':
            activeGA = n;
            break;
          case 'B':
            activeGB = n;
            break;
          case 'C':
            activeGC = n;
            break;
          case 'D':
            activeGD = n;
            break;
          case 'E':
            activeGE = n;
            break;
          case 'F':
            activeGF = n;
            break;
          case 'G':
            activeGG = n;
            break;
          case 'H':
            activeGH = n;
            break;
          case 'I':
            activeGI = n;
            break;
          case 'J':
            activeGJ = n;
            break;
          case 'K':
            activeGK = n;
            break;
          case 'L':
            activeGL = n;
            break;
          case 'M':
            activeGM = n;
            break;
          default:
            arr.push('G' + n);
            break;
        }
        line = line.replace('G' + n, '_');
      }
      
      return arr;
    }

    //DECLARE GCODE VARIABLES AND MODAL STATES
    //set defaults here!!

    var varArr = new Array(30000).fill(0);

    var activeT = '/';
    var activeMA='/', activeMB='/', activeMC='/', activeMD='/', activeME='/';
    var activeGA='/', activeGB='/', activeGC='/', activeGD='/', activeGE='/', activeGF='/', activeGG='/', activeGH='/', activeGI='/', activeGJ='/', activeGK='/', activeGL='/', activeGM='/';

    var currentX=0, currentY=0, currentZ=0;

    //PREPARE OUTPUT
    //preliminary scan for end variables
    //initialize objects for each line

    var output = '';
    var endVars = getVars(s);   //scan $0

    switch ($) {                //isolate desired section
      case 1: //$1
        s = s.substring(s.indexOf('$1'), s.indexOf('$2'));
        break;
      case 2: //$2
        s = s.substring(s.indexOf('$2'), s.indexOf('$0'));
        break;
      case 0: //$0
        return endVars; //just output $0
      default:
        break;
    }

    var a = s.split(/\r?\n/);   //split section by line
    var o = a.map(item => {     //make objects
      return {
        name: item
      };
    });

    //GENERATE OUTPUT
    //assign properties to each line object (coordinates, modal codes, etc.)
    //construct output text strings

    var n = 0;
    o.forEach(object => {     
      
      n++;            
      object.id = n;                                //set line number

      object.name = clean(object.name);             //clean line for scanning

      object.x1 = currentX;                         //set previous coords
      object.y1 = currentY;
      object.z1 = currentZ;

      object.codeArray = getCodes(object.name);     //scan line
      
      object.x2 = currentX;                         //set new coords
      object.y2 = currentY;
      object.z2 = currentZ;

      object.tool = activeT;                        //set tool

      object.codeMA = activeMA;                     //set modal states
      object.codeMB = activeMB;
      object.codeMC = activeMC;
      object.codeMD = activeMD;
      object.codeGA = activeGA;
      object.codeGB = activeGB;
      object.codeGC = activeGC;
      object.codeGD = activeGD;
      object.codeGE = activeGE;
      object.codeGF = activeGF;
      object.codeGG = activeGG;
      object.codeGH = activeGH;
      object.codeGI = activeGI;
      object.codeGJ = activeGJ;
      object.codeGK = activeGK;
      object.codeGL = activeGL;
      object.codeGM = activeGM;

      output += object.id.toString().padStart(4, '0') + ' '; 
      output += "[X " + object.x2.toFixed(4) + ' ';
      output += "Y " + object.y2.toFixed(4) + ' ';
      output += "Z " + object.z2.toFixed(4) + "] ";
      output += '\t';

      output += 'T' + object.tool + '\t';
      //output += 'M' + object.codeMA + ' ';
      output += 'M' + object.codeMB + ' ';
      output += 'M' + object.codeMC + ' ';
      //output += 'M' + object.codeMD + ' ';
      output += 'G' + object.codeGA + ' ';
      output += 'G' + object.codeGB + ' ';
      //output += 'G' + object.codeGC + ' ';
      //output += 'G' + object.codeGD + ' ';
      //output += 'G' + object.codeGE + ' ';
      //output += 'G' + object.codeGF + ' ';
      output += 'G' + object.codeGG + ' ';
      //output += 'G' + object.codeGH + ' ';
      //output += 'G' + object.codeGI + ' ';
      output += 'G' + object.codeGJ + ' ';
      //output += 'G' + object.codeGK + ' ';
      //output += 'G' + object.codeGL + ' ';
      //output += 'G' + object.codeGM + ' ';
      //output += object.codeArray + ' ';
      output += '\t';

      output += object.name + ' ';
      output += '\n';
    });

    switch ($) {
      case 1: //$1
        setLineItems1(o);
        break;
      case 2: //$2
        setLineItems2(o);
        break;
      default:
        setLineItems1(o);
        break;
    }

    if (s == '') {output = ''};   //handles blank input
    output = output.slice(0,-1);  //deletes empty line at end
    return output;
  }
  
  //~~~ EVENT HANDLING ~~~//
  //input changes, upload clicks, mouse and button interactions with output windows

  const handleInputInteraction = (event) => {
    setInputText(event.target.value)
  }
  const handleUpload = () => {
    setOutput1(outputFunction(inputText, 1));
    setOutput2(outputFunction(inputText, 2));
    setOutput3(outputFunction(inputText, 0));
  }
  const handleOutputInteraction1 = (event) => {
    setCurrentWindow(1);
    setCurrentLine1(event.target.value.substr(0, event.target.selectionStart).split("\n").length);
    
    /*
    //set up canvas and coords
    const canvas = document.getElementById("plot");
    const ctx = canvas.getContext("2d");
    const prevX = (canvas.width / 2) + (lineItems1[currentLine1-1].coordX );
    const prevY = (canvas.height / 2) + (lineItems1[currentLine1-1].coordY );
    const newX = (canvas.width / 2) + (lineItems1[currentLine1].coordX );
    const newY = (canvas.height / 2) + (lineItems1[currentLine1].coordY );

    
    //start new path
    ctx.clearRect(0,0,canvas.width, canvas.height)
    ctx.beginPath();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'red';
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(newX, newY);

    //draw path
    ctx.stroke();
    */
  }
  const handleOutputInteraction2 = (event) => {
    setCurrentWindow(2);
    setCurrentLine2(event.target.value.substr(0, event.target.selectionStart).split("\n").length);
  }

  //~~~ BUILD PAGE ~~~//

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
          <Box display="flex" flexDirection={'column'} height={'100%'} width={'25%'}>
            <InputBox
              text = {inputText}
              handleChange = {handleInputInteraction}
            />
            <Button 
              variant='contained' 
              color='secondary'
              onClick = {handleUpload}>
              UPLOAD
            </Button>
          </Box>
          <Box display="flex" flexDirection={'column'} height={'100%'} width={'100%'}>
            <canvas
              id="plot"
            />
            <Box display="flex" flexDirection={'row'} height={'30%'} width={'100%'}>
              <OutputBox
                $={1}
                text={output1}
                handleMouseClick={handleOutputInteraction1}
                handleKeyPress={handleOutputInteraction1}
              />
              <OutputBox
                $={2}
                text={output2}
                handleMouseClick={handleOutputInteraction2}
                handleKeyPress={handleOutputInteraction2}
              />
            </Box>
          </Box>
        </Box>
        <div className="cornerChip1">
          <Chip 
            label={"$1 X: " + lineItems1[currentLine1-1].x2.toFixed(4)}
            size='small' 
            variant='filled'
            color='secondary'
          />
        </div>
        <div className="cornerChip2">
          <Chip 
            label={"$1 Y: " + lineItems1[currentLine1-1].y2.toFixed(4)}
            size='small' 
            variant='filled'
            color='secondary'
          />
        </div>
        <div className="cornerChip3">
          <Chip 
            label={"$1 Z: " + lineItems1[currentLine1-1].z2.toFixed(4)}
            size='small' 
            variant='filled'
            color='secondary'
          />
        </div>
        <div className="cornerChip4">
          <Chip 
            label={"$2 X: " + lineItems2[currentLine2-1].x2.toFixed(4)}
            size='small' 
            variant='filled'
            color='info'
          />
        </div>
        <div className="cornerChip5">
          <Chip 
            label={"$2 Y: " + lineItems2[currentLine2-1].y2.toFixed(4)}
            size='small' 
            variant='filled'
            color='info'
          />
        </div>
        <div className="cornerChip6">
          <Chip 
            label={"$2 Z: " + lineItems2[currentLine2-1].z2.toFixed(4)}
            size='small' 
            variant='filled'
            color='info'
          />
        </div>
      </Container>
      </>
    </div>
  );
}

export default App;