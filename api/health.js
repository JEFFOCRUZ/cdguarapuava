export default function handler(req,res){
  res.status(200).json({
    ok:true,
    service:'CD Guarapuava',
    loginEndpoint:'/api/login',
    appsScriptConfigured: Boolean(process.env.APPS_SCRIPT_API_URL && process.env.APPS_SCRIPT_API_KEY)
  });
}
