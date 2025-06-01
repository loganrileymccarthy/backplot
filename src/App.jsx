import React, { useState, useRef, useEffect } from 'react';
import {Box, Container, Button, Card, CardContent, CardMedia, CardActionArea, Typography, Slider, ButtonGroup} from "@mui/material";
import { create, all} from 'mathjs';

import './App.css';
import Title from './components/Title';
import Footer from './components/Footer';
import InputBox from './components/InputBox';
import OutputBox from './components/OutputBox';
import ViewButtons from './components/ViewButtons';
import ScaleSlider from './components/ScaleSlider';


function App() {
  
  //~~~ INITIALIZE USESTATE ~~~//
  //for things that should change and cause the page to re-render
  const [inputText, setInputText] = useState();
  const [output1, setOutput1] = useState();
  const [output2, setOutput2] = useState();
  const [output3, setOutput3] = useState();
  const [lineItems1, setLineItems1] = useState([{
    name:'', x1:0, y1:0, z1:0, x2:0, y2:0, z2:0, op:0, tool:0, i:0, j:0, k:0, r:0,
    codeMA:'', codeMB:'', codeMC:'', codeMD:'', 
    codeGA:'', codeGB:'', codeGC:'', codeGD:'', codeGE:'', codeGF:'', codeGG:'', codeGH:'', 
    codeGI:'', codeGJ:''}]);
  const [lineItems2, setLineItems2] = useState([{
    name:'', x1:0, y1:0, z1:0, x2:0, y2:0, z2:0, op:0, tool:0, i:0, j:0, k:0, r:0,
    codeMA:'', codeMB:'', codeMC:'', codeMD:'', 
    codeGA:'', codeGB:'', codeGC:'', codeGD:'', codeGE:'', codeGF:'', codeGG:'', codeGH:'', 
    codeGI:'', codeGJ:''}]);
  const [currentLine1, setCurrentLine1] = useState(1);
  const [currentLine2, setCurrentLine2] = useState(1);
  const [currentWindow, setCurrentWindow] = useState(0);
  const [currentView1, setCurrentView1] = useState(1);
  const [currentView2, setCurrentView2] = useState(1);
  const [scale1, setScale1] = useState(100);
  const [scale2, setScale2] = useState(100);
  
  //~~~ INITIALIZE USEREF ~~~//
  //for referencing canvases to draw on
  const canvasRef1 = useRef(null);
  const canvasRef2 = useRef(null);

  //~~~ INITIALIZE USEEFFECT ~~~//
  //for drawing based on changes
  useEffect(() => {drawFunction(1);}, [currentLine1]);
  useEffect(() => {drawFunction(2);}, [currentLine2]);
  useEffect(() => {drawFunction(1);}, [currentView1]);
  useEffect(() => {drawFunction(2);}, [currentView2]);
  useEffect(() => {drawFunction(1);}, [scale1]);
  useEffect(() => {drawFunction(2);}, [scale2]);
  

  //~~~ INITIALIZE MATHJS INSTANCE ~~~//
  //for evaluating expressions
  const math = create(all,  {});

  //~~~ OUTPUT FUNCTION ~~~//
  //called when user clicks upload
  //set $ = which section to output
  //no $ = whole code
  function outputFunction (s, $) {

    //CHILD FUNCTIONS to be called later
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
        
        //if it's a declaration
        if (getCharAfterSubstr(line, varText) == '=') {
          let postEq = line.substr(line.indexOf('=') + 1);
          
          //handle variables on right side of equals sign
          while (postEq.includes('#')) {
            let var2Num = getNumberAfterChar(postEq, "#");
            let var2Text = '#' + var2Num.toString();
            postEq = postEq.replace(var2Text, varArr[var2Num].toString());
          }
          
          //assign new value to variable on left of equals sign
          postEq = postEq.replace('[', '(');
          postEq = postEq.replace(']', ')');
          let varVal = math.evaluate(postEq);
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
            //motion
            case 0: case 1: case 2: case 3: 
            case 70: case 71: case 72: case 73: case 74:case 75: case 76: case 77: case 78: case 79: 
            case 80: case 81: case 82: case 83: case 84: case 85: case 86: case 87: case 88: case 89:
              return 'A';
            //coords
            case 15: case 16:
              return 'B';
            //plane
            case 17: case 18: case 19: case 17.1: case 17.2: case 17.3:
              return 'C';
            //units
            case 20: case 21:
              return 'D';
            //comp
            case 40: case 41: case 42: case 41.1: case 41.2:
              return 'E';
            //work zone
            case 54: case 55: case 56: case 57: case 58: case 59: 
            case 59.1: case 59.2: case 59.3: case 59.4: case 59.5:
              return 'F';
            //speed mode
            case 96: case 97:
              return 'G';
            //feed mode
            case 98: case 99:
              return 'H';
            //start point mode
            case 115: case 116:
              return 'I';
            //sync mode
            case 600: case 610: case 620: case 630: case 640: case 650:
              return 'J';
            default:
              return 'Z';
          }
        case 'M':
          switch (num) {
            //spindle 1
            case 3: case 4: case 5:
              return 'A';
            //spindle 2
            case 23: case 24: case 25:
              return 'B';
            //spindle 1 clamping
            case 6: case 7:
              return 'C';
            //spindle 2 clamping
            case 15: case 16:
              return 'D';
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
        
        let res = parseFloat(math.evaluate(expr));

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

      //T,N
      if (line.includes('T')) activeT = getFloatAfterChar(line, 'T');
      if (line.includes('N')) activeN = getFloatAfterChar(line, 'N');
      
      //I,J,K
      if (line.includes('I')) activeI = getFloatAfterChar(line, 'I');
      else activeI = 0;
      if (line.includes('J')) activeJ = getFloatAfterChar(line, 'J');
      else activeJ = 0;
      if (line.includes('K')) activeK = getFloatAfterChar(line, 'K');
      else activeK = 0;
      if (line.includes('R')) activeR = getFloatAfterChar(line, 'R');
      else activeR = 0;

      //M,G
      while (line.includes('M')) {
        let n = getFloatAfterChar(line, 'M');
        switch(codeFilter('M', n)) {
          //if modal, update modal group
          case 'A': activeMA = n; break;
          case 'B': activeMB = n; break;
          case 'C': activeMC = n; break;
          case 'D': activeMD = n; break;
          //if not part of modal group, add to output array
          default: arr.push('M' + n); break;
        }
        line = line.replace('M', '_');
      }
      while (line.includes('G')) {
        let n = getFloatAfterChar(line, 'G');
        switch(codeFilter('G', n)) {
          //if modal, update modal group
          case 'A': activeGA = n; break;
          case 'B': activeGB = n; break;
          case 'C': activeGC = n; break;
          case 'D': activeGD = n; break;
          case 'E': activeGE = n; break;
          case 'F': activeGF = n; break;
          case 'G': activeGG = n; break;
          case 'H': activeGH = n; break;
          case 'I': activeGI = n; break;
          case 'J': activeGJ = n; break;
          //if not part of modal group, add to output array
          default: arr.push('G' + n); break;
        }
        line = line.replace('G', '_');
      }
      
      return arr;
    }

    //DECLARE GCODE VARIABLES AND MODAL STATES
    //set defaults here!!
    
    var varArr = new Array(30000).fill(0);
    var activeT='', activeN='';
    var activeMA='', activeMB='', activeMC='', activeMD='';
    var activeGA='', activeGB='', activeGC='', activeGD='', activeGE='', activeGF='', activeGG='', activeGH='', activeGI='', activeGJ='';
    var currentX=0, currentY=0, currentZ=0;
    var activeI=0, activeJ=0, activeK=0, activeR=0;

    //PREPARE OUTPUT
    //preliminary scan for end variables
    //initialize objects for each line
    
    var n = 0;
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
      object.op = activeN;

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

      object.i = activeI;
      object.j = activeJ;
      object.k = activeK;
      object.r = activeR;

      output += object.id.toString().padStart(4, '0') + ' '; 
      output += object.name + ' ';
      output += '\n';
    });
    
    //update line objects state only after reading all lines
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

    if (s == '') {output = ''};   //handle blank input
    output = output.slice(0,-1);  //delete empty line at end
    return output;
  }

  //~~~ DRAWING FUNCTION ~~~//
  //called when user interacts with output text
  const drawFunction = ($) => {
    
    let canvas, context;
    let current = {};
    let coords = {};

    //draw background
    const drawGrid = (canvas, context, spacing) => {
      context.clearRect(0,0,canvas.width, canvas.height);
      context.strokeStyle = 'lightgray';
      context.lineWidth = 0.2;
      
      for (let x = canvas.width/2; x <= canvas.width; x += spacing) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
      }
      for (let x = canvas.width / 2; x >= 0; x -= spacing) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
      }
      for (let y = canvas.height / 2; y <= canvas.height; y += spacing) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
      }
      for (let y = canvas.height / 2; y >= 0; y -= spacing) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
      }
    }
    //take start and end positions from line, calculate canvas coords
    const setCoords = (lineObj, view, canvas, scale) => {
      var newCoords = {};

      switch (view) {
        
        case 1:   // ZX VIEW
          newCoords.x1 = (canvas.width / 2) + /**/(lineObj.z1 * scale);
          newCoords.x2 = (canvas.width / 2) + /**/(lineObj.z2 * scale);
          newCoords.y1 = (canvas.height / 2) - /**/(lineObj.x1 * scale);
          newCoords.y2 = (canvas.height / 2) - /**/(lineObj.x2 * scale);
          //will arc be seen?
          if (lineObj.codeGC == 18) {
            newCoords.isArc = true;
            //find arc center from ijk
            if (lineObj.i != 0 || lineObj.j != 0 || lineObj.k != 0) {
              newCoords.centerX = newCoords.x1 + /**/(lineObj.k /**/* scale);
              newCoords.centerY = newCoords.y1 - /**/(lineObj.i /**/* scale);
            }
            //find arc center from r
            //NEEDS WORK, IS WRONG
            else if (lineObj.r != 0) {
              newCoords.midX = newCoords.x1 + ((newCoords.x2 - newCoords.x1)/2);
              newCoords.midY = newCoords.y1 + ((newCoords.y2 - newCoords.y1)/2);
              newCoords.slope = (newCoords.x1 - newCoords.x2) / (newCoords.y1 - newCoords.y2);
              if (newCoords.y1 == newCoords.y2) {
                let H = Math.sqrt((newCoords.x2 - newCoords.x1)*(newCoords.x2 - newCoords.x1) + (newCoords.y2 - newCoords.y1)*(newCoords.y2 - newCoords.y1));
                let h = H / 2;
                let L = Math.sqrt(((lineObj.r*scale)*(lineObj.r*scale)) - (h*h));
                newCoords.centerX = newCoords.midX;
                newCoords.centerY = newCoords.y1 - /**/L;
              } else {
                newCoords.centerX = newCoords.midX + /**/((lineObj.r*scale) / Math.sqrt(1 + (newCoords.slope * newCoords.slope)));
                newCoords.centerY = newCoords.midY - /**/(((lineObj.r*scale) * newCoords.slope) / Math.sqrt(1 + (newCoords.slope * newCoords.slope)));
              }
            }
          }
          //arc won't be seen
          else newCoords.isArc = false;
          break;
        
        case 2: // ZY VIEW
          newCoords.x1 = (canvas.width / 2) + /**/(lineObj.z1 * scale);
          newCoords.x2 = (canvas.width / 2) + /**/(lineObj.z2 * scale);
          newCoords.y1 = (canvas.height / 2) - /**/(lineObj.y1 * scale);
          newCoords.y2 = (canvas.height / 2) - /**/(lineObj.y2 * scale);
          //will arc be seen?
          if (lineObj.codeGC == 19) {
            newCoords.isArc = true;
            //find arc center from ijk
            if (lineObj.i != 0 || lineObj.j != 0 || lineObj.k != 0) {
              newCoords.centerX = newCoords.x1 + /**/(lineObj.k /**/* scale);
              newCoords.centerY = newCoords.y1 - /**/(lineObj.j /**/* scale);
            }
            //find arc center from r
            //NEEDS WORK, IS WRONG
            else if (lineObj.r != 0) {
              newCoords.midX = newCoords.x1 + ((newCoords.x2 - newCoords.x1)/2);
              newCoords.midY = newCoords.y1 + ((newCoords.y2 - newCoords.y1)/2);
              newCoords.slope = (newCoords.x1 - newCoords.x2) / (newCoords.y1 - newCoords.y2);
              if (newCoords.y1 == newCoords.y2) {
                let H = Math.sqrt((newCoords.x2 - newCoords.x1)*(newCoords.x2 - newCoords.x1) + (newCoords.y2 - newCoords.y1)*(newCoords.y2 - newCoords.y1));
                let h = H / 2;
                let L = Math.sqrt(((lineObj.r*scale)*(lineObj.r*scale)) - (h*h));
                newCoords.centerX = newCoords.midX;
                newCoords.centerY = newCoords.y1 - /**/L;
              } else {
                newCoords.centerX = newCoords.midX + /**/((lineObj.r*scale) / Math.sqrt(1 + (newCoords.slope * newCoords.slope)));
                newCoords.centerY = newCoords.midY - /**/(((lineObj.r*scale) * newCoords.slope) / Math.sqrt(1 + (newCoords.slope * newCoords.slope)));
              }
            }
          }
          //arc won't be seen
          else newCoords.isArc = false;
          break;

        case 3:  // XY VIEW
          newCoords.x1 = (canvas.width / 2) + /**/(lineObj.x1 * scale);
          newCoords.x2 = (canvas.width / 2) + /**/(lineObj.x2 * scale);
          newCoords.y1 = (canvas.height / 2) - /**/(lineObj.y1 * scale);
          newCoords.y2 = (canvas.height / 2) - /**/(lineObj.y2 * scale);
          //will arc be seen?
          if (lineObj.codeGC == 17) {
            newCoords.isArc = true;
            //find arc center from ijk
            if (lineObj.i != 0 || lineObj.j != 0 || lineObj.k != 0) {
              newCoords.centerX = newCoords.x1 + /**/(lineObj.i /**/* scale);
              newCoords.centerY = newCoords.y1 - /**/(lineObj.j /**/* scale);
            }
            //find arc center from r
            //NEEDS WORK, IS WRONG
            else if (lineObj.r != 0) {
              newCoords.midX = newCoords.x1 + ((newCoords.x2 - newCoords.x1)/2);
              newCoords.midY = newCoords.y1 + ((newCoords.y2 - newCoords.y1)/2);
              newCoords.slope = (newCoords.x1 - newCoords.x2) / (newCoords.y1 - newCoords.y2);
              if (newCoords.y1 == newCoords.y2) {
                let H = Math.sqrt((newCoords.x2 - newCoords.x1)*(newCoords.x2 - newCoords.x1) + (newCoords.y2 - newCoords.y1)*(newCoords.y2 - newCoords.y1));
                let h = H / 2;
                let L = Math.sqrt(((lineObj.r*scale)*(lineObj.r*scale)) - (h*h));
                newCoords.centerX = newCoords.midX;
                newCoords.centerY = newCoords.y1 - /**/L;
              } else {
                newCoords.centerX = newCoords.midX + /**/((lineObj.r*scale) / Math.sqrt(1 + (newCoords.slope * newCoords.slope)));
                newCoords.centerY = newCoords.midY - /**/(((lineObj.r*scale) * newCoords.slope) / Math.sqrt(1 + (newCoords.slope * newCoords.slope)));
              }
            }
          }
          //arc won't be seen
          else newCoords.isArc = false;
          break;
          
        default:
          break;
      }
      return newCoords;
    }
    //draw black lines for G0 moves
    const drawG0 = (context, coords) => {
      context.beginPath();
      context.lineWidth = 1;
      context.strokeStyle = 'black';
      context.moveTo(coords.x1, coords.y1);
      context.lineTo(coords.x2, coords.y2);
      context.stroke();
    }
    //draw red lines for G1 moves
    const drawG1 = (context, coords) => {
      context.beginPath();
      context.lineWidth = 1;
      context.strokeStyle = 'red';
      context.moveTo(coords.x1, coords.y1);
      context.lineTo(coords.x2, coords.y2);
      context.stroke();
    }
    //draw yellow lines for G2 moves
    const drawG2 = (context, coords) => {
      if (coords.isArc == false) {
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = 'yellow';
        context.moveTo(coords.x1, coords.y1);
        context.lineTo(coords.x2, coords.y2);
        context.stroke();
        return;
      }

      let dX = coords.x1 - coords.centerX;
      let dY = coords.y1 - coords.centerY;
      let radius = Math.abs(Math.sqrt(dX*dX + dY*dY));
      let startAngle = Math.atan2(dY, dX);
      let endAngle   = Math.atan2(coords.y2 - coords.centerY, coords.x2 - coords.centerX);
      
      context.beginPath();
      context.lineWidth = 1;
      context.strokeStyle = 'yellow';
      context.arc(coords.centerX, coords.centerY, radius, startAngle, endAngle, false);
      context.stroke();
    }
    //draw yellow lines for G3 moves
    const drawG3 = (context, coords) => {
      if (coords.isArc == false) {
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = 'yellow';
        context.moveTo(coords.x1, coords.y1);
        context.lineTo(coords.x2, coords.y2);
        context.stroke();
        return;
      }

      let dX = coords.x2 - coords.centerX;
      let dY = coords.y2 - coords.centerY;
      let radius = Math.abs(Math.sqrt(dX*dX + dY*dY));
      let startAngle = Math.atan2(dY, dX);
      let endAngle   = Math.atan2(coords.y1 - coords.centerY, coords.x1 - coords.centerX);
      
      context.beginPath();
      context.lineWidth = 1;
      context.strokeStyle = 'yellow';
      context.arc(coords.centerX, coords.centerY, radius, startAngle, endAngle, false);
      context.stroke();
    }
    //draw crosshairs
    const drawCrosshair = (context, coords) => {
      context.beginPath();
      context.arc(coords.x2, coords.y2, 5, 0, 2 * Math.PI);
      context.strokeStyle = 'white';
      context.lineWidth = 1;
      context.stroke();
    }

    //draw output in respective window
    switch($) {
      case 1: //$1

        canvas = canvasRef1.current;
        context = canvas.getContext('2d');
        canvas.setAttribute('width', window.getComputedStyle(canvas, null).getPropertyValue("width"));
        canvas.setAttribute('height', window.getComputedStyle(canvas, null).getPropertyValue("height"));
        
        drawGrid(canvas, context, scale1/4);
        
        for (let n = currentLine1; n > 0; n--) {
          current = lineItems1[currentLine1-n];
          coords = setCoords(current, currentView1, canvas, scale1);
          
          //which type of line is it
          switch (current.codeGA) {
          case 0:
            drawG0(context, coords);
            break;
          case 1:
            drawG1(context, coords);
            break;
          case 2:
            drawG2(context, coords);
            break;
          case 3:
            drawG3(context, coords);
            break;
          default:  //oddball codeGA
            break;  //not drawing line
          }
        }

        drawCrosshair(context, coords)

        break;
      case 2: //$2

        canvas = canvasRef2.current;
        context = canvas.getContext('2d');
        canvas.setAttribute('width', window.getComputedStyle(canvas, null).getPropertyValue("width"));
        canvas.setAttribute('height', window.getComputedStyle(canvas, null).getPropertyValue("height"));
      
        drawGrid(canvas, context, scale2/4);
      
        for (let n = currentLine2; n > 0; n--) {
          current = lineItems2[currentLine2-n];
          coords = setCoords(current, currentView2, canvas, scale2);
        
          //which type of line is it
          switch (current.codeGA) {
          case 0:
            drawG0(context, coords);
            break;
          case 1:
            drawG1(context, coords);
            break;
          case 2:
            drawG2(context, coords);
            break;
          case 3:
            drawG3(context, coords);
            break;
          default:  //oddball codeGA
            break;  //not drawing line
          }
        }

        drawCrosshair(context, coords)
        
        break;
      default:  //draw function called with no $
        canvas = canvasRef1.current;
      break;
    }
  };

  //~~~ EVENT HANDLING ~~~//
  //input changes, upload clicks, mouse and button interactions with output windows

  const handleInputInteraction = (event) => {
    setInputText(event.target.value);
  }
  const handleUpload = () => {
    setOutput1(outputFunction(inputText, 1));
    setOutput2(outputFunction(inputText, 2));
    setOutput3(outputFunction(inputText, 0));
  }
  const handleOutputInteraction1 = (event) => {
    setCurrentWindow(1);
    setCurrentLine1(event.target.value.substr(0, event.target.selectionStart).split("\n").length);
  }
  const handleOutputInteraction2 = (event) => {
    setCurrentWindow(2);
    setCurrentLine2(event.target.value.substr(0, event.target.selectionStart).split("\n").length);
  }
  const handleSlide1 = (event) => {setScale1(event.target.value);}
  const handleSlide2 = (event) => {setScale2(event.target.value);}

  const handleView1A = () => {setCurrentView1(1);}
  const handleView1B = () => {setCurrentView1(2);}
  const handleView1C = () => {setCurrentView1(3);}

  const handleView2A = () => {setCurrentView2(1);}
  const handleView2B = () => {setCurrentView2(2);}
  const handleView2C = () => {setCurrentView2(3);}
  
  //~~~ BUILD PAGE ~~~//

  return (
    <div className="App">
      <>
      <Container maxWidth={false} disableGutters sx={{bgcolor: 'lightsteel', height: '30px'}}>
        <Box display="flex" flexDirection={'row'} justifyContent={'center'}>
          <Title/>
        </Box>
      </Container>
      
      <Container maxWidth={false} disableGutters sx={{ bgcolor: 'lightsteel', height: 'calc(100vh - 80px)'}}>
        <Box display="flex" flexDirection={'row'} justifyContent={'center'} height={'100%'}>
          
          <Box display="flex" flexDirection = {'column'} height={'100%'} width={'20%'}>
            <InputBox text = {inputText} handleChange = {handleInputInteraction}/>
            <Button variant='contained' color='primary' onClick = {handleUpload}>UPLOAD</Button>
          </Box>

          <Box position="relative" display="flex" flexDirection={'column'} height={'100%'} width={'40%'}>
              
            <OutputBox $={1} text={output1} myRef={canvasRef1}
              handleMouseClick={handleOutputInteraction1}
              handleKeyPress={handleOutputInteraction1}
            />
              
            <div className="card">
            
            <Card sx={{width: '15vh', minWidth: 125, height: 'calc(70vh - 88px)', backgroundColor: 'rgba(50, 54, 73, 0.5)'}}>
              <CardContent>
                
                <Typography gutterBottom variant='inherit' fontSize={20} fontWeight={900} textAlign='right'>
                  $1
                </Typography>
                
                <ScaleSlider handleChange={handleSlide1}/>
                
                <Typography variant='inherit' color='yellow' fontSize={14} textAlign='right'>
                  <br />
                  X {lineItems1[currentLine1-1].x2.toFixed(4).padStart(8, ' ')}<br />
                  Y {lineItems1[currentLine1-1].y2.toFixed(4).padStart(8, ' ')}<br />
                  Z {lineItems1[currentLine1-1].z2.toFixed(4).padStart(8, ' ')}<br />
                  <br />
                </Typography>
                
                <Typography variant='inherit' color='black' fontSize={14} textAlign='right'>
                  N{lineItems1[currentLine1-1].op.toString().padStart(4, ' ')}<br />
                  T{lineItems1[currentLine1-1].tool.toString().padStart(4, ' ')}<br />
                  <br />
                </Typography>
                
                <Typography variant='inherit' color='indigo' fontSize={14} textAlign='right'>
                  M
                  {lineItems1[currentLine1-1].codeMA.toString().padStart(4, ' ')}<br />
                  {lineItems1[currentLine1-1].codeMB}<br />
                  <br />
                </Typography>
                
                <Typography variant='inherit' color='darkblue' fontSize={14} textAlign='right'>
                  G
                  {lineItems1[currentLine1-1].codeGA.toString().padStart(4, ' ')}<br />
                  {lineItems1[currentLine1-1].codeGB}<br />
                  {lineItems1[currentLine1-1].codeGC}<br />
                  {lineItems1[currentLine1-1].codeGD}<br />
                  {lineItems1[currentLine1-1].codeGE}<br />
                  {lineItems1[currentLine1-1].codeGF}<br />
                  {lineItems1[currentLine1-1].codeGG}<br />
                  {lineItems1[currentLine1-1].codeGH}<br />
                  {lineItems1[currentLine1-1].codeGI}<br />
                  {lineItems1[currentLine1-1].codeGJ}<br />
                </Typography>
              </CardContent>
            </Card>
            
            <ViewButtons
              click1={handleView1A}
              click2={handleView1B}
              click3={handleView1C}
            />
            </div>  
          </Box>
          
          <Box position="relative" height={'100%'} width={'40%'}>
              
            <OutputBox $={2} text={output2} myRef={canvasRef2}
              handleMouseClick={handleOutputInteraction2}
              handleKeyPress={handleOutputInteraction2}
            />

            <div className="card">
            <Card sx={{width: '15vh', minWidth: 125, height: 'calc(70vh - 88px)', backgroundColor: 'rgba(50, 54, 73, 0.5)'}}>
              <CardContent>
                
                <Typography gutterBottom variant='inherit' fontSize={20} fontWeight={900} textAlign='right'>
                  $2
                </Typography>
                
                <ScaleSlider handleChange={handleSlide2}/>
                
                <Typography variant='inherit' color='yellow' fontSize={14} textAlign='right'>
                  <br />
                  X {lineItems2[currentLine2-1].x2.toFixed(4).padStart(8, ' ')}<br />
                  Y {lineItems2[currentLine2-1].y2.toFixed(4).padStart(8, ' ')}<br />
                  Z {lineItems2[currentLine2-1].z2.toFixed(4).padStart(8, ' ')}<br />
                  <br />
                </Typography>
                
                <Typography variant='inherit' color='black' fontSize={14} textAlign='right'>
                  N{lineItems2[currentLine2-1].op.toString().padStart(4, ' ')}<br />
                  T{lineItems2[currentLine2-1].tool.toString().padStart(4, ' ')}<br />
                  <br />
                </Typography>
                
                <Typography variant='inherit' color='indigo' fontSize={14} textAlign='right'>
                  M{lineItems2[currentLine2-1].codeMA.toString().padStart(4, ' ')}<br />
                  {lineItems2[currentLine2-1].codeMB}<br />
                  <br />
                </Typography>
                
                <Typography variant='inherit' color='darkblue' fontSize={14} textAlign='right'>
                  G{lineItems2[currentLine2-1].codeGA.toString().padStart(4, ' ')}<br />
                  {lineItems2[currentLine2-1].codeGB}<br />
                  {lineItems2[currentLine2-1].codeGC}<br />
                  {lineItems2[currentLine2-1].codeGD}<br />
                  {lineItems2[currentLine2-1].codeGE}<br />
                  {lineItems2[currentLine2-1].codeGF}<br />
                  {lineItems2[currentLine2-1].codeGG}<br />
                  {lineItems2[currentLine2-1].codeGH}<br />
                  {lineItems2[currentLine2-1].codeGI}<br />
                  {lineItems2[currentLine2-1].codeGJ}<br />
                </Typography>
              </CardContent>
            </Card>
            
            <ViewButtons
              click1={handleView2A}
              click2={handleView2B}
              click3={handleView2C}
            />
            </div> 
          </Box>
          
        </Box>
      </Container>

      <Container maxWidth={false} disableGutters sx={{bgcolor: 'lightsteel', height: '30px'}}>
        <Box display="flex" flexDirection={'row'} justifyContent={'right'}>
          <Footer/>
        </Box>
      </Container>
      </>
    </div>
  );
}

export default App;