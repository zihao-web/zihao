const bgm=document.querySelector('#bgm');
const musicButton=document.querySelector('#music-toggle');
const film=document.querySelector('#film-viewer');
const filmVideo=document.querySelector('#memory-film');
const filmButton=document.querySelector('#open-film');
const closeFilmButton=document.querySelector('#close-film');
const filmSource=filmVideo.querySelector('source');
const filmDirect=document.querySelector('.film-direct');
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
['waiting','stalled'].forEach(type=>bgm.addEventListener(type,()=>{
  if(musicWanted)musicButton.textContent='音乐缓冲中…';
}));
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
    if(filmVideo.getAttribute('src')!==directUrl){
      filmVideo.setAttribute('src',directUrl);
      filmDirect.setAttribute('href',directUrl);
      filmVideo.load();
    }
  }
  showFilm();
  filmButton.textContent=isWeChat?'正在加载影片…':'播放影片 ▶';
  try{await filmVideo.play();}catch(_){filmButton.textContent=isWeChat?'点此重试影片 ▶':'播放影片 ▶';}
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
filmVideo.addEventListener('playing',()=>{filmButton.textContent=isWeChat?'微信播放影片 ▶':'播放影片 ▶';});
filmVideo.addEventListener('error',()=>{filmButton.textContent=isWeChat?'视频加载失败，点此重试':'播放影片 ▶';});
document.addEventListener('visibilitychange',async()=>{
  if(document.visibilityState==='visible'&&musicWanted&&bgm.paused&&!film.open){
    try{await bgm.play();}catch(_){}
  }
});
syncMusicButton();
