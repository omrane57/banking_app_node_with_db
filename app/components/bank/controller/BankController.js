const { validate } = require("uuid");
const { HttpStatusCode } = require("axios");
const {v4}=require('uuid');
const { validateUuid } = require("../../../utils/uuid");
const bankService = require("../service/BankService");
const bankConfig = require("../../../model-config/bankConfig");
class bankController{
    constructor(){
      this.newBankService=bankService
    }
    async createBank(settingsConfig,req,res,next){
        try {
        const logger = settingsConfig.logger;
        logger.info(`[Bank_CONTROLLER] : Inside createBank`);
        const bank=req.body
        bank.id=v4()
        bankConfig.validateBank(bank)
        const data =await this.newBankService.createbank(settingsConfig,bank)
        res.status(HttpStatusCode.Ok).json(await data)
        } catch (error) {
            next(error)
        }
    }
    // async deleteUser(settingsConfig,req,res,next){
    //     try {
    //     const logger = settingsConfig.logger;
    //     logger.info(`[USER_CONTROLLER] : Inside deleteUser`);
    //     const queryParams=req.query
    //     validateUuid(queryParams.id)
    //     await this.newBankService.deleteUser(settingsConfig,queryParams)
    //     res.set('X-Total-Count',0)
    //     res.status(HttpStatusCode.Ok).json("User Deleted Successfully")
    //     } catch (error) {
    //         next(error)
    //     }
    // }
    async getAllBank(settingsConfig,req,res,next){
        try {
        const logger = settingsConfig.logger;
        const queryParams=req.query
        logger.info(`[bank_CONTROLLER] : Inside getAllbank`);
        const {rows,count} =await this.newBankService.getAllBank(settingsConfig,queryParams)
        res.set('X-Total-Count',count)
        res.status(HttpStatusCode.Ok).json(await rows)
        } catch (error) {
            next(error)
        }
    }
    
    async getBank(settingsConfig,req,res,next){
        try {
        const logger = settingsConfig.logger;
        logger.info(`[Bank_CONTROLLER] : Inside getBank`);
        const {bankId}=req.params
        validateUuid(bankId)
        const  data=await this.newBankService.getBank(settingsConfig,req.params)
        res.set('X-Total-Count',1)
        res.status(HttpStatusCode.Ok).json(await data)
        } catch (error) {
            next(error)
        }
    }
    // async updateUser(settingsConfig,req,res,next){
    //     try {
    //     const logger = settingsConfig.logger;
    //     const {userId}=req.params
    //     validateUuid(userId)
    //     const{parameter,newValue}=req.body
    //     logger.info(`[USER_CONTROLLER] : Inside updateUser`);
    //     switch(parameter){
    //         case "name":{ userConfig.validateName(newValue)
    //                      break;
    //         }
    //         case "age":{ userConfig.validateAge(newValue)
    //                         break;
    //             }
    //         case "gender":{ userConfig.validateGender(newValue)
    //                                break;
    //                 }   
    //         case "username":{userConfig.validateUsername(newValue)

    //             break;
    //             } 
    //         case "password":{userConfig.validatePassword(newValue)

    //             break;
    //             }             
    //         default:{throw new Error("InValid Paramter To change")}
    //     }
    //   await  this.newBankService.updateUser(settingsConfig,parameter,newValue,req.params)
    //     res.status(HttpStatusCode.Ok).json("UserUpdated SuccessFully")
    //     } catch (error) {
    //         next(error)
    //     }
    // }
}
module.exports=new bankController()