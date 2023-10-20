const { validate } = require("uuid");
const { HttpStatusCode } = require("axios");
const {v4}=require('uuid');
const { validateUuid } = require("../../../utils/uuid");
const accountConfig = require("../../../model-config/accountConfig");
const { checkJwtHS256 } = require("../../../middleware/authService");
const accountService = require("../service/AccountService");
class AccountController{
    constructor(){
      this.newAccountService=accountService
    }
    async createAccount(settingsConfig,req,res,next){
        try {
        const logger = settingsConfig.logger;
        logger.info(`[ACCOUNT_CONTROLLER] : Inside createAccount`);
        // const {userId}=req.params
        // validateUuid(userId)
        const account=req.body
        account.id=v4()
        const payload=checkJwtHS256(settingsConfig,req,res,next)
        //  if(payload.id!=userId){
        //     throw new Error("User Can Only Create Account For Itself")
        //  }
        account.userId=payload.id
        if(account.balance<1000){
            throw new Error("Minimum 1000 Rupes Is Required For Opening The Account")
        }
        accountConfig.validateAccount(account)
        const data =await this.newAccountService.createAccount(settingsConfig,account)
        res.status(HttpStatusCode.Ok).json(await data)
        } catch (error) {
            next(error)
        }
    }

    async getAllAccounts(settingsConfig,req,res,next,flag){
        try {
        const logger = settingsConfig.logger;
        const queryParams=req.query
        logger.info(`[Account_CONTROLLER] : Inside getAllAccount`);
        const {rows,count} =await this.newAccountService.getAllAccount(settingsConfig,queryParams)
        if(flag){
            return {rows,count}
        }
        res.set('X-Total-Count',count)
        res.status(HttpStatusCode.Ok).json(await rows)
        } catch (error) {
            next(error)
        }
    }
    
    async getAccount(settingsConfig,req,res,next,flag){
        try {
        const logger = settingsConfig.logger;
        logger.info(`[Account_CONTROLLER] : Inside getAccount`);
        const payload=checkJwtHS256(settingsConfig,req,res,next)
        const {accountNo}=req.params
        validateUuid(accountNo)
        const  data=await this.newAccountService.getAccount(settingsConfig,req.params,payload)
        if(flag){
            res.set('X-Total-Count',1)
            return
        }
        
        res.status(HttpStatusCode.Ok).json(await data)
        } catch (error) {
            next(error)
        }
    }
    async withDrawAmount(settingsConfig,req,res,next){
        try {
            const logger = settingsConfig.logger;
            logger.info(`[Account_CONTROLLER] : Inside withdrawAmount`);
            const{userId,accountNumber}=req.params
            const{amount}=req.body
     
            validateUuid(userId)
            validateUuid(accountNumber)
            if(typeof amount!="number"){
                throw new Error("Invalid Amount")
                
            }
            
            const payload=checkJwtHS256(settingsConfig,req,res,next)
            if(payload.id!=userId){
               
    
                throw new Error("User Can Only Withdraw Amount From Its Own Account")
            }
        
         
    
        const data=await  accountService.withdrawAmount(settingsConfig,accountNumber,amount,req.params)
         res.status(200).json(data)
                    
        } catch (error) {
           next(error)
        }
      
    
    }
    async depositAmount(settingsConfig,req,res,next){
        try {
            const logger = settingsConfig.logger;
            logger.info(`[Account_CONTROLLER] : Inside depositAmount`);
            const{userId,accountNumber}=req.params
            const{amount}=req.body
     
            validateUuid(userId)
            validateUuid(accountNumber)
            if(typeof amount!="number"){
                throw new Error("Invalid Amount")
                
            }
            
            const payload=checkJwtHS256(settingsConfig,req,res,next)
            if(payload.id!=userId){
               
    
                throw new Error("User Can Only Withdraw Amount From Its Own Account")
            }
        
         
    
        const data=await  accountService.depositAmount(settingsConfig,accountNumber,amount,req.params)
         res.status(200).json(data)
                    
        } catch (error) {
           next(error)
        }
      
    
    }
    async transferAmount(settingsConfig,req,res,next){
        try {
            const logger = settingsConfig.logger;
            logger.info(`[Account_CONTROLLER] : Inside transferAmount`);
            const{userId,senderAccountNo}=req.params
            const{amount,recevierAccountNo}=req.body
            validateUuid(userId)
            validateUuid(senderAccountNo)
            validateUuid(recevierAccountNo)
          
       
            if(typeof amount!="number"){
                throw new ValidationError("Invalid Amount")
                
            }
           
            const payload=checkJwtHS256(settingsConfig,req,res,next)
           
            if(payload.id!=userId){
               
    
                throw new Error("User Can Only Create Its Own Account")
            }
            
         
    
        const data=await accountService.transferAmount(settingsConfig,senderAccountNo,recevierAccountNo,amount,req.params)
         res.status(HttpStatusCode.Ok).json(data)
                    
        } catch (error) {
            next(error)
        }
      
    
    }
 async printPassBook(settingsConfig,req,res,next){
    try {
        const logger = settingsConfig.logger;
            logger.info(`[Account_CONTROLLER] : printPassBook`);
            const {accountNo}=req.params
            validateUuid(accountNo)
            await this.getAccount(settingsConfig,req,res,next,true)
            const {count,rows}=await accountService.printPassBook(settingsConfig,accountNo,req.params)
            res.set('X-Total-Count',await count)
        
            res.status(HttpStatusCode.Ok).json(await rows)
        
    } catch (error) {
        next(error)
    }
 }
 async getUserNetWorth(settingsConfig,req,res,next){
    try {
        const logger = settingsConfig.logger;
            logger.info(`[Account_CONTROLLER] : getUserNetWorth`);
            const {userId}=req.params
            validateUuid(userId)
            
            const {count,rows}=await accountService.getAllAccount(settingsConfig,req.params)
            const allAccounts=await rows
            let netWorth=0
            for(let i=0;i<allAccounts.length;i++){
             netWorth=netWorth+allAccounts[i].balance
            }
            res.set('X-Total-Count',1)
        
            res.status(HttpStatusCode.Ok).json(netWorth)
        
    } catch (error) {
        next(error)
    }
 }
 async getBankNetWorth(settingsConfig,req,res,next){
    try {
        const logger = settingsConfig.logger;
            logger.info(`[Account_CONTROLLER] : getBankNetWorth`);
            const {bankId}=req.params
            validateUuid(bankId)
            
            const {count,rows}=await accountService.bankNetWorth(settingsConfig,bankId,req.params)
            const allAccounts=await rows
            let netWorth=0
            for(let i=0;i<allAccounts.length;i++){
             netWorth=netWorth+allAccounts[i].balance
            }
            res.set('X-Total-Count',1)
        
            res.status(HttpStatusCode.Ok).json(netWorth)
        
    } catch (error) {
        next(error)
    }
 }
 async logout(settingsConfig, req, res, next) {
    try {
      const logger = settingsConfig.logger;
      logger.info(`[USER_CONTROLLER] : Inside login`);

      res.cookie(process.env.AUTH_CLIENT_NAME, "", {
        expires: new Date(Date.now()),
      });
      return res.status(200).json("Logout Succesful");
    } catch (error) {
      next(error);
    }
  }
}
module.exports=new AccountController()