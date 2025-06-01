const canvas = document.getElementById('gamearea');
const ctx = canvas.getContext('2d');

var encounter = new Audio('mus/Encounter.wav');
var attack = new Audio('mus/Attack.wav');
var heal = new Audio('mus/Heal.wav');
var victory = new Audio('mus/Victory.mp3');
var battlemus = new Audio('mus/Battle.mp3');
battlemus.loop=true;
var bosslaugh = new Audio('mus/Bosslaugh.mp3');
var bossmusic = new Audio('mus/Bossmusic.mp3');
bossmusic.loop=true;
var gameovermus = new Audio('mus/Gameover.mp3');
var mapmusic = new Audio('mus/Mapmusic.mp3');
mapmusic.loop=true;

var mapactive=false;
var updateSpeed;
var animSpeed;
var animactive=false;
var spriteindex=3;
var faceleft=false, faceright=false, faceup=false, facedown=false;

var herosprite=new Image(16,16);
const herosprites=["imgs/Hero-R.png","imgs/Hero-L.png","imgs/Hero-U.png","imgs/Hero-D.png","imgs/Hero-R1.png","imgs/Hero-L1.png","imgs/Hero-U1.png","imgs/Hero-D1.png"];
herosprite.src=herosprites[spriteindex];
var xpos=20;
var ypos=20;
var freestep=100;
var keys=[];

var icecrystal=new Image(32,32);
icecrystal.src="imgs/ice-crystal.png";
var firecrystal=new Image(32,32);
firecrystal.src="imgs/fire-crystal.png";
var iceget=false,fireget=false;
var barrier=new Image(128,64);
barrier.src="imgs/barrier.png";
var darkknight=new Image(16,16);
darkknight.src="imgs/dark-knight.png";

var playerlv=1;
const enemydata=[
	{
		"name": "goblin",
		"HP": 15,
		"DP": 4,
		"sprite": "imgs/goblin.png"
	},
	{
		"name": "skeleton",
		"HP": 16,
		"DP": 5,
		"sprite": "imgs/skeleton.png"
	},
	{
		"name": "wolf",
		"HP": 12,
		"DP": 3,
		"sprite": "imgs/wolf.png"
	}
];

//VARIABLES DE BATALLA
	var playerhp,playerdp;
	var enemyname,enemyhp,enemydp;

window.addEventListener('keydown', (event) => {
	if(mapactive){
		keys[event.keyCode] = true;
		if(keys[32]){
			interact();
		}
	}
	if((keys[37]||keys[38]||keys[39]||keys[40])&&(!animactive)){
		walkAnim();
		animSpeed=setInterval(walkAnim,500);
		animactive=true;
	}
	console.log("X="+xpos+" Y="+ypos);
});

window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

window.addEventListener('keyup', (event) => {
	if(mapactive){
		keys[event.keyCode] = false;
		facedown = faceleft = faceup = faceright = false;
	}
	if(!keys[37]&&!keys[38]&&!keys[39]&&!keys[40]&&animactive){
		clearInterval(animSpeed);
		animactive=false;
	}
});

function moveChara(){
	if(xpos>=0&&xpos<=canvas.width-32&&ypos>=0&&ypos<=canvas.height-20&&mapactive&&!touchbarrier()){
			if(keys[37]){
				if(xpos-5>=0) xpos-=movespeed();
				freestep-=Math.pow(movespeed(),2);
				if(!faceleft){
					spriteindex=1;
					walkAnim();
					faceleft=true;
				}
				checkBattle();
			}
			if(keys[39]){
				if(xpos+5<=canvas.width-32) xpos+=movespeed();
				freestep-=Math.pow(movespeed(),2);
				if(!faceright){
					spriteindex=0;
					walkAnim();
					faceright=true;
				}
				checkBattle();
			}
			if(keys[38]){
				if(ypos-5>=0) ypos-=movespeed();
				freestep-=Math.pow(movespeed(),2);
				if(!faceup){
					spriteindex=2;
					walkAnim();
					faceup=true;
				}
				checkBattle();
			}
			if (keys[40]) {
				if(ypos+5<=canvas.height-20) ypos+=movespeed();
				freestep-=Math.pow(movespeed(),2);
				if(!facedown){
					spriteindex=3;
					walkAnim();
					facedown=true;
				}
				checkBattle();
			}
	}
}

