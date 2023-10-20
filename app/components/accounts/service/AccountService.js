const {startTransaction}=require("../../../sequelize/transaction")
const bcrypt = require('bcrypt');
const { parseLimitAndOffset, unmarshalBody, parseSelectFields, parseFilterQueries }=require('../../../utils/request');
const { tokencreation } = require("../../../middleware/authService");
const accountConfig = require("../../../model-config/accountConfig");
const bankConfig = require("../../../model-config/bankConfig");
const { validateUuid } = require("../../../utils/uuid");
const transactionConfig = require("../../../model-config/transactionConfig");
const {v4}=require('uuid');

class AccountService{
    constructor(){

    }
    async createAccount(settingsConfig,account){
        const t= await startTransaction() 
        try {
            const logger = settingsConfig.logger;
            logger.info(`[USER_SERVICE] : Inside CreateUser`);
    
      
        const bankName=await bankConfig.model.findOne({...parseFilterQueries(account,bankConfig.filter,{[bankConfig.fieldMapping.id]:account.bankId})})
        if(bankName==null){
            throw Error("Bank With Given BankId Does NOT Exists")
        }
        

        account.bankName=bankName.name
 
let date = new Date()
    const data=await  accountConfig.model.create(account,{transaction:t})
   let  transaction={
        id:v4(),
        date:date.toLocaleDateString(),
        amount:account.balance,
        currentBalance:account.balance,
        type:"Account Opening Charges",
        accountId:account.id
    }
  await transactionConfig.model.create(transaction,{transaction:t})

    t.commit()

    return data
       
        
        } catch (error) {
            t.rollback()
            throw error
        }
    }
    async getAllAccount(settingsConfig,queryParams){
        const t= await startTransaction() 
        
        try {
        const logger = settingsConfig.logger;
        logger.info(`[Account_SERVICE] : Inside getAllAccount`);
        
        const data=await accountConfig.model.findAndCountAll({ transaction: t,
            ...parseFilterQueries(queryParams, accountConfig.filter,{[accountConfig.fieldMapping.userId]:queryParams.userId}),

            ...parseLimitAndOffset(queryParams)})
       if(data==null)
{
   throw new Error("Accounts Does Not Exists")

}       
        t.commit()
        return data
        } catch (error) {
            t.rollback()
            throw error
        }
    }
    async getAccount(settingsConfig,queryParams,payload){
        const t= await startTransaction() 
        try {
        const logger = settingsConfig.logger;
        logger.info(`[Account_SERVICE] : Inside getAccount`);
        validateUuid(queryParams.accountNo)
        const data=await accountConfig.model.findOne({...parseFilterQueries(queryParams,accountConfig.filter,{[accountConfig.fieldMapping.id]:queryParams.accountNo})})
       if(data==null) {
   throw new Error("Account Does Not Exists With Given Account Number")

}     
        if(payload.id!=data.userId){
            throw new Error("You Cannot Access Others Accounts")
        }

   console.log(payload.id)
        t.commit()
        return data
        } catch (error) {
            t.rollback()
            throw error
        }
    }
    async withdrawAmount(settingsConfig,newaccountNumber,amount,queryParams,flag,senderAccountNo,recevierAccountNo){
        const t= await startTransaction() 
        try {
        const logger = settingsConfig.logger;
        logger.info(`[Account_SERVICE] : Inside withdrawAmount`);
        console.log(newaccountNumber,amount);
        const data=await accountConfig.model.findOne({...parseFilterQueries(queryParams,accountConfig.filter,{[accountConfig.fieldMapping.id]:newaccountNumber})})

        if(data==null) {
   throw new Error("Account Does Not Exists With Given Account Number")

} 
const newBalance=data.balance-amount;
if(newBalance<1000){
    throw new Error("You Cannot Withdraw Money Because You Have Reached The Minimum Maintaince Amount") 
}
  await accountConfig.model.update({[accountConfig.fieldMapping.balance]:newBalance},{...parseFilterQueries(queryParams,accountConfig.filter,{[accountConfig.fieldMapping.id]:newaccountNumber})})  
  const date= new Date()
  let transaction
  if(flag==true){
    transaction={
        id:v4(),
        date:date.toLocaleDateString(),
        recevierAccountno:recevierAccountNo,
        amount:amount,
        currentBalance:newBalance,
        type:"transfer",
        accountId:newaccountNumber
    }
  }
  else{
    transaction={
        id:v4(),
        date:date.toLocaleDateString(),
        senderAccountno:newaccountNumber,
        amount:amount,
        currentBalance:newBalance,
        type:"WithDraw",
        accountId:newaccountNumber
    }
  }

await transactionConfig.model.create(transaction,{transaction:t})

 
        t.commit()
        return `Amount WithDrawn From Account ${newaccountNumber}`
        } catch (error) {
            t.rollback()
            throw error
        }
    }
    async depositAmount(settingsConfig,newaccountNumber,amount,queryParams,flag,senderAccountNo,recevierAccountNo){
        const t= await startTransaction() 
        try {
        const logger = settingsConfig.logger;
        logger.info(`[Account_SERVICE] : Inside depositAmount`);
        const date=new Date()
      
        console.log(newaccountNumber,amount);
        const data=await accountConfig.model.findOne({...parseFilterQueries(queryParams,accountConfig.filter,{[accountConfig.fieldMapping.id]:newaccountNumber})})
        const currentBalance=data.balance+amount
        let transaction
        if(flag==true){
            transaction={
                id:v4(),
                date:date.toLocaleDateString(),
                senderAccountno:senderAccountNo,
                amount:amount,
                currentBalance:currentBalance,
                type:"transfer",
                accountId:newaccountNumber
            }
          }
          else{
            transaction={
                id:v4(),
                date:date.toLocaleDateString(),
                senderAccountno:newaccountNumber,
                amount:amount,
                currentBalance:currentBalance,
                type:"WithDraw",
                accountId:newaccountNumber
            }
          }
        if(data==null) {
   throw new Error("Account Does Not Exists With Given Account Number")

} 
const newBalance=data.balance+amount;

  await accountConfig.model.update({[accountConfig.fieldMapping.balance]:newBalance},{...parseFilterQueries(queryParams,accountConfig.filter,{[accountConfig.fieldMapping.id]:newaccountNumber})})  
  await transactionConfig.model.create(transaction,{transaction:t})
 
        t.commit()
        return `Amount Deposited To Account ${newaccountNumber}`
        } catch (error) {
            t.rollback()
            throw error
        }
    }
    async transferAmount(settingsConfig,senderAccountNo,recevierAccountNo,amount,queryParams){
        const flag=true
        const t= await startTransaction() 
        try {
        const logger = settingsConfig.logger;
        logger.info(`[Account_SERVICE] : Inside transferAmount`);
    
        const sender=await accountConfig.model.findOne({...parseFilterQueries(queryParams,accountConfig.filter,{[accountConfig.fieldMapping.id]:senderAccountNo})})
        const recevier=await accountConfig.model.findOne({...parseFilterQueries(queryParams,accountConfig.filter,{[accountConfig.fieldMapping.id]:recevierAccountNo})})
        
        if(sender==null||recevier==null) {
   throw new Error("Account Does Not Exists With Given Account Number")

} 
   await this.withdrawAmount(settingsConfig,senderAccountNo,amount,queryParams,true,senderAccountNo,recevierAccountNo)
   await this.depositAmount(settingsConfig,recevierAccountNo,amount,queryParams,true,senderAccountNo,recevierAccountNo)

 
        t.commit()
        return `Amount Transfered From ${senderAccountNo} To Account ${recevierAccountNo}`
        } catch (error) {
            t.rollback()
            throw error
        }
    }
 async printPassBook(settingsConfig,accountNo,queryParams){
    const t=await startTransaction()
    try {
       
       const data= await transactionConfig.model.findAndCountAll({...parseFilterQueries(queryParams,transactionConfig.filter,{[transactionConfig.fieldMapping.accountId]:accountNo}),transaction:t}) 
       t.commit()

       return data
    } catch (error) {
        t.rollback()
        throw error
    }
 }
 async bankNetWorth(settingsConfig,bankId,queryParams){
    const t=await startTransaction()
    try {
       const data= await accountConfig.model.findAndCountAll({...parseFilterQueries(queryParams,accountConfig.filter,{[accountConfig.fieldMapping.bankId]:bankId}),transaction:t}) 
       t.commit()

       return data
    } catch (error) {
        t.rollback()
        throw error
    }
 }
// async #updateName(settingsConfig,newValue,params){
//     const t= await startTransaction() 
    
//     try {
//         const logger = settingsConfig.logger;
//         logger.info(`[USER_SERVICE] : Inside updateName`);
//         await userConfig.model.update({[userConfig.fieldMapping.name]:newValue},{...parseFilterQueries(params,userConfig.filter,{[userConfig.fieldMapping.username]:params.userId})})        
//     } catch (error) {
//         throw error
//     }
// }
// async #updateAge(settingsConfig,newValue,params){
//     const t= await startTransaction() 
    
//     try {
//         const logger = settingsConfig.logger;
//         logger.info(`[USER_SERVICE] : Inside updateAge`);
//         await userConfig.model.update({[userConfig.fieldMapping.age]:newValue},{...parseFilterQueries(params,userConfig.filter,{[userConfig.fieldMapping.id]:params.userId})})        

//           t.commit()
//     } catch (error) {
//         t.rollback()
//         throw error
//     }
// }
// async #updateGender(settingsConfig,newValue,params){
//     const t= await startTransaction() 
    
//     try {
//         const logger = settingsConfig.logger;
//         logger.info(`[USER_SERVICE] : Inside updateGender`);
//         await userConfig.model.update({[userConfig.fieldMapping.gender]:newValue},{...parseFilterQueries(params,userConfig.filter,{[userConfig.fieldMapping.id]:params.userId})})        
//     } catch (error) {
//         throw error
//     }
// }
// async #updateUserName(settingsConfig,newValue,params){
//     const t= await startTransaction() 
    
//     try {
//         const logger = settingsConfig.logger;
//         logger.info(`[USER_SERVICE] : Inside updateUserName`);
        
        
//         const userExitence=await userConfig.model.findOne({...parseFilterQueries(user,userConfig.filter,{[userConfig.fieldMapping.username]:newValue})})
//         if(userExitence==null)
//  {
//     await userConfig.model.update({[userConfig.fieldMapping.username]:newValue},{...parseFilterQueries(params,userConfig.filter,{[userConfig.fieldMapping.id]:params.userId})})        

//      t.commit()
 
//      return 
 
//  }       
//        throw new Error("User Exist With Same UserName,Please Use Diffrent Username")
         
//          } catch (error) {
//              t.rollback()
//              throw error
//          }
        
// }
// async #updatePassword(settingsConfig,newValue,params){
//     const t= await startTransaction() 
    
//     try {
//         const newPassword=await bcrypt.hash(newValue,12)
//         const logger = settingsConfig.logger;
//         logger.info(`[USER_SERVICE] : Inside updatePassword`);
//         await userConfig.model.update({[userConfig.fieldMapping.password]:newPassword},{...parseFilterQueries(params,userConfig.filter,{[userConfig.fieldMapping.id]:params.id})})        
//     } catch (error) {
//         throw error
//     }
// }
// async updateUser(settingsConfig,parameter,newValue,params){
//     const t= await startTransaction() 
// try {
//     const logger = settingsConfig.logger;
//     logger.info(`[USER_SERVICE] : Inside updateUser`);
//     switch(parameter){
//         case "name":{await this.#updateName(settingsConfig,newValue,params)
//         return
//         }
//         case "age":{await this.#updateAge(settingsConfig,newValue,params)
//             return
//             }
//         case "gender":{await this.#updateGender(settingsConfig,newValue,params)
//                 return
//                 }   
//         case "username":{await this.#updateUserName(settingsConfig,newValue,params)
//             return
//             } 
//         case "password":{await this.#updatePassword(settingsConfig,newValue,params)
//             return
//             }             
//         default:{throw new Error("InValid Paramter To change")}
//     }
    
// } catch (error) {
//     t.rollback()
//     throw error
// }
// }

// async login(settingsConfig, bodyElements) {
//     const t = await startTransaction();
//     try {
//       const { username, password } = bodyElements;

//       const arrtibutesToReturn = {
//         password: userConfig.fieldMapping.password,
//         id: userConfig.fieldMapping.id,
//         name: userConfig.fieldMapping.name,
//         age: userConfig.fieldMapping.age,
//         gender: userConfig.fieldMapping.gender,
//         isAdmin: userConfig.fieldMapping.isAdmin,
//       };
   

//       const selectArray = Object.values(arrtibutesToReturn);
//       const passwordObj = await userConfig.model.findOne( {
//           ...parseFilterQueries(bodyElements,userConfig.filter,{[userConfig.fieldMapping.username]:username})
//       });
//     //   const passwordObj = await userConfig.model.findOne({
//     //     ...parseFilterQueries(bodyElements, userConfig.filter, {
//     //       [userConfig.fieldMapping.username]: username,
//     //     }),
//     //     attributes: selectArray,
//     //     transaction: t,
//     //   });
//       const result = bcrypt.compare(password, await passwordObj.password);
//       console.log(await passwordObj.password)

//       if (!(await result)) {

//         throw new Error("Invalid Password");
//       }
//       if (await result) {
//         const payload = {
//           id: passwordObj.id,
//           username: passwordObj.username,
//           isAdmin: passwordObj.isAdmin,
//         };

//         const token = tokencreation(payload);
//         return token;
//       }
//     } catch (error) {
//       throw error;
//     }
//   }

}

const accountService=new AccountService()
module.exports=accountService