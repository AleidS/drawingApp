//!!! Brush color/size/transparency and background color can be changed by changing the input values in the index.html, styling of these buttons/sliders will change automatically

//Download canvas (Doesn't work as local function)
async function downloadCanvas(el) {
  const imageURI = canvas.toDataURL("image/png");
  el.href = imageURI;
};

//Drawing Effects (have to be global for window[attribute] to work)
  var normal = false;
  var rectangle = false;
  var triangle = false;
  var vanish = false;
  var horspiral= false;
  var vertspiral = false;
  var perspective = false;
  var radial = true;
  var hormirror = false;
  var vertmirror = false;
  var horline = false;
  var vertline = false;
  var expand = false;
  var random = false;
  // var custom = true;

  //Scroll to 289 to add an effect

window.addEventListener("load" , () => {
//-------LOCAL VARIABLES--------------
  const canvas = document.querySelector("#canvas");
  const context = canvas.getContext("2d");
  //Size of canvas
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  //On resize

//Brush properties
  let colorplustransparency; //Based on colorpick and right slider
  let linewidth; //Is set based on left slider value
//Interface variables
  let slidersize=0.1; //Partially set based on its own slider value, but multiplied by this valyue
  let transparency=transparencyslider.value; //Slider changes transparency with its own value
  let hideeffects=true;
  let hideinfo=true;
//For distinction between desktop and mobile interface
  let uses_desktop = false;
//Midpoint of perspective/radial/spiral etc.
  let perspectivelength=0.5;
  let perspectiveheight=0.5;
  let perspectiveheight2=0.5;
  let perspectivelength2=0.5;

  //Clear canvas button listener (Trashcan)
  document.getElementById("clearcanvas").addEventListener("click", function(){
    history.saveState(canvas); //So clear action can be undone
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle=colorplustransparency;
    });

  hideallmenus();

  function hideallmenus(){
    hideeffects=true;
    hideinfo=true;
    document.getElementById("effectswrapper").style.display="none";
    document.getElementById("infowrapper").style.display="none";
  }

  //----POP UP MENU'S (INFO/EFFECTS) ---- based on button presses

  //Display/hide all effects when clicking on wand button (Also hides info if this is displayed)
  document.getElementById("currenteffect").addEventListener("click", effects);

  function effects(){
    hideallmenus();
    hideeffects^=true;
    if (hideeffects==false){
      document.getElementById("effectswrapper").style.display="block";
    }
  }
  //Display/hide effects when clicking on info button (hides effects if they are displayed)
  document.getElementById("showinfo").addEventListener("click", showinfo);

  function showinfo(){
    hideallmenus();
    hideinfo^=true;
    if (hideinfo==false){
      document.getElementById("infowrapper").style.display="block";
    }
  }
  //When clicking anywhere but effects/info buttons, hide effects and info content.
  document.querySelectorAll('.menubutton, #canvas, #brush_size_slider, #transparencyslider').forEach(item => {
    item.addEventListener('mousedown', event => {
        hideallmenus();
    item.addEventListener('touchstart', event => {
        hideallmenus();
    })
    })
  })

//Handling effect button clicks
  var effectname = document.getElementsByClassName("effectsbutton");

  //Loop through all the buttons and assign them a conditional neweffectfunction for onclick events
  for (let i = 0; i < effectname.length; i++) {
      effectname[i].addEventListener('click', newEffect, false);
  }

  function newEffect(){
    let attribute =event.srcElement.id;
    //Hide list of effects once one is selected
    document.getElementById("effectswrapper").style.display="none";
    //set all line types to false, except clicked one
    normal = false;
    triangle = false;
    rectangle = false;
    vanish = false;
    geohor = false;
    geovert = false;
    perspective = false;
    radial = false;
    hormirror = false;
    vertmirror = false;
    horline = false;
    vertline = false;
    expand = false;
    random = false;
    //Sets variable name corresponding to clicked button (id) to true
    window[attribute] = true;
    // alert(attribute);
  }

//Make sider-thumb and colorpick icon colors correspond to the chosen values with an extra, inserted stylesheet in the head.
  let s = document.createElement("style");
  document.head.appendChild(s);
  //Dynamically change slider size/color based on position and colorpick value, with an extra stylesheet
  //Do this once at the beginning to set accurate colors (so easy to change them in the index.html)
  setdynamicstyle();

  function setdynamicstyle(){
    let slider_and_colorpick_styling =
     `
    #brush_size_slider::-webkit-slider-thumb{
      transform:scale(${brush_size_slider.value*slidersize+1.2});
      background-color:${brush_color_pick.value};
      opacity:${transparencyslider.value*1+0.5};
      }
    #brush_size_slider::-moz-range-thumb{
      transform:scale(${brush_size_slider.value*slidersize+0.5});
      background-color:${brush_color_pick.value};
      opacity:${transparencyslider.value*1+0.5};
      }
    #brush_color_pick_button label {
      color:  ${brush_color_pick.value};
      }
    #background_color_pick_button label {
      color:  ${background_color_pick.value};
      }
    #transparencyslider::-webkit-slider-thumb{
      opacity:${(transparencyslider.value*3)};
      }
    #transparencyslider::-moz-range-thumb{
      opacity:${(transparencyslider.value*3)};
    }`

    s.textContent=slider_and_colorpick_styling;
  }


//Change brush color / transparency /size and background color based on slider and colorpick input. Also hide menu content.
  document.querySelectorAll('#brush_size_slider, #brush_color_pick, #background_color_pick, #transparencyslider').forEach(item => {
    item.addEventListener('input', event => {
      setdynamicstyle();
      composecolor();
      context.lineWidth=brush_size_slider.value*brush_size_slider.value;
      context.strokeStyle=colorplustransparency;
      context.fillStyle=background_color_pick.value;
      document.body.style.backgroundColor = background_color_pick.value
      hideeffects=true;
      hideinfo=true;
      document.getElementById("effectswrapper").style.display="none";
      document.getElementById("infowrapper").style.display="none";
    })
  })
  //Combine value of brush_color_picker and transparency slider into one color with transparency. Uses hexToRGb8 function to translate HEX to RGB.
  composecolor();

  function composecolor(){   //Do this already once at onload with function call above
    transparency=transparencyslider.value;
    red=hexToRgb8(brush_color_pick.value).r;
    green=hexToRgb8(brush_color_pick.value).g;
    blue=hexToRgb8(brush_color_pick.value).b;
    colorplustransparency=('rgba('+red+','+green+','+blue+','+transparency+')');
    // alert(colorplustransparency);
  }

  //to retrieve RGB info from hexadecimal colorpick value
  function hexToRgb8(hex) {
      let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    }

  //UNDO AND REDO
  document.getElementById("undo").addEventListener("click", function(){
    history.undo(canvas, context);
  })
  document.getElementById("redo").addEventListener("click", function(){
      history.redo(canvas, context);
  })
  //History object from https://codepen.io/abidibo/pen/kdRZjV
  //Changed the img thing
  const history ={
    redo_list:[],
    undo_list:[],
    saveState: function(canvas, list, keep_redo) {
      keep_redo = keep_redo || false;
      if(!keep_redo) {
        this.redo_list = [];
      }
      (list || this.undo_list).push(canvas.toDataURL());
    },
    undo: function(canvas, context) {
      this.restoreState(canvas, context, this.undo_list, this.redo_list);
    },
    redo: function(canvas, context) {
      this.restoreState(canvas, context, this.redo_list, this.undo_list);
    },
    restoreState: function(canvas, context,  pop, push) {
      if(pop.length>0) {
        this.saveState(canvas, push, true);
        var restore_state = pop.pop();
        //  var img = new Element('img', {'src':restore_state});
        const img = document.createElement("img");
        img.src = restore_state;
        img.onload = function() {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
          }
        }
      }
    };
  //Handles Ctrl+Z, Ctrl+Y for undo/Redo
  document.onkeydown = KeyPress;
  function KeyPress(e) {
      var evtobj = window.event? event : e
      //Ctrl+Z
      if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
        history.undo(canvas,context);
      }
      //Ctrl+y
      if (evtobj.keyCode == 89 && evtobj.ctrlKey) {
        history.redo(canvas,context);
      }
    }

//------PAINTING ---------- The actual painting takes place below, with effects based on formulas.

  let painting = false;
  context.strokeStyle=colorplustransparency; //color: try 'white' to change-> Default: colorplustransparency
  context.lineCap = "round";
  context.lineWidth= (brush_size_slider.value*brush_size_slider.value);
  function startPosition(){
    history.saveState(canvas);
    painting= true;
  }
  function finishedPosition(){
    painting = false;
    context.beginPath();
  }

  //For both mobile and desktop! because mobile doesnt have e.clientX/e.clientY, these are only read when user uses mouse (uses_desktop=true)



  function draw(e){
    if ((uses_desktop==true)) {
      x=e.clientX;
      y=e.clientY;
    }
    else{
      x=touchX;
      y=touchY;
    }
    var xstart=x;
    var ystart=y;
    //  Effect calculations based on mouse position
    if (vanish==true){
      xstart=x/2;
      ystart=y/2;
      }
    if (vertspiral==true){
        xstart=canvas.width-x+(((y/canvas.height)*canvas.width)*(perspectivelength2-perspectivelength)*2)-(canvas.width*2)*(0.5-perspectivelength2);
        ystart=y/2;
      }
    if (horspiral==true){
        xstart= x/2;
        ystart=canvas.height-y-(canvas.height*2)*(0.5-perspectiveheight);
      }
    if (random==true){
       xstart=x + (((((canvas.height*perspectivelength)*(y/canvas.height))-canvas.width*perspectivelength2)/(y))
        *((canvas.width*(0.618033990))-x))
        ystart=y-((canvas.height*perspectivelength)*(y/canvas.height))+canvas.height*0.381966010*perspectivelength
      }
    if (perspective==true){
        xstart=x + (((((canvas.height*perspectivelength2) *(y/canvas.height))) /(y))*((canvas.width*(perspectivelength))-x))
        ystart=y-((canvas.height*perspectivelength2)*(y/canvas.height))+canvas.height*perspectiveheight*perspectivelength2
      }
    if (horline== true){
        xstart=x-canvas.width*perspectivelength2;
        ystart=y;
      }
    if (vertline==true){
        xstart=x;
        ystart=y+canvas.height*perspectiveheight2;
      }
    if (radial==true){
        xstart=canvas.width-x-(canvas.width*2*(0.5-perspectivelength))/**perspectivelength*2*/;
        ystart=canvas.height-y-(canvas.height*2*(0.5-perspectiveheight));
      }
    if (hormirror == true){
        xstart=x;
        ystart=canvas.height-y+(canvas.height*((perspectiveheight-0.5)*2));
      }
    if (vertmirror == true){
        xstart=canvas.width-x*perspectivelength*2;
        ystart=y;
      }
    if (expand==true){
        xstart=x-(((canvas.width/2)-x));
        ystart=y-(((canvas.height/2)-y));
      }
    if (normal==true){
      xstart=x;
      ystart=y;
      }

    if(!painting) return;

  //Draws a line(or rectangle/triangle) from Xstart,Ystart to X,Y. .Xstart and Ystart change position based on chosen effect

    if (rectangle==true){
      context.strokeRect(x,y,y,x);
      context.strokeRect(xstart,ystart,30,30);
      }
    if (triangle==true){
      context.lineTo(x, y);
      context.lineTo(x+x/6, y+y/6);
      context.lineTo(x-y/10, y+x/5);
      context.lineTo(x, y);
      context.stroke();
      context.beginPath();
      }
    else{
      context.lineTo(xstart, ystart);
      context.stroke();
      context.beginPath();
      context.moveTo(x, y);
      }
  }

//-- EVENT LISTENERS --  for handling button presses, mouse and touch events
  canvas.addEventListener("mousedown", startPosition);
  canvas.addEventListener("mouseup", finishedPosition);
  //Draw needs e.clientX and e.clientY, but touchmove doesn't have those, so additional variable to make the distinction
  canvas.addEventListener('mousemove', function(){
    uses_desktop=true;
    draw(event);
  });
  //Mobile support
  canvas.addEventListener("touchmove", function(){
    uses_desktop=false;
    draw(event);
  });
  canvas.addEventListener("touchstart", startPosition);
  canvas.addEventListener("touchend", finishedPosition);
  canvas.addEventListener('touchstart', sketchpad_touchStart, false);
  canvas.addEventListener('touchmove', sketchpad_touchMove, false);



//----- HANDLING TOUCH events-----

  var touchX,touchY;

  function sketchpad_touchStart() {
    getTouchPos();
  //  Prevents an additional mousedown event being triggered
    event.preventDefault();
  }

  function sketchpad_touchMove(e) {
    getTouchPos(e);
    draw();
    // Prevent a scrolling action as a result of this touchmove triggering.
    event.preventDefault();
  }

  function getTouchPos(e) {
    if (!e)
      var e = event;
    if (e.touches) {
      if (e.touches.length == 1) { // Only deal with one finger
        var touch = e.touches[0]; // Get the information for finger #1
        touchX=touch.pageX-touch.target.offsetLeft;
        touchY=touch.pageY-touch.target.offsetTop;
      }
    }
  }
});




