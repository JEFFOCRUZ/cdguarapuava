import { getUser } from '../lib/auth.js';

export default async function handler(req,res){
  if(!getUser(req)){
    return res.status(401).json({error:'Não autenticado.'});
  }

  const apiUrl=process.env.APPS_SCRIPT_API_URL;
  const apiKey=process.env.APPS_SCRIPT_API_KEY;

  if(!apiUrl||!apiKey){
    return res.status(500).json({
      error:'API do Apps Script não configurada no Vercel.'
    });
  }

  try{
    const url=new URL(apiUrl);
    url.searchParams.set('action','dashboard');
    url.searchParams.set('key',apiKey);

    const r=await fetch(url.toString(),{
      method:'GET',
      headers:{'Accept':'application/json'},
      cache:'no-store'
    });

    const text=await r.text();
    let data;
    try{
      data=JSON.parse(text);
    }catch{
      throw new Error('Resposta inválida do Apps Script.');
    }

    if(!r.ok||!data.ok){
      throw new Error(data.error||`Erro HTTP ${r.status}`);
    }

    return res.status(200).json(data);
  }catch(e){
    return res.status(500).json({
      error:'Não foi possível consultar a API da Bobinou.',
      detail:e?.message||String(e)
    });
  }
}
