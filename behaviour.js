const smoothness = 1;
const targetFrameRate = 60;

const tiltCoef = 10;
const maxTilt = 20;
const tiltShadowOffset = .5;
const fadeSteps = 5;
const blurIncrease =.5;
const brightnessDecrease = 12;

var cursorHovering = false;
var curHoverId = "";

window.addEventListener("mousemove", (event)=>{
    cursorX = event.clientX;
    cursorY = event.clientY;

    const computed = window.getComputedStyle(document.documentElement);
    const secondarycol = computed.getPropertyValue('--secondary-color');

    const titlecontainer = document.getElementById("titlecontainer");
    const rect = titlecontainer.getBoundingClientRect();
        
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const relativeX = mouseX - centerX;
    const relativeY = mouseY - centerY;
    
    tiltX = relativeX / tiltCoef;
    tiltY = relativeY / tiltCoef;

    tiltX = Math.min(maxTilt, Math.max(-maxTilt, tiltX));
    tiltY = Math.min(maxTilt, Math.max(-maxTilt, tiltY));

    //const totalTilt = (tiltX + tiltY) / 2;
    
    rotation = rotationToAxisAngle(tiltY, -tiltX);
    
    title.style.transform = `rotate3d(${rotation.axis[0]}, ${rotation.axis[1]}, ${rotation.axis[2]}, ${rotation.angle}deg)`;
    var color = secondarycol;
    var shadows = "";
    for (let i = 0; i < fadeSteps; i++) {
        let offset = tiltShadowOffset * (i + 1);
        let blur = blurIncrease * i;
        color = modifyRGB(color, -brightnessDecrease);

        shadows += `${-tiltX * offset}px ${-tiltY * offset}px ${blur}px ${color}`;
        if (i != fadeSteps - 1)
            shadows += ',';
    }
    title.style.textShadow = shadows;

    var sizetext = computed.getPropertyValue('--cursor-size');
    if (cursorHovering) sizetext = computed.getPropertyValue('--cursor-hovering-size')
    var size = sizetext.slice(0, -2);

    const cursor = document.getElementById('cursor');
    cursor.style.width = `${size}${sizetext.slice(-2)}`;
    cursor.style.height = `${size}${sizetext.slice(-2)}`;
    cursor.style.left = `calc(${event.pageX}px - ${size / 2}${sizetext.slice(-2)})`;
    cursor.style.top  = `calc(${event.pageY}px - ${size / 2}${sizetext.slice(-2)})`;
});

window.addEventListener("mousedown", (event)=>{
    if (cursorHovering) {
        if (curHoverId == "downarrow"){
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
              });
        }
    }
});

window.addEventListener("load", ()=> {
    requestAnimationFrame(nosmooth);
});

var rotation = { axis: [0, 0, 0], angle: 0 };
var sRotation = { axis: [0, 0, 0], angle: 0 };
var tiltX = 0;
var sTiltX = 0;
var tiltY = 0;
var sTiltY = 0;

var cursorX = 0;
var cursorY = 0;

var dt = 0;
var lastUpdate = Date.now();

function nosmooth() {
    
    const computed = window.getComputedStyle(document.documentElement);

    var anyhovering = false;
    const hoverable = document.getElementsByClassName("hoverable");
    for (let element of hoverable) {
        const rect = element.getBoundingClientRect();

        if (cursorX >= rect.left &&
            cursorX <= rect.right &&
            cursorY >= rect.top &&
            cursorY <= rect.bottom ){
            element.classList.add('hovering');
            anyhovering = true;
            curHoverId = element.id;
        }
        else {
            element.classList.remove('hovering');
        }
    }

    cursorHovering = anyhovering;

    requestAnimationFrame(nosmooth);
}

function newFrame() {
    
    let now = Date.now();
    dt = Math.min(1, (now - lastUpdate)) / (1000 / targetFrameRate);
    lastUpdate = now;

    // title
    const computed = window.getComputedStyle(document.documentElement);
    const secondarycol = computed.getPropertyValue('--secondary-color');

    sRotation.axis[0] = lerp(sRotation.axis[0], rotation.axis[0], smoothness * dt);
    sRotation.axis[1] = lerp(sRotation.axis[1], rotation.axis[1], smoothness * dt);
    sRotation.axis[2] = lerp(sRotation.axis[2], rotation.axis[2], smoothness * dt);
    sRotation.angle = lerp(sRotation.angle, rotation.angle, smoothness * dt);

    title.style.transform = `rotate3d(${sRotation.axis[0]}, ${sRotation.axis[1]}, ${sRotation.axis[2]}, ${sRotation.angle}deg)`;
        
    sTiltX = lerp(sTiltX, tiltX, smoothness * dt);
    sTiltY = lerp(sTiltY, tiltY, smoothness * dt);

    var color = secondarycol;
    var shadows = "";
    for (let i = 0; i < fadeSteps; i++) {
        let offset = tiltShadowOffset * (i + 1);
        let blur = blurIncrease * i;
        color = modifyRGB(color, -brightnessDecrease);

        shadows += `${-sTiltX * offset}px ${-sTiltY * offset}px ${blur}px ${color}`;
        if (i != fadeSteps - 1)
            shadows += ',';
    }
    title.style.textShadow = shadows;

    // cursor
    var size = computed.getPropertyValue('--cursor-size');
    size = size.slice(0, -2); 

    const cursor = document.getElementById('cursor');
    cursor.style.left = `calc(${cursorX}px - ${size / 2}vw)`;
    cursor.style.top  = `calc(${cursorY}px - ${size / 2}vw)`;

    // handle hovering
    const desc = document.getElementById('description');
    const descrect = desc.getBoundingClientRect();

    if (cursorX >= descrect.left &&
        cursorX <= descrect.right &&
        cursorY >= descrect.top &&
        cursorY <= descrect.bottom ){
        desc.classList.add('descriptionhovering');
    }
    else {
        desc.classList.remove('descriptionhovering');
    }

    requestAnimationFrame(newFrame);
};

function lerp(a,b,t) {
    return a + (b - a) * t;
}

function modifyRGB(rgbString, amount) {
    const rgbValues = rgbString.match(/\d+/g).map(Number);    
    const modifiedValues = rgbValues.map(value => {
      return Math.min(255, Math.max(0, value + amount));
    });
    
    return `rgb(${modifiedValues.join(', ')})`;
  }

function rotationToAxisAngle(xAngle, yAngle) {
    const xRad = xAngle * Math.PI / 180;
    const yRad = yAngle * Math.PI / 180;
  
    const cosX = Math.cos(xRad);
    const sinX = Math.sin(xRad);
    const cosY = Math.cos(yRad);
    const sinY = Math.sin(yRad);
  
    const m00 = cosY;
    const m01 = 0;
    const m02 = -sinY;
    const m10 = sinY * sinX;
    const m11 = cosX;
    const m12 = cosY * sinX;
    const m20 = sinY * cosX;
    const m21 = -sinX;
    const m22 = cosY * cosX;
  
    const angle = Math.acos((m00 + m11 + m22 - 1) / 2);
  
    let x, y, z;
    if (Math.abs(angle) < 1e-8) {
      x = 1;
      y = 0;
      z = 0;
    } else {
      x = (m21 - m12) / (2 * Math.sin(angle));
      y = (m02 - m20) / (2 * Math.sin(angle));
      z = (m10 - m01) / (2 * Math.sin(angle));
    }
  
    const length = Math.sqrt(x*x + y*y + z*z);
    x /= length;
    y /= length;
    z /= length;
  
    const angleDeg = angle * 180 / Math.PI;
  
    return { axis: [x, y, z], angle: angleDeg };
}