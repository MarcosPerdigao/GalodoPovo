const express = require('express');
const rateLimit = require('express-rate-limit');
const crypto = require('node:crypto');
const VERSION = 'dungeon-2';
const CONSENT = '2';
const DAY = 86400000;
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const secret = /^[a-f0-9]{64}$/i;
const ACTIONS = {x_open:'xOpens',image_download:'imageDownloads',native_share:'shareMenus',text_copy:'textCopies',attempt_loss:'losses'};
const hash = value => crypto.createHash('sha256').update(String(value)).digest('hex');
function sameHash(a,b){return typeof a==='string'&&typeof b==='string'&&a.length===b.length&&crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));}
function weekKey(date=new Date()){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).map(p=>[p.type,p.value]));
 const local=new Date(Date.UTC(Number(parts.year),Number(parts.month)-1,Number(parts.day)));local.setUTCDate(local.getUTCDate()-((local.getUTCDay()+6)%7));return local.toISOString().slice(0,10);
}
function validNickname(value){return typeof value==='string'&&value.trim().length>=2&&value.trim().length<=20&&!/[<>@\u0000-\u001f]/.test(value);}
function validateResult(body,elapsed){
 if(!body||typeof body.won!=='boolean'||!Number.isInteger(body.score)||body.score<0||body.score>2000000)return false;
 if(!Number.isInteger(body.seconds)||body.seconds<0||body.seconds>14400||body.seconds>elapsed+10)return false;
 if(body.score>30000+elapsed*800)return false;
 if(body.won&&(elapsed<20||body.seconds<20||!Array.isArray(body.bosses)||body.bosses.length!==4||!body.bosses.every(b=>b===true)))return false;
 return true;
}
function makeModels(mongoose){
 const playerSchema=new mongoose.Schema({playerId:{type:String,unique:true,index:true},secretHash:String,nickname:String,consentVersion:String,createdAt:Date,expiresAt:{type:Date,index:{expireAfterSeconds:0}}},{strict:true});
 const runSchema=new mongoose.Schema({runId:{type:String,unique:true,index:true},playerId:{type:String,index:true},tokenHash:String,nickname:String,version:String,startedAt:Date,finishedAt:Date,week:{type:String,index:true},won:Boolean,score:Number,seconds:Number,hidden:{type:Boolean,default:false},events:[String],xOpens:{type:Number,default:0},imageDownloads:{type:Number,default:0},shareMenus:{type:Number,default:0},textCopies:{type:Number,default:0},losses:{type:Number,default:0},expiresAt:{type:Date,index:{expireAfterSeconds:0}}},{strict:true});
 return {Player:mongoose.models.GamePlayer||mongoose.model('GamePlayer',playerSchema),Run:mongoose.models.GameRun||mongoose.model('GameRun',runSchema)};
}
function createGameRouter({mongoose,requireAdmin,models,now=()=>new Date()}){
 const {Player,Run}=models||makeModels(mongoose),router=express.Router();
 const limiter=rateLimit({windowMs:60000,limit:45,standardHeaders:'draft-7',legacyHeaders:false});
 const adminLimiter=rateLimit({windowMs:60000,limit:12,standardHeaders:'draft-7',legacyHeaders:false});
 router.use((req,res,next)=>{res.set('Cache-Control','no-store');next();});
 const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(()=>res.status(503).json({message:'Serviço do jogo temporariamente indisponível. O modo local continua disponível.'}));
 async function ownedRun(req){if(!uuid.test(req.params.id||'')||!secret.test(req.headers['x-game-token']||''))return null;const run=await Run.findOne({runId:req.params.id});return run&&run.expiresAt>now()&&sameHash(run.tokenHash,hash(req.headers['x-game-token']))?run:null;}
 router.post('/sessions',limiter,wrap(async(req,res)=>{
  const b=req.body||{};if(!uuid.test(b.playerId||'')||!secret.test(b.playerSecret||'')||!validNickname(b.nickname)||b.consentVersion!==CONSENT||b.adultDeclared!==true||b.gameVersion!==VERSION)return res.status(400).json({message:'Dados ou consentimento inválidos.'});
  let player=await Player.findOne({playerId:b.playerId});if(player&&!sameHash(player.secretHash,hash(b.playerSecret)))return res.status(403).json({message:'Perfil online não autorizado.'});
  const current=now(),expiresAt=new Date(current.getTime()+90*DAY);
  if(!player){player=await Player.create({playerId:b.playerId,secretHash:hash(b.playerSecret),nickname:b.nickname.trim(),consentVersion:CONSENT,createdAt:current,expiresAt});}else{player.nickname=b.nickname.trim();player.consentVersion=CONSENT;player.expiresAt=expiresAt;await player.save();await Run.updateMany({playerId:b.playerId},{$set:{nickname:player.nickname}});}
  const token=crypto.randomBytes(32).toString('hex'),run=await Run.create({runId:crypto.randomUUID(),playerId:b.playerId,tokenHash:hash(token),nickname:player.nickname,version:VERSION,startedAt:current,week:weekKey(current),events:[],expiresAt});
  res.status(201).json({runId:run.runId,runToken:token});
 }));
 router.post('/sessions/:id/finish',limiter,wrap(async(req,res)=>{
  const run=await ownedRun(req);if(!run)return res.status(403).json({message:'Partida não autorizada.'});
  if(run.finishedAt)return res.json({saved:true,score:run.score,week:run.week});
  const current=now(),elapsed=Math.floor((current-run.startedAt)/1000);if(!validateResult(req.body,elapsed))return res.status(400).json({message:'Resultado fora dos limites aceitos.'});
  const result=await Run.updateOne({runId:run.runId,finishedAt:{$exists:false}},{$set:{finishedAt:current,week:weekKey(current),won:req.body.won,score:req.body.score,seconds:req.body.seconds}});
  res.json({saved:true,score:result.modifiedCount?req.body.score:run.score,week:weekKey(current)});
 }));
 router.post('/sessions/:id/events',limiter,wrap(async(req,res)=>{
  const run=await ownedRun(req),b=req.body||{};if(!run)return res.status(403).json({message:'Partida não autorizada.'});
  if(!uuid.test(b.eventId||'')||!Object.hasOwn(ACTIONS,b.type))return res.status(400).json({message:'Evento inválido.'});
  if((run.events||[]).length>=100)return res.status(429).json({message:'Limite de eventos da partida atingido.'});
  await Run.updateOne({runId:run.runId,events:{$ne:b.eventId}},{$push:{events:b.eventId},$inc:{[ACTIONS[b.type]]:1}});res.json({saved:true});
 }));
 router.get('/leaderboard',limiter,wrap(async(req,res)=>{
  const week=weekKey(now());const items=await Run.aggregate([{$match:{week,version:VERSION,won:true,hidden:{$ne:true},finishedAt:{$exists:true},expiresAt:{$gt:now()}}},{$sort:{score:-1,seconds:1,finishedAt:1}},{$group:{_id:'$playerId',nickname:{$first:'$nickname'},score:{$first:'$score'},seconds:{$first:'$seconds'}}},{$sort:{score:-1,seconds:1}},{$limit:20},{$project:{_id:0,nickname:1,score:1,seconds:1}}]);
  res.json({week,timeZone:'America/Sao_Paulo',version:VERSION,items,note:'Placar casual: resultados enviados pelo navegador, sujeitos a validação básica e revisão.'});
 }));
 router.delete('/players/:id',limiter,wrap(async(req,res)=>{
  if(!uuid.test(req.params.id||'')||!secret.test(req.headers['x-player-token']||''))return res.status(403).json({message:'Perfil não autorizado.'});
  const player=await Player.findOne({playerId:req.params.id});if(!player)return res.json({deleted:true});if(!sameHash(player.secretHash,hash(req.headers['x-player-token'])))return res.status(403).json({message:'Perfil não autorizado.'});
  await Run.deleteMany({playerId:req.params.id});await Player.deleteOne({playerId:req.params.id});res.json({deleted:true});
 }));
 router.get('/admin/summary',adminLimiter,requireAdmin,wrap(async(req,res)=>{
  const rows=await Run.aggregate([{$match:{expiresAt:{$gt:now()}}},{$group:{_id:null,started:{$sum:1},finished:{$sum:{$cond:[{$ifNull:['$finishedAt',false]},1,0]}},wins:{$sum:{$cond:['$won',1,0]}},xOpens:{$sum:'$xOpens'},imageDownloads:{$sum:'$imageDownloads'},shareMenus:{$sum:'$shareMenus'},textCopies:{$sum:'$textCopies'},losses:{$sum:'$losses'}}},{$project:{_id:0}}]);
  const participants=await Player.countDocuments({expiresAt:{$gt:now()}}),recent=await Run.find({finishedAt:{$exists:true},expiresAt:{$gt:now()}}).select('runId nickname score seconds won finishedAt hidden -_id').sort({finishedAt:-1}).limit(30).lean();
  const best=await Run.find({won:true,hidden:{$ne:true},expiresAt:{$gt:now()}}).select('runId nickname score seconds won finishedAt hidden -_id').sort({score:-1,seconds:1}).limit(20).lean();
  res.json({best,totals:{started:0,finished:0,wins:0,xOpens:0,imageDownloads:0,shareMenus:0,textCopies:0,losses:0,...rows[0],participants},week:weekKey(now()),recent,confirmedPublications:null,note:'Participantes são perfis de navegador com adesão opcional, não pessoas únicas. Aberturas e compartilhamentos não comprovam publicação no X.'});
 }));
 router.delete('/admin/results/:id',adminLimiter,requireAdmin,wrap(async(req,res)=>{
  if(!uuid.test(req.params.id||''))return res.status(400).json({message:'Resultado inválido.'});await Run.updateOne({runId:req.params.id},{$set:{hidden:true}});res.json({hidden:true});
 }));
 return router;
}
module.exports={createGameRouter,weekKey,validNickname,validateResult,hash,sameHash,VERSION,CONSENT};