//NOT USED THINGS, might be interesting for future projects

//UNDO AND REDO -> Not object oriented.
// var redo_list= [];
// var undo_list= [];
//
// function saveState(canvas, list, keep_redo) {
//   keep_redo = keep_redo || false;
//     if(!keep_redo) {
//       redo_list = [];
//     }
//     (list || undo_list).push(canvas.toDataURL());
//   }
//
// function undoFunction(canvas, context) {
//     restore(canvas, context, undo_list, redo_list);
//   }
// function redo(canvas, context) {
//     restore(canvas, context, redo_list, undo_list);
//   }
//
// function restore(canvas, context, pop, push) {
//   if(pop.length>0) {
//     saveState(canvas, push, true);
//     var restore_state = pop.pop();
//
//   //  var img = new Element('img', {'src':restore_state});
//     const img = document.createElement("img");
//     img.src = restore_state;
//     img.onload = function() {
//       context.clearRect(0, 0, canvas.width, canvas.height);
//       context.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
//       }
//     }
//   }

//More elaborate colorpicker, that remembers swatches chosen and has transparency slider.

  // $("#custom").spectrum({
  //     showPalette: true,
  //     palette: [
  //         ['black', 'white', 'blanchedalmond'],
  //         ['rgb(255, 128, 0);', 'hsv 100 70 50', 'lightyellow']
  //     ],
  //      showAlpha: true,
  //      showInput: true,
  //     allowEmpty:true,
  //     showButtons: false
  // });
  //
  // canvas.addEventListener("mousedown", function(){
  //     //The RGB string includes transparency!
  //     // alert($("#custom").spectrum('get').toRgbString())
  //     // alert($("#custom").spectrum('get').toHexString())
  // });
