var db = require('../Config/connection')
var collection = require('../Config/collection')
var objectId = require('mongodb').ObjectId

module.exports = {
    
    addProduct:(productId)=>{
        return new Promise((resolve, reject)=>{
            try{
                let product = db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productId).then((data)=>{
                    resolve(data.insertedId)
                })
            }catch(err){
                let error = {}
                error.message = 'Something went wrong'
                reject(error)
            }
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve, reject)=>{
            try{
                let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
                resolve(products)
            }catch(err){
                let error = {}
                error.message = 'Something went wrong'
                reject(error)
            }
        })
    },
    deleteProduct:(productId)=>{
        return new Promise((resolve, reject)=>{
            try{
                db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(productId)}).then((response)=>{
                    resolve(response)
                })
                
            }catch(err){
                let error = {}
                error.message = 'Something went wrong'
                reject(error)
            }
        })
    },
    getProductDeatails:(productId)=>{
        return new Promise((resolve, reject)=>{
            try{
                db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(productId)}).then((response)=>{
                    resolve(response)
                })
            }catch(err){
                let error = {}
                error.message = 'Something went wrong'
                reject(error)
            }
        })
    },
    updateProduct:(proId,proBody)=>{
        return new Promise((resolve, reject)=>{
            try{
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{$set:{
                    name:proBody.name,
                    category:proBody.category,
                    price:proBody.price,
                    offerPrice:proBody.offerPrice,
                    description:proBody.description,
                    image1: proBody.image1,
                    image2: proBody.image2,
                    image3: proBody.image3,
                    image4: proBody.image4
                }}).then((response)=>{
                    resolve(response)
                })
            }catch(err){
                let error = {}
                error.message = 'Something went wrong'
                reject(error)
            }
        })
    },
    fetchImage1: (proID) => {
        console.log(proID,'hi img 1');
        return new Promise(async (resolve, reject) => {
            let detail = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proID) }, { projection: { image1: true } })
            resolve(detail.image1)
        })
    },
    fetchImage2: (proID) => {
        return new Promise(async (resolve, reject) => {
            let detail = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proID) }, { projection: { image2: true } })
            resolve(detail.image2)
        })
    },
    fetchImage3: (proID) => {
        return new Promise(async (resolve, reject) => {
            let detail = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proID) }, { projection: { image3: true } })
            resolve(detail.image3)
        })
    },
    fetchImage4: (proID) => {
        return new Promise(async (resolve, reject) => {
            let detail = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proID) }, { projection: { image4: true } })
            resolve(detail.image4)
        })
    }
}