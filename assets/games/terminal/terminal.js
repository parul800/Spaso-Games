const words = ['ACCESS','HACK','OVERRIDE','CYBER','DRONE','NEON','GRID','BOOT','BYTES','STACK'];
let score = 0;
let current = '';

const targetEl = document.getElementById('target');
const typed = document.getElementById('typed');
const scoreEl = document.getElementById('score');

function next(){
  current = words[Math.floor(Math.random()*words.length)];
  targetEl.textContent = current;
  typed.value = '';
  typed.focus();
}

typed.addEventListener('input', e=>{
  if(typed.value.toUpperCase() === current){
    score++;
    scoreEl.textContent = 'Score: '+score;
    next();
  }
});

next();