function movespeed(){
	var x=0;
	if((keys[37]&&keys[38])||(keys[37]&&keys[40])||(keys[39]&&keys[38])||(keys[39]&&keys[40])){
		x=Math.sqrt(0.5);
	}else{
		x=1;
	}
	return x;
}

function touchbarrier(){
	if(!(fireget&&iceget)){
		if(xpos>=580&&ypos>=400){
			xpos--;
			ypos--;
			return true;
		}
	}else{ return false;}
}

function checkBattle(){
	if(freestep<=0&&Math.floor(Math.random()*50)==3){
		freestep=200;
		keys[37]=false;
		keys[38]=false;
		keys[39]=false;
		keys[40]=false;
		clearInterval(animSpeed);
		animactive=false;
		facedown = faceleft = faceup = faceright = false;
		mapactive=false;
		clearInterval(updateSpeed);
		battlesetup();
	}
}

function assignSafeArea(){
	if(xpos>=0&&xpos<=160&&ypos>=0&&ypos<=160){
		freestep=100;
	}
	if(xpos>=610&&xpos<=800&&ypos>=0&&ypos<=160){
		freestep=100;
	}
	if(xpos>=0&&xpos<=160&&ypos>=420&&ypos<=600){
		freestep=100;
	}
	if(xpos>=610&&xpos<=800&&ypos>=420&&ypos<=600){
		freestep=100;
	}
}

function battlesetup(){
	mapmusic.pause();
	mapmusic.currentTime = 0;
	encounter.play();
	fadeinterval=setInterval(fadewhite,5);
	sleep(1000).then(() => {
	clearInterval(fadeinterval);
	var enemyid=Math.floor(Math.random()*3);
	canvas.style.backgroundImage="url('"+enemydata[enemyid].sprite+"')";
	ctx.clearRect(0,0,canvas.width,canvas.height);
	playerhp=10+(playerlv*5);
	playerdp=5+((playerlv-1)*3);
	enemyname=enemydata[enemyid].name;
	enemyhp=enemydata[enemyid].HP+((playerlv-1)*5);
	enemydp=enemydata[enemyid].DP+((playerlv-1)*2);
	document.getElementById('battleprompt').style.display='';
	document.getElementById('battleprompt').innerHTML="A "+enemyname+" appears!";
	sleep(1000).then(() => {
		battlemus.play();
	});
	sleep(2000).then(() => {
		document.getElementById('battleprompt').style.display='none';
		battle(playerhp,playerdp,enemyhp,enemydp);
	});
	});
}

function fbattlesetup(){
	mapmusic.pause();
	mapmusic.currentTime = 0;
	encounter.play();
	fadeinterval=setInterval(fadewhite,5);
	sleep(1000).then(() => {
	clearInterval(fadeinterval);
	var enemyid=Math.floor(Math.random()*3);
	canvas.style.backgroundImage="url('imgs/boss1.png')";
	ctx.clearRect(0,0,canvas.width,canvas.height);
	playerhp=10+(playerlv*5);
	playerdp=5+((playerlv-1)*3);
	enemyhp=200;
	enemydp=40;
	document.getElementById('battleprompt').style.display='';
	document.getElementById('battleprompt').innerHTML="The Dark Knight comes forth!";
	sleep(2000).then(() => {
		clearInterval(fadeinterval);
		fadeinterval=setInterval(fadeblack,5);
		sleep(1000).then(() => {
		ctx.clearRect(0,0,canvas.width,canvas.height);
		});
		canvas.style.backgroundImage="url('imgs/boss.png')";
		bosslaugh.play();
		clearInterval(fadeinterval);
		sleep(6000).then(() => {
			bossmusic.play();
		});
	});
	sleep(9000).then(() => {
		document.getElementById('battleprompt').style.display='none';
		fbattle(playerhp,playerdp,enemyhp,enemydp);
	});
	});
}

