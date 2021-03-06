function fn(){
	var baseFontSize = window.innerWidth/50;
	$("html").css("font-size",baseFontSize);
}
fn();
$(window).resize(function(){
	fn();
	console.log("屏幕宽度："+document.body.clientWidth);
})

//window.addEventListener("resize",function(){
//	
//},false);
			
//homepage页面

//音乐点击按钮
var mFlag=true;//true-音乐开着 false音乐关着 
$("#music").click(function(){
	if(mFlag){
		console.log("啊");
		$("audio")[0].pause();
		//应该加换一张静音的背景图片
//		$("#music").css("background-image","../img/music.bmp");	
		mFlag=false;
	}else{
		$("audio")[0].play();
		mFlag=true;
	}	
})

//点击充值func按钮出现充值画面设置
$("#func").click(function(){
	$("#main").css("display","none");
	$("#charge").css("display","block");
})

$("#chargeOk").click(function(){
	$("#main").css("display","block");
	$("#charge").css("display","none");
})


//点击开始按钮，隐藏homepage，进入gamepage
$("#play").click(function(){
	$("audio")[0].pause();
	$("#homePage").css("display","none");
	$("#gamePage").css("display","block");
	$("audio")[1].play();
	var snakegame = new Snake();
	snakegame.start();
	
})
//定义一个速度变量，改变速度
var x=200;
$(".speedD").click(function(){
	switch ($(this).html()){
		case "简单":
		    x=400;
		    console.log(x);
			break;
		case "一般":
			x=200;
			console.log(x);
			break;
		case "复杂":
			x=100;
			console.log(x);
	}
})
//定义一个变量改变y，改变背景
$(".backgroungImgD").click(function(){
	console.log($(this).index());
	switch ($(this).index()){
		case 0:
		    bgImg.src = "static/img/background.png";
			break;
		case 1:
			bgImg.src="http://pic.qiantucdn.com/58pic/18/09/96/27F58PICdDC_1024.jpg"
			break;
		case 2:
			bgImg.src="http://pic.58pic.com/58pic/13/22/15/87458PICudg_1024.jpg"
	}
})
//gamepage页面
var northImg = new Image();
northImg.src = "static/img/north.png";
var southImg = new Image();
southImg.src = "static/img/south.png";
var eastImg = new Image();
eastImg.src = "static/img/east.png";
var westImg = new Image();
westImg.src = "static/img/west.png";
var bodyImg = new Image();
bodyImg.src = "static/img/body.png";
var foodImg = new Image();
foodImg.src = "static/img/food.png";
var foodImg2=new Image();
foodImg2.src="static/img/food1.png";
var foodImg3=new Image();
foodImg3.src= "static/img/food2.png";
var n=parseInt(Math.random()*3);
var bgImg = new Image();
bgImg.src = "static/img/background.png";
//将欢迎界面的图片放在最后，表示加载成功后，其他图片已经加载完毕，无需再进行onload判断
var startImg = new Image();
startImg.src = "static/img/start.png";

