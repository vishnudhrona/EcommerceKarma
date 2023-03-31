var db = require('../Config/connection')
var collection = require('../Config/collection')
const bcrypt = require('bcrypt')
const validatePhoneNumber = require('validate-phone-number-node-js');
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
require('dotenv').config()
const OTP = require('../Config/OTP') 
const Client = require('twilio')(OTP.accountSID,OTP.authToken)



const uuid = require("uuid");

var instance = new Razorpay({
  key_id: 'rzp_test_gFSzKrbiJVMqDa',
  key_secret: 'xyM3duBSdGj0LM5YfK4aCj5D',
});


module.exports = {
    doSignup:(userData)=>{
        userData.signupstatus=false;
        return new Promise (async(resolve, reject)=>{
            try{
                userData.password =await  bcrypt.hash(userData.password,10)
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                    resolve(data.insertedId)
                    
                })
            }catch(err){
                let error = {}
                error.message = 'Something went wrong'
                reject(error)
            }
        })
    },
    
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = {}
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
                if (user) {
                    bcrypt.compare(userData.password, user.password).then((status) => {
                        if (status) {
                            console.log('login Success');
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {
                            console.log('Login failed');
                            resolve({ status: false })
                        }
                    })
                } else {
                    console.log('Login failed');
                    resolve({ status: false })
                }
            } catch (err) {
                let error = {}
                error.message = 'Something went wrong'
                reject(error)
            }
        })
    },
    getAllUsers:()=>{
        return new Promise((resolve, reject)=>{
            try{
                db.get().collection(collection.USER_COLLECTION).find().toArray().then((user)=>{
                    resolve(user)
                })
                
            }catch{

            }
        })
    },
    blockUser:(id)=>{
        return new Promise((resolve, reject)=>{
            try{
                db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(id)},{$set:{signupstatus:true}})
                resolve()
            }catch(err){
                let error = {}
                error.message = 'Something went wrong'
                reject(error)
            }
        })
    },
    unblockUser:(userId)=>{
        return new Promise((resolve, reject)=>{
            try{
                db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{signupstatus:false}})
                resolve()
            }catch(err){
                let error = {}
                error.message = 'Something went wrong'
                reject(error)
            }
        })
    },
    addToCart: (productId, userId) => {
        let proObj = {
            item: objectId(productId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            try {
                let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
                if (userCart) {
                    let proExist = userCart.products.findIndex(product => product.item == productId)
                    if (proExist != -1) {
                        db.get().collection(collection.CART_COLLECTION)
                            .updateOne({user:objectId(userId),'products.item':objectId(productId)},
                                {
                                    $inc: { 'products.$.quantity': 1 }
                                }).then(() => {
                                    resolve()
                                })
                    } else {
                        db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) }, {
                            $push: { products:proObj }
                        }).then((response) => {
                            resolve()
                        })
                    }

                } else {
                    let cartObj = {
                        user: objectId(userId),
                        products: [proObj]
                    }
                    db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                        resolve()
                    })
                }
            } catch (err) {
                let error = {}
                error.message = 'Something went wrong'
                reject(error)
            }
        })
    },
    getAllCartProducts:(userId)=>{
        return new Promise(async(resolve, reject)=>{
               let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
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
                        product:{$arrayElemAt:['$product',0]}
                    }
                }

               ]).toArray()
               resolve(cartItems)
            
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity: (details) => {
        console.log(details,'llllllllllpppppp');
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)

        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } }
                        }).then((response) => {
                            resolve({ removeProduct: true })
                        })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }).then((response) => {
                            resolve({ status: true })
                        })
            }

        })
    },
    getTotalAmount:(userId)=>{
        try{
            return new Promise(async(resolve, reject)=>{
                let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                 {
                     $match:{user:objectId(userId)}
                 },
                 {
                     $unwind:'$products'
                 },
                 {
                     $project:{
                         item:'$products.item',
                         quantity:'$products.quantity'
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
                         product:{$arrayElemAt:['$product',0]}
                     }
                 },
                 {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity','$product.offerprice']}}
                    }
                 }
    
                ]).toArray()
                    resolve(total[0].total)
         })
        }catch(error){
            console.log("Error: ", error);
        res.status(500).render("user/cartEmpty",{ message: "please login or signup"});
        }
        
        
    },
    getCartProductList:(userId)=>{
        return new Promise(async(resolve, reject)=>{
           let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
           resolve(cart.products)
        })
    },
    checkoutOrder:(order,products,total)=>{
        return new Promise((resolve, reject)=>{
            let status = order['paymentMethod']==='COD'?'placed':'pending'
            let orderObj = {
                deliveryDetails:{
                    name:order.name,
                    number:order.number,
                    house:order.house,
                    city:order.city,
                    town:order.town,
                    country:order.country,
                    zip:order.zip,
                    date:new Date()
                },
                userId:objectId(order.userId),
                paymentMethod:order['paymentMethod'],
                products:products,
                totalAmount:total,
                status:status,
                date:new Date()
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
                resolve(response.insertedId)
            }))
        })
    },
    getOrderDetails:(orderId)=>{
        return new Promise((resolve, reject)=>{
           let orderDetails =  db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId)})
           resolve(orderDetails)
        })
    },
    getOrderProduct:(orderId)=>{
        return new Promise(async(resolve, reject)=>{
            let productDetails = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:objectId(orderId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
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
                        product:{$arrayElemAt:['$product',0]}
                    }
                }

               ]).toArray()
               resolve(productDetails)
        })
    },
    getAllOrders:(userId)=>{
        return new Promise(async(resolve, reject)=>{
            let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{userId:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity',
                        status:'$status'
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
                        status:1

                    }
                }

               ]).toArray()
               resolve(orders)
        })
    },
    deleteCartProduct: (cartDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id: objectId(cartDetails.cart) },
                    {
                        $pull: { products: { item: objectId(cartDetails.product) } }
                    }
                ).then((response) => {
                    resolve({ removeProduct: true })
                })

        })
    },
    generateRazorpay: (orderId, totalPrice) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: totalPrice*100,
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                if(err){
                    console.log(err,'order error');
                }else{
                    console.log('new order:', order);
                    resolve(order)
                }
                
            })
        })
    },
    verifyPayment:(details)=>{
        return new Promise((resolve, reject)=>{
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'xyM3duBSdGj0LM5YfK4aCj5D')
            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if(hmac==details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
        })
    },
    changePaymentStatus:(orderId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
            {
                $set:{
                    status:'placed'
                }
            }).then(()=>{
                resolve()
            })
        })
    },
    otpLogin:(otpDetails)=>{
        return new Promise(async(resolve, reject)=>{
            let response = {}
          let user = await  db.get().collection(collection.USER_COLLECTION).findOne({number:otpDetails.number})
          if(user){
            otpDetails.number=parseInt(otpDetails.number)
            response.status = true
            response.user = user
            Client.verify.services(OTP.serviceSID)
            .verifications
            .create({ to: `+91${otpDetails.number}`, channel: 'sms' })
            .then((verifications) => {
                    console.log(verifications,"hey this is the vrifucatijon")
            });
            resolve(response)
          }else{
            response.status = false
            resolve(response)

          }
        })
    },
    otpConfirm:(otp,userData)=>{
        return new Promise((resolve, reject)=>{
            Client.verify.services(OTP.serviceSID)
                .verificationChecks
                .create({
                    to: `+91${userData.number}`,
                    code: otp.otp
                }).then((data)=>{
                    if(data.status == 'approved'){
                        resolve({status:true})
                    }else{
                        resolve({status:false})
                    }
                })
        })
    },
    addAddress:(address)=>{
        address.userId=objectId(address.userId)
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.ADDRESS_COLLECTION).insertOne(address).then((response)=>{
                resolve(response)
            })
        })
    },
    getAllAddress:(userId)=>{
        return new Promise(async(resolve, reject)=>{
        let address = await db.get().collection(collection.ADDRESS_COLLECTION).find({userId:objectId(userId)}).toArray()
                resolve(address)
            
        })
    },
    cancelOrder: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).
                updateOne({ _id: objectId(proId) }, {
                    $set:
                    {
                        status: 'User canceled Order'
                    }
                })
        })
    },
    shippedOrderCancel:(proId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    
                    status: 'User canceled Order'
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    returnOrder: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(productId) }, {
                $set:
                {
                    status: 'Your amount will be credited 3 Buisiness Days'
                }
            })
        })
    },
    forgotPassword: (ForgotPasswordDetails) => {
        return new Promise(async(resolve, reject) => {
            let response = {}
            let registerednumber = await db.get().collection(collection.USER_COLLECTION).findOne({ number: ForgotPasswordDetails.registerednumber })
            if (registerednumber) {
                registerednumber.number = parseInt(registerednumber.number)
                response.status = true
                response.registerednumber = registerednumber
                Client.verify.services(OTP.serviceSID)
                    .verifications
                    .create({ to: `+91${registerednumber.number}`, channel: 'sms' })
                    .then((verifications) => {
                        console.log(verifications, "hey this is the vrifucatijon")
                    });
                resolve(response)
            } else {
                response.status = false
                resolve(response)
            }
        })
    },
    forgotPasswordConfirmPost: (userNumber, passDetails) => {
        return new Promise(async (resolve, reject) => {
            passDetails.newpassword = await bcrypt.hash(passDetails.newpassword, 10)
            let newPassword = await db.get().collection(collection.USER_COLLECTION).
                updateOne({ number: userNumber }, {
                    $set:
                    {
                        password: passDetails.newpassword
                    }
                })
            Client.verify.services(OTP.serviceSID)
                .verificationChecks
                .create({
                    to: `+91${userNumber}`,
                    code: passDetails.otp
                }).then((data) => {
                    if (data.status == 'approved') {
                        resolve({ status: true })
                    } else {
                        resolve({ status: false })
                    }
                })

        })
    },
    paginatorCount:(count)=>{
        return new Promise((resolve, reject) => {
          pages = Math.ceil(count/6)
          let arr = []
          for (let i = 1; i <= pages; i++) {
              arr.push(i)
          }
          resolve(arr)
         })
      },
      getTenProducts: (Pageno) => {
        return new Promise(async (resolve, reject) => {
            let val = (Pageno - 1) * 6
            let AllProducts = await db.get().collection(collection.PRODUCT_COLLECTION)
                .find().sort({ _id: -1 }).skip(val).limit(6).toArray()
            resolve(AllProducts)
        })
    },
    addToWishlist:(userId,productId)=>{
        return new Promise(async(resolve, reject)=>{
            let userWishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:objectId(userId)})
            if(userWishlist){
                db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectId(userId)},{$addToSet:
                    {
                        productWish:objectId(productId)
                    }
                }).then(()=>{
                    resolve()
                })
            }else{
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne({user:objectId(userId),productWish : [objectId(productId)]}).then(()=>{
                    resolve()
                })
            }
        })
    },
    getAllWishlistProduct:(userId)=>{
        return new Promise(async(resolve, reject)=>{
            let wishlistItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$productWish'
                },
                {
                    $project:{productWish:1}
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'productWish',
                        foreignField:'_id',
                        as:'wishItems'

                    }
                },
                {
                    $project:{
                        wishItems:{$arrayElemAt:['$wishItems',0]}
                    }
                }
            ]).toArray()
            resolve(wishlistItems)
        })
    },
    getWishCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let wishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (wishlist) {
                count = wishlist.productWish.length
            }
            resolve(count)
        })
    },
    deleteWishProduct:(wishDetails)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({_id:objectId(wishDetails.wishList)},
            {
                $pull:{productWish:objectId(wishDetails.product)}
            }).then((response)=>{
                resolve({removeProduct: true})
            })
        })
    },
    decrementStock:(data)=>{
        return new Promise(async(resolve,reject)=>{
            try{
               stock = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:data.item},
                    {
                        $inc:{stock:-data.quantity}
                    })
                    resolve(stock)
            }catch(err){
                let error={}
                error.message = "Something went wrong"
                
                reject(error)
            }
                
            
        })
    },
    stockIncrement:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},
                {
                    $inc:{stock:quantity}
                }).then((response)=>{
                    resolve(response)
                }).catch((err)=>{
                    let error={}
                        error.message = "Something went wrong"
                        reject(error)
                })
        })
    
     }
}


