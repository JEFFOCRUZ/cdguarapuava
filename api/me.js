import { getUser } from '../lib/auth.js';
export default async function handler(req,res){
  const u=getUser(req);
  if(!u) return res.status(401).json({authenticated:false});
  return res.status(200).json({authenticated:true,user:u.u});
}