//采用面向对象的方法，创建一个蛇的对象，包含以下属性和方法
function Snake() {
	//蛇的属性
	this.canvas = $("#gameview")[0]; //canvas画布对象
	this.ctx = this.canvas.getContext("2d"); //画笔
	this.width = 500; //背景（游戏屏幕）的宽度
	this.height = 500; //背景（游戏屏幕）的高度
	this.step = 25; //设计步长
	this.stepX = Math.floor(this.width / this.step); //X轴步数
	this.stepY = Math.floor(this.height / this.step); //Y轴步数
	this.snakeBodyList = []; //设置蛇身数组
	this.foodList = []; //设置食物数组
	this.timer = null;//蛇动时的定时器
	this.score = 0;//分数  +10  存入到localStorage中

	this.isDead=false;//蛇移动的标识；
	this.isEaten=false;//判断蛇吃食物的标识位
	this.isPhone=false;//判断设备类型，false为pc端，true为手机端
	//皮肤数组
 	this.skin=[];
 	
	//1-生成初始化页面，点击该页面，进入游戏
	this.init = function() {
		this.device();//调用判断设备的函数
		//用画笔画一个开始背景的画布
		this.ctx.drawImage(startImg, 0, 0, this.width, this.height);
	}
	//2-游戏开始，绘制背景、蛇、食物,蛇移动
	
	this.start = function(){
		this.device();//调用判断设备类型的函数
		
		this.score=0;//积分清零（每次蛇死或重新开始的时候将积分变为零）
		
		this.paint();
		
		this.move();//根据isPhone的flag的值，选择执行是pc端还是phone端
	}
	this.device=function(){
		//1读取BOM对象navigator的userAgent信息
		var deviceInfo=navigator.userAgent;
		//2判断是否为pc端(是否含有Windows字符串)
		if(deviceInfo.indexOf("Windows")== -1){
			this.isPhone=true;//如果不是pc端，将flag改为true
			this.canvas.width=window.innerWidth;
			this.canvas.height=window.innerHeight;
			this.width=window.innerWidth;
			this.height=window.innerHeight;
			this.stepX=this.width/this.step;
			this.stepY=this.height/this.step;
//			console.log(this.width)//打印宽度验证一下
		}
	}
	/*
	 * 绘制背景、蛇、食物
	 */
	this.paint = function() {
		//2.1 画出背景
		this.ctx.drawImage(bgImg, 0, 0, this.width, this.height);
		//2.2 画蛇
		this.drawSnake();
		//2.3 随机画出食物
		this.drawFood();
	}
	/*
	 * 2.2画蛇：算法[{x:横坐标，y：纵坐标，img：图片，direct：运动方向},.......]
	 */
	this.drawSnake = function() {
		//2.2.1循环生成snakeBodyList数组中的对象集合 （默认，蛇居于中间，蛇头向西）
		if(this.snakeBodyList.length<5){
		for(var i = 0; i < 5; i++) {
			//{x:横坐标，y：纵坐标，img：图片，direct：运动方向}蛇的节点设计
			this.snakeBodyList.push({
				x: Math.floor(this.stepX / 2) + i - 2, //注意：x不是px像素坐标点，而是x轴步数
				y: Math.floor(this.stepY / 2), //注意：这是y轴步数
				img: bodyImg,
				direct: "west"
			});
		}
		//2.2.2替换snakeBodyList数组第一个元素的img，替换成westImg蛇头图片
		this.snakeBodyList[0].img = westImg;
		}
		//2.2.3遍历snakeBodyList数组，并画出蛇的初始状态
		for(var i = 0; i < this.snakeBodyList.length; i++) {
			var snode = this.snakeBodyList[i];
			this.ctx.drawImage(snode.img, snode.x * this.step,
				snode.y * this.step, this.step, this.step);
		}
		

	}
	/*
	 * 2.3画食物
	 */
	this.drawFood = function() {

		//2.3.1当食物已经存在的时候，画面刷新时，食物在原有位置重绘
		if(this.foodList.length > 0) {
			var fnode = this.foodList[n];
			this.ctx.drawImage(fnode.img, fnode.x * this.step, fnode.y * this.step, this.step, this.step);
			return;
		}
		//2.3.2如果食物没有（食物被吃或游戏初始化），生成x，y随机坐标，判断是否与蛇身重复
		//如果重复，重绘，调用this.drawfood(),否则，按照随机生成的点push到数组中，绘制图案
		var foodX = Math.floor(Math.random() * this.stepX);
		var foodY = Math.floor(Math.random() * this.stepY);
		var foodFlag = false; //判断食物与蛇身是否重复的标识位，true重复，false 不重复
		for(var i = 0; i < this.snakeBodyList.length; i++) {
			var snode1 = this.snakeBodyList[i];
			if(foodX == snode1.x && foodY == snode1.y) {
				foodFlag = true;
			}
		}
		if(foodFlag) {
			this.drawFood(); //如果重复，则重绘
		} else {
			this.foodList.push({
				x: foodX,
				y: foodY,
				img: foodImg
			}); //新生成一个食物
			this.foodList.push({
				x: foodX,
				y: foodY,
				img: foodImg2
			});//新生成一个食物
			this.foodList.push({
				x: foodX,
				y: foodY,
				img: foodImg3
			});   //否则，新生成一个食物	
			var fnode = this.foodList[n];
			this.ctx.drawImage(fnode.img, fnode.x * this.step, fnode.y * this.step, this.step, this.step);
		}

	}
	/*
	 * 3-蛇动（键盘事件改变蛇移动方向，判断蛇是否死掉，然后判断蛇是否吃了食物，之后蛇移动）
	 	3.1判断设备，如果是pc端，响应键盘事件，否则响应触屏事件。
	 	3.2生成键盘事件处理器this.keyHandler(),和触屏事件处理器this.touchHandler()
	 * */
	this.keyHandler=function(){//键盘事件处理器
		//事件处理是异步的，所以，无法传递this对象
		var _this = this;
		document.onkeydown = function(ev){
//			alert("啊");
			var ev = ev||window.event;
			console.log(ev.key+":"+ev.keyCode);//打印出对象的属性，以防记不住
//			console.log(_this.snakeBodyList);//以防异步出错
			switch(ev.keyCode){
				case 37://向左
					_this.snakeBodyList[0].img = westImg;
					_this.snakeBodyList[0].direct = 'west';
				break;
				case 38://向上
					_this.snakeBodyList[0].img = northImg;
					_this.snakeBodyList[0].direct = 'north';
				break;
				case 39://向右
					_this.snakeBodyList[0].img = eastImg;
					_this.snakeBodyList[0].direct = 'east';
				break;
				case 40://向下
					_this.snakeBodyList[0].img = southImg;
					_this.snakeBodyList[0].direct = 'south';
				break;
			}
		}	
	}
	this.touchHandler=function(){//触屏事件处理器
		var _this=this;
		document.addEventListener("touchstart",function(ev){
//			alert("啊");
			var ev = ev||window.event;
//			console.log(ev);
			var touchX = ev.changedTouches[0].clientX;
			var touchY = ev.changedTouches[0].clientY;
//			console.log(touchX+":"+touchY);
			var head = _this.snakeBodyList[0];
			var headX = head.x*_this.step;//注意蛇头x坐标值与px的转换  乘以_this.step
			var headY = head.y*_this.step;//注意蛇头x坐标值与px的转换  乘以_this.step
			if(head.direct == "north" || head.direct == "south"){
				if(touchX < headX){
					head.direct = "west";
					head.img = westImg;
				}else{
					head.direct = "east";
					head.img = eastImg;
				}
			}else if(head.direct == "west" || head.direct == "east"){
				if(touchY < headY){
					head.direct = "north";
					head.img = northImg;
				}else{
					head.direct = "south";
					head.img = southImg;
				}
			}
		})
	}
	//判断 isPhone的值，确定是键盘事件还是触屏事件
	this.move = function() {
		if(!this.isPhone){
			this.keyHandler();
		}else{
			this.touchHandler();
		}
		//3.1运用定时器，每隔0.2秒移动蛇（蛇的坐标变化，然后重绘）
		var _this=this;
		this.timer = setInterval(function(){
			//首先：解决蛇身跟随的问题
			for(var i = _this.snakeBodyList.length-1;i>0;i--){
				_this.snakeBodyList[i].x = _this.snakeBodyList[i-1].x;
				_this.snakeBodyList[i].y = _this.snakeBodyList[i-1].y;
			}
			//其次，根据方向及坐标，处理蛇头的移动新坐标
			var shead = _this.snakeBodyList[0];
			switch(shead.direct){
				case 'north':
					shead.y--;
				break;
				case 'south':
					shead.y++;
				break;
				case 'west':
					shead.x--;
				break;
				case 'east':
					shead.x++;
				break;
			}
			//3.1.1 判断，蛇移动后的新位置是否触碰边界，或者自身，true--dead
			_this.dead();
			if(_this.isDead){
				//alert你最终的分数
				alert("Yours score is："+_this.score);
				clearInterval(_this.timer);//否则蛇会越来越快
				_this.isDead=false;//改变isDead状态，否则每次都直接死掉
				_this.snakeBodyList=[];//一直刷新alert
				_this.start();//游戏重新开始
				
			}else{
				//3.1.2false：蛇活着判断蛇头是否与食物坐标点一致，如果一致清空食物数组（多个食物时）
				_this.eat();//判断食物是否被吃.isEaten
				if(_this.isEaten){
//					console.log("eaten");
					_this.isEaten=false;//变回没被吃的标识
					//清空食物组
					_this.foodList=[];
					switch(n){
						case 0:
							_this.score +=10;
						break;
						case 1:
							_this.score +=20;
						break;
						case 2:
							_this.score +=30;
						break;
					}
					//蛇身长一节
					var lastNodeIndex=_this.snakeBodyList.length;
					n=parseInt(Math.random()*3);
					_this.snakeBodyList[lastNodeIndex]={
						x:-2,
						y:-2, 
						img:bodyImg,
						direct:_this.snakeBodyList[lastNodeIndex-1].direct
					}

				}
				//3.1.3否则重绘
				_this.paint();//重绘游戏画面(背景+蛇+食物)
			}
//		_this.paint();//重绘游戏画面
		},x);
	}
	/*
	 * 4-蛇死（碰到边界或碰到自身--dead 弹出得分界面）
	 */
	this.dead = function() {
		var LEFT_END=0;
		var RIGHT_END=this.stepX;
		var NORTH_END=0;
		var SOUTH_END=this.stepY;
		var headX=this.snakeBodyList[0].x;
		var headY=this.snakeBodyList[0].y;
		//、判断边界
		if(headX < LEFT_END || headY < NORTH_END ||headX > RIGHT_END|| headY > SOUTH_END){
			this.isDead=true;
			return;//精简判断过程；
		}
		//判断是否撞到自身
		for(var k = this.snakeBodyList.length-1;k>3;k--){
			if(this.snakeBodyList[k].x==headX && this.snakeBodyList[k].y==headY){
				this.isDead=true;
			}
		}

	}
	/*
	 * 5-蛇吃食物（蛇头坐标与食物坐标一致）
	 */
	this.eat = function(){
		var HEAD_X=this.snakeBodyList[0].x;//蛇头横坐标
		var HEAD_Y=this.snakeBodyList[0].y;//蛇头横坐标
		var FOOD_X=this.foodList[n].x;//食物横坐标
		var FOOD_Y=this.foodList[n].y;//食物纵坐标
		if(HEAD_X==FOOD_X && HEAD_Y==FOOD_Y){
			this.isEaten=true;
		}

	}
}