//
// alert($("#custom").spectrum('get').toRgbString());

// var newcolor=$("#custom").spectrum('get').toRgbString();

//Object based effects

// const effect ={
//   normal:false,
//   rectangle: false,
//   triangle:false,
//   vanish:false,
//   horspiral: false,
//   vertspiral: false,
//   perspective: false,
//   radial:true,
//   hormirror: false,
//   vertmirror:false,
//   horline: false,
//   vertline: false,
//   expand: false,
//   random: false,
//   custom: true
// };

// context.stroke();

//Below code draws a rectangle
  /*
  context.strokeStyle="red";
  context.lineWidth=2;
  context.strokeRect(30,30,300,30);
  context.beginPath();
  */
//Below code draws a line
  /*
  context.moveTo(100,100);
  context.lineTo(100,100);
  */
  //Brush properties -> change dynamically,

// $('undo').addEvent('click', function() {
//   history.undo(canvas, context);
//   alert(canvas)
//   alert('canvas')
// });

// canvas.addEventListener('mousedown', function() {
//   canvas.setCapture();
// });
//
// canvas.addEventListener('mouseup', function() {
//     document.releaseCapture();
// });

//CUstom color colorpicker spectrum

// window.addEventListener('resize', function(){
//   canvas.height = window.innerHeight;
//   canvas.width = window.innerWidth;
//   history.undo(canvas,canvas.getContext("2d"));
// } );
