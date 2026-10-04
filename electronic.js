const bgm=document.querySelector('#bgm');
const musicButton=document.querySelector('#music-toggle');
const film=document.querySelector('#film-viewer');
const filmVideo=document.querySelector('#memory-film');
const filmButton=document.querySelector('#open-film');
const closeFilmButton=document.querySelector('#close-film');
const filmSource=filmVideo.querySelector('source');
const isWeChat=/MicroMessenger/i.test(navigator.userAgent);
let musicWanted=false;
let resumeMusicAfterFilm=false;
bgm.volume=.28;
if(isWeChat){
  document.documentElement.classList.add('wechat-browser');
  filmButton.textContent='微信播放影片 ▶';
}
function syncMusicButton(){
  const playing=musicWanted&&!bgm.paused;
  musicButton.setAttribute('aria-pressed',playing?'true':'false');
  musicButton.textContent=playing?'音乐播放中 ♫':musicWanted?'点此播放音乐 ♫':'开启音乐 ♫';
}
musicButton.addEventListener('click',async()=>{
  if(musicWanted&&!bgm.paused){musicWanted=false;bgm.pause();syncMusicButton();return;}
  musicWanted=true;
  bgm.muted=false;
  try{await bgm.play();}catch(_){musicButton.textContent='再点一次开启音乐 ♫';}
  syncMusicButton();
});
['play','pause','error'].forEach(type=>bgm.addEventListener(type,syncMusicButton));
document.addEventListener('WeixinJSBridgeReady',()=>{
  bgm.load();
  if(musicWanted)bgm.play().catch(()=>{});
},{once:true});
function showFilm(){
  if(typeof film.showModal==='function')film.showModal();
  else{film.setAttribute('open','');film.classList.add('fallback-open');document.body.classList.add('media-open');}
}
function closeFilm(){
  if(typeof film.close==='function')film.close();
  else{film.removeAttribute('open');film.classList.remove('fallback-open');document.body.classList.remove('media-open');film.dispatchEvent(new Event('close'));}
}
filmButton.addEventListener('click',async()=>{
  resumeMusicAfterFilm=musicWanted&&!bgm.paused;
  bgm.pause();
  if(isWeChat){
    const directUrl=new URL(filmVideo.dataset.wechatSrc||filmSource.getAttribute('src'),location.href).href;
    location.href=directUrl;
    return;
  }
  showFilm();
  try{await filmVideo.play();}catch(_){}
});
closeFilmButton.addEventListener('click',closeFilm);
film.addEventListener('click',event=>{if(event.target===film)closeFilm();});
film.addEventListener('close',async()=>{
  filmVideo.pause();
  if(resumeMusicAfterFilm&&musicWanted){try{await bgm.play();}catch(_){}}
  resumeMusicAfterFilm=false;
});
film.addEventListener('keydown',event=>{
  if(['ArrowLeft','ArrowRight',' '].includes(event.key))event.stopPropagation();
});
filmVideo.addEventListener('ended',async()=>{
  if(resumeMusicAfterFilm&&musicWanted){try{await bgm.play();}catch(_){}}
  resumeMusicAfterFilm=false;
});
document.addEventListener('visibilitychange',async()=>{
  if(document.visibilityState==='visible'&&musicWanted&&bgm.paused&&!film.open){
    try{await bgm.play();}catch(_){}
  }
});
syncMusicButton();
