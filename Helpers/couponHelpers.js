var env = require('dotenv').config();
var db = require('../Config/connection')
var collection = require('../Config/collection')
const { resolve } = require('promise')
var objectId = require('mongodb').ObjectId

module.exports = {
    applyCoupon: (couponData, userId, date, totalAmount, logIn) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ couponcode: couponData.couponCode })
            console.log(coupon, 'ccccccccccvvvvvvvvvvvvvvdddddddddddd');
            if (coupon) {
                const expDate = new Date(coupon.expireDate)
                console.log(date, 'jjjjjjjjjjjjuuuuuuuuuu');
                response.couponData = coupon
                if (date <= expDate) {
                    console.log(expDate, '///////////////////');
                    response.dateValid = true;
                    console.log(response, 'uuuuuuuuuuuuutttttttttttt');
                    resolve(response)

                    let total = totalAmount
                    if (total >= coupon.minimumAmount) {
                        response.verifyMinimumAmount = true;
                        resolve(response)

                        if (total <= coupon.maximumAmount) {
                            response.verifyMaximumAmount = true;
                            resolve(response)
                        } else {
                            response.maximumAmountMsg = "Your Maximum Purchase should be" + coupon.maximumAmount;
                            response.maximumAmount = true;
                            resolve(response)
                        }
                    } else {
                        response.minimumAmountMsg = "Your Minimum purchase should be" + coupon.minimumAmount;
                        response.minimumAmount = true;
                        resolve(response)
                    }
                } else {
                    response.invalidDateMsg = 'Coupon Expired'
                    response.invalidDate = true
                    response.Coupenused = false
                    resolve(response)
                    console.log('invalid date');
                }


            } else {
                response.invalidCoupon = true;
                response.invalidCouponMsg = "Invalid Coupon";
                console.log(response.invalidCouponMsg, 'ffffffffffbbbbbbbbbnnnnnnnnnnn');
                resolve(response)
            }

            if (response.dateValid && response.verifyMaximumAmount && response.verifyMinimumAmount) {
                response.verify = true;
            }
        })

    },
    deleteCoupon: (couponId) =>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id : objectId(couponId)}).then((response) => {
                console.log(response,'yyyyyyyyyyyyyyyyyyyyyyyyyy');
                resolve(response)
            })
        })
    }, 
    editCouponGet: (couponId) => {
        return new Promise(async(resolve, reject) => {
            let couponDetails = await  db.get().collection(collection.COUPON_COLLECTION).findOne({_id : objectId(couponId)})
                resolve(couponDetails)
        })
    },
    editCouponPost: (couponBodyId, couponBody) => {
        console.log(couponBodyId,'eeeeeeeeeeerrrrrrrrrrrrrrr');
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).updateOne({_id : objectId(couponBodyId)},{$set : {
                couponName : couponBody.couponName,
                couponcode : couponBody.couponcode,
                minimumAmount : couponBody.minimumAmount,
                maximumAmount : couponBody.maximumAmount,
                expireDate : couponBody.expireDate,
                couponPercentage : couponBody.couponPercentage
            }}).then((response) => {
                resolve(response)
            })
        })
    }
}