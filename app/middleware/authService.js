const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const { log } = require("winston");
require("dotenv").config();

function checkJwtHS256(settingsConfig, req, res, next) {
try {
  const logger = settingsConfig.logger;
  logger.info(`[AUTH_SERVICE] : Inside checkJWTHS256`);

  const secretKey = process.env.AUTH_CLIENT_SECRET
  console.log("Mi iite yet ahai")
  
  // let token = req?.headers["authorization"]?.replace("Bearer ", "");
  
  let  token=req.cookies[process.env.AUTH_CLIENT_NAME]
 if(!token){
  throw new Error("Invalid Token")
  // const logger = settingsConfig.logger;
  // logger.info(`[INVALID_TOKEN] : Inside checkJWTHS256`);
  // throw new Error("Invalid Token")

}

const payload=jwt.verify(token,secretKey)
  if(!payload){
    throw new Error("Invalid Token")
  }
  return payload
} catch (error) {
  throw error
}
}
function isAdmin(settingsConfig, req, res, next){
try {
  const logger = settingsConfig.logger;
  logger.info(`[AUTH_SERVICE] : Inside IsAdmin`);
  const payload= checkJwtHS256(settingsConfig, req, res, next)
if(!payload.isAdmin){
 throw new Error("You are Not Admin") 
}
next()
} catch (error) {
  next(error)
}
}
function isUser(settingsConfig, req, res, next){
  try {
    const logger = settingsConfig.logger;
    logger.info(`[AUTH_SERVICE] : Inside IsUser`);
    const payload= checkJwtHS256(settingsConfig, req, res, next)
  if(payload.isAdmin){
   throw new Error("You are Not User") 
  }
  next()
  } catch (error) {
    next(error)
  }
  }
  function tokencreation(payload){
    const token=jwt.sign(JSON.stringify(payload),process.env.AUTH_CLIENT_SECRET)
    return token
  
  }
module.exports = {
  checkJwtHS256,
  isAdmin,
  isUser,
  tokencreation
};
