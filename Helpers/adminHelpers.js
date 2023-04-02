var env = require('dotenv').config();
var db = require('../Config/connection')
var collection = require('../Config/collection');
const { resolve } = require('promise');
var objectId = require('mongodb').ObjectId

module.exports = {

    addBanner:(banner)=>{
        banner.blockstatus = true;
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).insertOne(banner).then((data)=>{
                resolve(data)
            })
        })
    },
    getAllBanner:()=>{
        return new Promise(async(resolve, reject)=>{
            let banner = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(banner)
        })
    },
    blockBanner:(bannerId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:objectId(bannerId)},{$set:{blockstatus:false}})
            resolve()
        })
    },
    ublockBanner:(banId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:objectId(banId)},{$set:{blockstatus:true}})
            resolve()
        })
    },
    getAllorderDetails:()=>{
        return new Promise(async(resolve, reject)=>{
            let allOrder = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            resolve(allOrder)
        })
    },
    getOneProduct:(ordId)=>{
        return new Promise(async(resolve, reject)=>{
            let oneProduct = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:objectId(ordId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity',
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,
                        quantity:1,
                        product:{$arrayElemAt:['$product',0]},

                    }
                }

               ]).toArray()
               resolve(oneProduct)
               console.log(oneProduct,'55555555555777777777777777777');
        })
    },
    productShipped:(proId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).
       updateOne({_id:objectId(proId)},
       {$set:
        {
            status:'shipped'
       }})
       resolve()
        })
       

    },
    productDelivered:(proId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).
        updateOne({_id:objectId(proId)},
        {$set:
            {
                status:'delivered'
            }})
            resolve()
        })
    },
    productCancel:(proId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).
        updateOne({_id:objectId(proId)},
        {$set:
            {
                status:'admin cancel order'
            }})
            resolve()
        })
        
    },
    addCoupon:(couponBody)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.COUPON_COLLECTION).insertOne(couponBody)
            resolve()
        }) 
    },
    getAllCoupon: () => {
        return new Promise(async(resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupon)
        })

    },
    getDailySalesGraph:()=>{
        return new Promise(async(resolve,reject)=>{
            let sales=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
              {
                $project: { date: 1, totalAmount: 1 }
            },
             
              {
                $group:{
                  _id: {$dateToString: {format: "%Y-%m-%d",date:"$date"}},
                  totalAmount: { $sum: '$totalAmount' },
                  count: { $sum: 1 }
                }
              },
              {
                $sort:{
                  _id:1
                }
              },
              {
                $limit:7
              }
            ]).toArray()
            resolve(sales)
        })
      },
      getMonthlySalesGraph:()=>{
        return new Promise(async(resolve,reject)=>{
          let sales=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
              $project: { date: 1, totalAmount: 1 }
          },
           
            {
              $group:{
                _id: {$dateToString: {format: "%Y-%m",date:"$date"}},
                totalAmount: { $sum: '$totalAmount' },
                count: { $sum: 1 }
              }
            },
            {
              $sort:{
                _id: 1
              }
            },
            {
              $limit:7
            }
          ]).toArray()
          resolve(sales)
        })
      },
      getYearlySalesGraph:()=>{
        return new Promise(async(resolve,reject)=>{
          let sales=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
              $project: { date: 1, totalAmount: 1 }
          },
           
            {
              $group:{
                _id: {$dateToString: {format: "%Y",date:"$date"}},
                totalAmount: { $sum: '$totalAmount' },
                count: { $sum: 1 }
              }
            },
            {
              $sort:{
                _id: 1
              }
            },
            {
              $limit:7
            }
          ]).toArray()
          resolve(sales)
        })
      },
      paginatorCount:(count)=>{
        return new Promise((resolve, reject) => {
          pages = Math.ceil(count/4)
          let arr = []
          for (let i = 1; i <= pages; i++) {
              arr.push(i)
          }
          resolve(arr)
         })
      },
      getTenProducts: (Pageno) => {
        return new Promise(async (resolve, reject) => {
            let val = (Pageno - 1) * 4
            let AllProducts_ = await db.get().collection(collection.COUPON_COLLECTION)
                .find().sort({ _id: -1 }).skip(val).limit(4).toArray()
            resolve(AllProducts_)
        })
    },
    getTenUsers: (Pageno) => {
      return new Promise(async (resolve, reject) => {
          let val = (Pageno - 1) * 4
          let AllProducts_ = await db.get().collection(collection.USER_COLLECTION)
              .find().sort({ _id: -1 }).skip(val).limit(4).toArray()
          resolve(AllProducts_)
      })
  },
  getTenOrders: (Pageno) => {
    return new Promise(async (resolve, reject) => {
        let val = (Pageno - 1) * 4
        let AllProducts_ = await db.get().collection(collection.ORDER_COLLECTION)
            .find().sort({ _id: -1 }).skip(val).limit(4).toArray()
        resolve(AllProducts_)
    })
}
}