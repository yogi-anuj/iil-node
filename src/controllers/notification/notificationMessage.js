

const NotificationMessage = {    
 distributorMappingMessage : (managerName = '', saleRepresentative) => {
    try{
       const msg = `Hi ${managerName},A new distributor is mapped by ${saleRepresentative}, kindly fill in the remaining fields to complete the mapping`;
      return  (msg);
  
    }catch(error){
      throw error;
    }
   
  },
}

module.exports = {NotificationMessage}