function battle(playerhp,playerdp,enemyhp,enemydp){
	if(playerhp>0&&enemyhp>0){
		document.getElementById('playerHP').innerHTML=playerhp;
		document.getElementById('enemyHP').innerHTML=enemyhp;
		document.getElementById('playerHP').style.display='';
		document.getElementById('enemyHP').style.display='';
		document.getElementById('battlemenu').style.display='';
	}
	else if(playerhp>0&&enemyhp<=0){
		document.getElementById('battleprompt').style.display='';
			document.getElementById('battleprompt').innerHTML="VICTORY!<br>You leveled up.";
			battlemus.pause();
			battlemus.currentTime = 0;
			victory.play();
			playerlv++;
			console.log(playerlv);
			sleep(5000).then(() => {
				document.getElementById('battleprompt').style.display='none';
				startgame();
			});
	}else{
		battlemus.pause();
		battlemus.currentTime = 0;
		gameover();
	}
}

function fbattle(playerhp,playerdp,enemyhp,enemydp){
	if(playerhp>0&&enemyhp>0){
		document.getElementById('playerHP').innerHTML=playerhp;
		document.getElementById('enemyHP').innerHTML=enemyhp;
		document.getElementById('playerHP').style.display='';
		document.getElementById('enemyHP').style.display='';
		document.getElementById('fbattlemenu').style.display='';
	}
	else if(playerhp>0&&enemyhp<=0){
		document.getElementById('playerHP').style.display='none';
		document.getElementById('enemyHP').style.display='none';
		document.getElementById('battleprompt').style.display='';
			document.getElementById('battleprompt').innerHTML="VICTORY!<br>The Dark Knight has been defeated!";
			bossmusic.pause();
			bossmusic.currentTime = 0;
			victory.play();
			playerlv++;
			console.log(playerlv);
			sleep(5000).then(() => {
				document.getElementById('battleprompt').style.display='none';
				canvas.style.backgroundImage="url('imgs/gracias.png')";
			});
	}else{
		bossmusic.pause();
		bossmusic.currentTime = 0;
		gameover();
	}
}

document.getElementById('flee-btn').addEventListener('click', () => {
			startgame();
			document.getElementById('battlemenu').style.display='none';
			battlemus.pause();
			battlemus.currentTime = 0;
			return;
});
document.getElementById('fight-btn').addEventListener('click', () => {
	attack.play();
	document.getElementById('battlemenu').style.display='none';
	enemyhp-=playerdp;
	playerhp-=enemydp;
	document.getElementById('playerHP').innerHTML=playerhp;
	document.getElementById('enemyHP').innerHTML=enemyhp;
	document.getElementById('battleprompt').style.display='';
	document.getElementById('battleprompt').innerHTML="You attack and deal "+playerdp+" damage points!<br>The foe attacks and deals "+enemydp+" damage points!";
	sleep(2000).then(() => {
		document.getElementById('battleprompt').style.display='none';
		battle(playerhp,playerdp,enemyhp,enemydp);
	});
});
document.getElementById('fight-btnf').addEventListener('click', () => {
	attack.play();
	document.getElementById('fbattlemenu').style.display='none';
	enemyhp-=playerdp;
	playerhp-=enemydp;
	document.getElementById('playerHP').innerHTML=playerhp;
	document.getElementById('enemyHP').innerHTML=enemyhp;
	document.getElementById('battleprompt').style.display='';
	document.getElementById('battleprompt').innerHTML="You attack and deal "+playerdp+" damage points!<br>The Knight attacks and deals "+enemydp+" damage points!";
	sleep(2000).then(() => {
		document.getElementById('battleprompt').style.display='none';
		fbattle(playerhp,playerdp,enemyhp,enemydp);
	});
});
document.getElementById('heal-btn').addEventListener('click', () => {
	var hprestore=0;
	heal.play();
	document.getElementById('battlemenu').style.display='none';
	hprestore=(10+Math.floor(Math.random()*10));
	playerhp+=hprestore;
	playerhp-=enemydp;
	document.getElementById('playerHP').innerHTML=playerhp;
	document.getElementById('enemyHP').innerHTML=enemyhp;
	document.getElementById('battleprompt').style.display='';
	document.getElementById('battleprompt').innerHTML="You gained "+hprestore+" health points!<br>The foe attacks and deals "+enemydp+" damage points!";
	sleep(2000).then(() => {
		document.getElementById('battleprompt').style.display='none';
		battle(playerhp,playerdp,enemyhp,enemydp);
	});
});
document.getElementById('heal-btnf').addEventListener('click', () => {
	var hprestore=0;
	heal.play();
	document.getElementById('fbattlemenu').style.display='none';
	hprestore=(10+Math.floor(Math.random()*10));
	playerhp+=hprestore;
	playerhp-=enemydp;
	document.getElementById('playerHP').innerHTML=playerhp;
	document.getElementById('enemyHP').innerHTML=enemyhp;
	document.getElementById('battleprompt').style.display='';
	document.getElementById('battleprompt').innerHTML="You gained "+hprestore+" health points!<br>The Knight attacks and deals "+enemydp+" damage points!";
	sleep(2000).then(() => {
		document.getElementById('battleprompt').style.display='none';
		fbattle(playerhp,playerdp,enemyhp,enemydp);
	});
});

