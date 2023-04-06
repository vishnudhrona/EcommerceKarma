var env = require('dotenv').config();
var db = require('../Config/connection')
var collection = require('../Config/collection')
var objectId = require('mongodb').ObjectId

module.exports = {

    addCategory: (catDetails) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(catDetails).then((data) => {
                    resolve()
                })
            } catch (err) {
                let error = {}
                error.message = 'Something went wrong'
                reject(error)
            }
        })
    },
    getAllCategory:()=>{
        return new Promise((resolve, reject)=>{
            try{
                db.get().collection(collection.CATEGORY_COLLECTION).find().toArray().then((products)=>{
                    resolve(products)
                })
            }catch(err){
                let error = {}
                error.message = 'Something went wrong'
                reject(error)
            }
        })
    },
    deleteCategory:(catId)=>{
        return new Promise((resolve, reject)=>{
            try{
                db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(catId)}).then((response)=>{
                    resolve(response)
                })
            }catch(err){
                let error = {}
                error.message = 'Something went wrong'
                reject(error)
            }
        })
    },
    getCategory:(catId)=>{
        return new Promise((resolve, reject)=>{
            try{
                db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catId)}).then((response)=>{
                    resolve(response)
                })
            }catch(err){
                let error = {}
                error.message = 'Something went wrong'
                reject(error)
            }
        })
    },
    getACategory:(catId)=>{
        return new Promise((resolve, reject)=>{
            try{
                db.get().collection(collection.CATEGORY_COLLECTION).findOne({categoryname:catId}).then((response)=>{
                    resolve(response)
                })
            }catch(err){
                let error = {}
                error.message = 'Something went wrong'
                reject(error)
            }
        })
    },
    updateCategory:(catId,catBody)=>{
        return new Promise((resolve, reject)=>{
            try{
                db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(catId)},{$set:{
                    categoryname:catBody.categoryname,
                    description:catBody.description
                }}).then((response)=>{
                    resolve(response)
                })
            }catch(err){
                let error = {}
                error.message = 'Something went wrong'
                reject(error)
            }
        })
    }

}