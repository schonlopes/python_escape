import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore, collection, addDoc, onSnapshot, getDocs, writeBatch, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';
const configured = Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey !== 'SUBSTITUIR');
let auth, db, rows=[], unsubscribe=null, mode='ranking', teacher=false;
const $ = id => document.getElementById(id);
const msg = value => { $('teacher-message').textContent = value; };
const safe = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
if (configured) {
 const app=initializeApp(firebaseConfig); auth=getAuth(app); db=getFirestore(app);
 onAuthStateChanged(auth, user=>{
   teacher=!!user && !user.isAnonymous;
   $('teacher-login').classList.toggle('hidden',teacher);
   $('teacher-content').classList.toggle('hidden',!teacher);
   if(teacher) watch(); else { unsubscribe?.(); unsubscribe=null; rows=[]; }
 });
 // A sessão anônima é iniciada apenas quando um estudante envia seu resultado.
 // Isso evita substituir uma sessão docente persistida ao abrir o jogo.
}
function watch(){ unsubscribe?.(); unsubscribe=onSnapshot(collection(db,'conclusions'), snapshot=>{ rows=snapshot.docs.map(d=>({id:d.id,...d.data()})); render(); },e=>msg('Erro ao carregar dados: '+e.message)); }
function sorted(){return [...rows].sort((a,b)=>b.xp-a.xp || a.timeSeconds-b.timeSeconds);}
function render(){ if(!teacher)return; const finished=rows.filter(r=>r.completed>=10); const avg=finished.length?Math.round(finished.reduce((n,r)=>n+r.xp,0)/finished.length):0;
 $('teacher-summary').textContent=`${rows.length} registros • ${finished.length} conclusões • XP médio dos concluintes: ${avg}`;
 const data=mode==='ranking'?sorted().filter(r=>r.completed>=10):[...rows].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
 const headers=mode==='ranking'?['#','Estudante','XP','Tempo','Dicas']:['Estudante','XP','Tempo (s)','Concluídos','Dicas','Tentativas','Data'];
 const cells=(r,i)=>mode==='ranking'?[i+1,r.name,r.xp,`${Math.floor(r.timeSeconds/60)}:${String(r.timeSeconds%60).padStart(2,'0')}`,r.hints]:[r.name,r.xp,r.timeSeconds,r.completed,r.hints,r.attempts,r.createdAt?.toDate?.().toLocaleString('pt-BR')||'—'];
 $('teacher-results').innerHTML=`<table class="w-full text-left text-sm"><thead><tr>${headers.map(h=>`<th class="p-3 border-b border-gray-600">${h}</th>`).join('')}</tr></thead><tbody>${data.map((r,i)=>`<tr>${cells(r,i).map(v=>`<td class="p-3 border-b border-gray-700">${safe(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
async function clearData(){const docs=await getDocs(collection(db,'conclusions')); for(let i=0;i<docs.size;i+=400){const batch=writeBatch(db);docs.docs.slice(i,i+400).forEach(d=>batch.delete(d.ref));await batch.commit();}msg('Registros excluídos.');}
window.escapeCloud={
 openTeacher(){ $('teacher-panel').classList.remove('hidden');if(!configured)msg('Configure firebase-config.js e publique em HTTPS para ativar o banco de dados.'); },
 closeTeacher(){ $('teacher-panel').classList.add('hidden'); },
 async login(){if(!configured)return;try{await signInWithEmailAndPassword(auth,$('teacher-email').value,$('teacher-password').value);msg('Acesso autorizado.');}catch(e){msg('Login não autorizado: '+e.message);}},
 async logout(){await signOut(auth);msg('Sessão encerrada.');},
 showRanking(){mode='ranking';render();},showStats(){mode='stats';render();},
 exportCSV(){if(!teacher)return;const columns=['name','xp','timeSeconds','completed','hints','attempts'];const csv=[columns.join(';'),...rows.map(r=>columns.map(k=>'"'+String(r[k]??'').replace(/"/g,'""')+'"').join(';'))].join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));a.download='python-escape-resultados.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);},
 async clearRanking(){if(!teacher)return;const answer=prompt('Isso excluirá todos os registros de conclusão. Digite LIMPAR RANKING para confirmar:');if(answer==='LIMPAR RANKING')try{await clearData();}catch(e){msg(e.message);}},
 async clearDatabase(){if(!teacher)return;const answer=prompt('ATENÇÃO: excluirá permanentemente TODOS os registros do jogo. Digite APAGAR TUDO:');if(answer==='APAGAR TUDO')try{await clearData();}catch(e){msg(e.message);}},
 async submitCompletion(state){if(!configured)return;try{if(state.completedChallenges.length<10)return;
 // A sessão do professor pode permanecer ativa no mesmo navegador.
 // Resultados de estudantes devem usar uma identidade anônima distinta.
 if(auth.currentUser && !auth.currentUser.isAnonymous) await signOut(auth);
 if(!auth.currentUser) await signInAnonymously(auth);
 if(!auth.currentUser?.isAnonymous) throw new Error('Não foi possível iniciar a sessão anônima do estudante.');
 const key='python_escape_uploaded_'+(state.operator||'')+'_'+state.timeSeconds+'_'+state.xp;
 if(localStorage.getItem(key))return;
 const hints=Object.values(state.hintsUsed||{}).reduce((a,b)=>a+Number(b||0),0);
 const attempts=Object.values(state.attempts||{}).reduce((a,b)=>a+Number(b||0),0);
 await addDoc(collection(db,'conclusions'),{name:String(state.operator||'Estudante').slice(0,80),xp:Number(state.xp)||0,timeSeconds:Number(state.timeSeconds)||0,completed:state.completedChallenges.length,hints,attempts,createdAt:serverTimestamp(),uid:auth.currentUser.uid});localStorage.setItem(key,'1');
 }catch(e){console.error('Falha ao salvar resultado na nuvem',e);alert('Seu resultado foi concluído, mas não foi salvo no ranking: '+e.message);}}
};
