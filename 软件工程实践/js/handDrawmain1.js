var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var lineWidth = 5;
var eraserEnabled = false;
var imageDataFragment;
var canvasHistory = [];
var step = -1;

autoSetCanvasSize(canvas);

listenToUser(canvas);

//---------------------各个按钮的功能实现---------------------
toggle.onclick = function (e) {
  if (e.target.matches(".open")) {
    toggleClose.classList.add("show");
    toggleOpen.classList.remove("show");
    tools.style.display = "none";
  } else {
    toggleClose.classList.remove("show");
    toggleOpen.classList.add("show");
    tools.style.display = "block";
  }
};

eraser.onclick = function () {
  eraserEnabled = true;
  eraser.classList.add("active");
  pen.classList.remove("active");
};
pen.onclick = function () {
  eraserEnabled = false;
  pen.classList.add("active");
  eraser.classList.remove("active");
};
clear.onclick = function () {
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvasHistory = [];
  step = -1;
  back.classList.remove("active");
  go.classList.remove("active");
};
download.onclick = function () {
  var compositeOperation = context.globalCompositeOperation;
  context.globalCompositeOperation = "destination-over";
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  var imageData = canvas.toDataURL("image/png");
  context.putImageData(
    context.getImageData(0, 0, canvas.width, canvas.height),
    0,
    0
  );
  context.globalCompositeOperation = compositeOperation;
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.href = imageData;
  a.download = "handDrawPic";
  a.target = "_blank";
  a.click();
};

currentColor.onclick = function (e) {
  context.fillStyle = e.target.value;
  context.strokeStyle = e.target.value;
};
currentColor.onchange = function (e) {
  context.fillStyle = e.target.value;
  context.strokeStyle = e.target.value;
};

bgColor.onclick = function (e) {
  context.fillStyle = e.target.value;
  context.fillRect(0, 0, canvas.width, canvas.height)
};
bgColor.onchange = function (e) {
  context.fillStyle = e.target.value;
  context.fillRect(0, 0, canvas.width, canvas.height)
};

range.onchange = function (e) {
  lineWidth = e.target.value * 1;
};

back.onclick = function () {
  if (step >= 0) {
    step -= 1;
    context.clearRect(0, 0, canvas.width, canvas.height);
    let canvasPic = new Image();
    canvasPic.src = canvasHistory[step];
    canvasPic.addEventListener("load", () => {
      context.drawImage(canvasPic, 0, 0);
    });
    go.classList.add("active");
    if (step < 0) {
      back.classList.remove("active");
    }
  }
};
go.onclick = function () {
  if (step < canvasHistory.length - 1) {
    step += 1;
    let canvasPic = new Image();
    canvasPic.src = canvasHistory[step];
    canvasPic.addEventListener("load", () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(canvasPic, 0, 0);
    });
    back.classList.add("active");
    if (step === canvasHistory.length - 1) {
      go.classList.remove("active");
    }
  }
};

//-----------------canvas的一些设置---------------------
function setdashline(params) {
  var t = document.getElementById("dashline");
  if (t.checked) {
    context.setLineDash([15, 15]);
  } else {
    context.setLineDash([]);
  }
}

function autoSetCanvasSize(canvas) {
  canvasSize();
  window.onresize = function () {
    canvasSize();
  };
}
//设置全屏画板
function canvasSize() {
  canvas.width = document.documentElement.clientWidth / 1;
  canvas.height = document.documentElement.clientHeight / 1;
}

function drawLine(x1, y1, x2, y2) {
  // context.setLineDash([5, 15]);//设置虚线
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineWidth = lineWidth;
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}

function drawCircle(x, y, radius) {
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

//-----------------实现方法：监听鼠标事件，并画出记录数据---------------------
function listenToUser(canvas) {
  var using = false;
  var lastPoint = {
    x: undefined,
    y: undefined
  };

  canvas.onmousedown = function (a) {
    var x = a.clientX;
    var y = a.clientY;
    using = true;//当前正在使用画笔
    if (eraserEnabled) {
      clearRect(x, y);
    } else {
      lastPoint = {
        x: x,
        y: y
      };
    }
  };
  canvas.onmousemove = function (a) {
    var x = a.clientX;
    var y = a.clientY;
    if (!using) {
      return;
    }
    if (eraserEnabled) {
      clearRect(x, y);
    } else {
      var newPoint = {
        x: x,
        y: y
      };
      drawCircle(x, y, lineWidth / 2);//画点
      drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y);//画线
      lastPoint = newPoint;
    }
  };
  canvas.onmouseup = function () {
    using = false;
    saveFragment();
  };
}

function clearRect(x, y) {
  context.clearRect(x - lineWidth / 2, y - lineWidth / 2, lineWidth, lineWidth);
}

//将当前绘图保存，以便能进行撤销和前进
function saveFragment() {
  step += 1;
  if (step < canvasHistory.length) {
    canvasHistory.length = step;
  }
  canvasHistory.push(canvas.toDataURL());
  back.classList.add("active");
  go.classList.remove("active");
}

document.body.addEventListener(
  "touchmove",
  function (e) {
    e.preventDefault();
  }, {
    passive: false
  }
);