function gameover(){
	document.getElementById('battleprompt').style.display='';
		document.getElementById('battleprompt').innerHTML="You have died...";
		sleep(3000).then(() => {
			document.getElementById('playerHP').style.display='none';
			document.getElementById('enemyHP').style.display='none';
			gameovermus.play();
			document.getElementById('battleprompt').style.display='none';
			canvas.style.backgroundImage="url('imgs/gameover.png')";
		});
}

function interact(){
	if(xpos>=40&&ypos>=480&&xpos<=70&&ypos<=510){
		fireget=true;
	}
	if(xpos>=710&&ypos>=30&&xpos<=740&&ypos<=55){
		iceget=true;
	}
	if(xpos>=680&&ypos>=500&&xpos<=720&&ypos<=540){
		keys[37]=false;
		keys[38]=false;
		keys[39]=false;
		keys[40]=false;
		clearInterval(animSpeed);
		animactive=false;
		facedown = faceleft = faceup = faceright = false;
		mapactive=false;
		clearInterval(updateSpeed);
		fbattlesetup();
	}
}

var fadeinterval;

function fadewhite(){
	ctx.fillStyle='rgba(255, 255, 255, 0.01)';
	ctx.fillRect(0,0,canvas.width,canvas.height);
}

function fadeblack(){
	ctx.fillStyle='rgba(0, 0, 0, 0.01)';
	ctx.fillRect(0,0,canvas.width,canvas.height);
}

document.getElementById('startgame').addEventListener('click', () => {
	if(mapactive){
		mapactive=false;
		clearInterval(updateSpeed);
	}else{
		updateSpeed=setInterval(updateMap,20);
		mapactive=true;
		document.getElementById('startmenu').remove();
		loadimgs();
		mapmusic.play();
	}
	console.log(mapactive);
});

function startgame(){
	mapmusic.play();
	canvas.style.backgroundImage="url('imgs/map2.png')";
	document.getElementById('battlemenu').style.display='none';
	document.getElementById('battleprompt').style.display='none';
	document.getElementById('playerHP').style.display='none';
	document.getElementById('enemyHP').style.display='none';
	clearInterval(updateSpeed);
	updateSpeed=setInterval(updateMap,20);
	mapactive=true;
}

function loadimgs(){
	for(let i=0;i<8;i++){
		preloadImage(herosprites[i]);
		console.log(herosprites[i]+" loaded");
	}
	preloadImage("imgs/goblin.png");
	preloadImage("imgs/skeleton.png");
	preloadImage("imgs/wolf.png");
	preloadImage("imgs/boss1.png");
	preloadImage("imgs/boss.png");
	preloadImage("imgs/gracias.png");
	preloadImage("imgs/gameover.png");
}

function preloadImage(url){
    var img=new Image();
    img.src=url;
}

function updateMap(){
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.drawImage(darkknight,700,525,32,32);
	drawcrystals();
	ctx.drawImage(herosprite,xpos,ypos,32,32);
	if(mapactive){
		moveChara();
		assignSafeArea();
	}
}

function drawcrystals(){
	if(!iceget) ctx.drawImage(icecrystal,725,50,32,32);
	if(!fireget) ctx.drawImage(firecrystal,50,500,32,32);
	if(!(fireget&&iceget)) ctx.drawImage(barrier,610,450,190,150);
}

function walkAnim(){
	//console.log("ANIMS ACTIVE"+spriteindex);
	if(spriteindex<=3) spriteindex+=4;
	else spriteindex-=4;
	herosprite.src=herosprites[spriteindex];
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

document.getElementById('battlemenu').style.display='none';
document.getElementById('fbattlemenu').style.display='none';
document.getElementById('battleprompt').style.display='none';
document.getElementById('playerHP').style.display='none';
document.getElementById('enemyHP').style.display='none';
