var express = require("express");
var router = express.Router();
const productHelpers = require("../Helpers/productHelpers");
const userHelpers = require('../Helpers/userHelpers')
const adminHelpers = require('../Helpers/adminHelpers');
const couponHelpers = require('../Helpers/couponHelpers')


let userHome = async (req, res) => {
    try {
        let status = {};
        let logIn = req.session.user;
        req.session.returnTo = req.originalUrl;
        let cartCount = null;
        if (req.session.user) {
            try {
                cartCount = await userHelpers.getCartCount(req.session.user._id);
            } catch (error) {
                console.log("Error: ", error);
                res.status(500).render("user/error", { message: "Something went wrong" });
            }
        }
        let wishCount = null;
        if (req.session.user) {
            try {
                wishCount = await userHelpers.getWishCount(req.session.user._id);
            } catch (error) {
                console.log("Error: ", error);
                res.status(500).render("user/error", { message: "Something went wrong" });
            }
        }
        let products = await productHelpers.getAllProducts();
        let banner = await adminHelpers.getAllBanner();

        res.render("user/home", {
            products,
            logIn,
            cartCount,
            banner,
            wishCount,
        });
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).render("user/error", { message: "Something went wrong" });
    }
};

/* ---------------------------------------  User Signup  --------------------------------------------------*/
let userSignup = async (req, res) => {
    try {
        let banner = await adminHelpers.getAllBanner();
        res.render("user/userSignup", { banner });
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).render("user/error", { message: "Something went wrong" });
    }
};

/* ---------------------------------------post method User Signup------------------------------------------*/
let userSignupPost = (req, res) => {
    userHelpers.doSignup(req.body).then((response) => {
        res.redirect('/userlogin')
    })

}
/* ---------------------------------------End post method User Signup--------------------------------------*/
/* ---------------------------------------End User Signup--------------------------------------------------*/

/* ---------------------------------------User Login-------------------------------------------------------*/
let userLogin = async (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/')
    } else {
        let banner = await adminHelpers.getAllBanner()
        res.render('user/userLogin',{banner})
    }

}
/* ---------------------------------------post method User Login------------------------------------------*/
let userLoginPost = (req, res) => {
    userHelpers.doLogin(req.body).then((response) => {
        if (response.status) {
            if (response.user.signupstatus) {
                res.redirect('/userlogin')
            } else {
                req.session.loggedIn = true
                req.session.user = response.user
                res.redirect('/')
            }

        } else {
            res.redirect('/userlogin')
        }
    })
}
/* ---------------------------------------End post method User Login--------------------------------------*/
let userLogout = (req, res) => {
    req.session.destroy()
    res.redirect('/userlogin')
}
/* ---------------------------------------End User Login--------------------------------------------------*/

/* ---------------------------------------Single Product View Page-----------------------------------------*/
let singleProduct = async (req, res) => {
    try{
        let logIn = req.session.user
    req.session.returnTo = req.originalUrl;
    let userId = req.session.user._id
    productId = req.query.id
    let cartCount = null
    if (req.session.user) {
        cartCount = await userHelpers.getCartCount(req.session.user._id)
    }
    let banner = await adminHelpers.getAllBanner()
    let products = await productHelpers.getAllProducts()
    await productHelpers.getProductDeatails(productId).then((response) => {
        res.render("user/singleProductView", { response, logIn, userId, banner, cartCount, products })
    })
    }catch(error){
        console.log("Error: ", error);
        res.status(500).render("user/error", { message: "Something went wrong" });
    }
}
/* ---------------------------------------End Single Product View Page-------------------------------------*/

/* ---------------------------------------Cart Management--------------------------------------------------*/
let cartView = async (req, res) => {
    let logIn = req.session.user
    let userId = req.session.user._id
    let products = await userHelpers.getAllCartProducts(userId)
    if(!products){
        res.render('user/cartEmpty')
    }
    let total =  await userHelpers.getTotalAmount(req.session.user._id)
    if(!total){
        res.render('user/cartEmpty')
    }
    let banner = await adminHelpers.getAllBanner()
    res.render('user/cart', { logIn, products,total,user:req.session.user._id, banner })
}

let addToCart = (req, res) => {
    let user = req.session.user
    let userId = req.session.user._id
    let productId = req.params.id
    userHelpers.addToCart(productId, userId).then(() => {
      res.json({status:true})
    })


}

let changeProductQuantity = (req, res, next) => {
    userHelpers.changeProductQuantity(req.body).then(async (response) => {
        response.total = await userHelpers.getTotalAmount(req.body.user)
        res.json(response)
    })
}

let deleteCartProduct = (req, res)=>{
    userHelpers.deleteCartProduct(req.body).then((response)=>{
        res.json({status:true})
    })
}
/* ---------------------------------------End Cart Management----------------------------------------------*/

/* ---------------------------------------Checkout Page----------------------------------------------------*/
let placeCheckout = async (req, res) => {
    let logIn = req.session.user
    let address = await userHelpers.getAllAddress(req.session.user._id)
    let total = await userHelpers.getTotalAmount(req.session.user._id)
    res.render('user/checkout', { total, logIn, address })
}

let placeCheckoutPost = async (req, res)=>{
    let products = await userHelpers.getCartProductList(req.body.userId)
    if(req.session.couponApplyAmount){
        var totalPrice = await req.session.couponApplyAmount
    }else{
       var totalPrice = await userHelpers.getTotalAmount(req.session.user._id)
    }
    userHelpers.checkoutOrder(req.body,products,totalPrice).then((response)=>{
        req.session.orderId = response
       if(req.body['paymentMethod'] ==='COD'){
        products.forEach(element =>{
           userHelpers.decrementStock(element)
        })
            res.json({codSuccess:true})
        }else if(req.body['paymentMethod']==='ONLINE'){
            products.forEach(element =>{
                userHelpers.decrementStock(element)
            })
           userHelpers.generateRazorpay(response,totalPrice).then((response)=>{
            response.online=true;
            res.json(response)
             })
        }
    
    })

}

let orderSucess = async(req, res)=>{
    let logIn = req.session.user
    orderId = req.session.orderId
    let orderDetails = await userHelpers.getOrderDetails(orderId)
    // if(req.session.couponApplyAmount){
    //     orderDetails.totalAmount=req.session.couponApplyAmount
    // }
    let productDetails = await userHelpers.getOrderProduct(orderId)
    let banner = await adminHelpers.getAllBanner()
    //let totalPrice = await userHelpers.getTotalAmount(req.session.user._id)
        res.render('user/orderSuccess',{logIn,orderDetails,productDetails,banner})
     
}

let myOrder = async(req, res)=>{
    try{
        let logIn = req.session.user
        let userId = req.session.user._id
        let orders = await userHelpers.getAllOrders(userId)
            res.render('user/myOrder',{logIn, orders })
    }catch(error){
        let logIn = req.session.user
        console.log("Error: ", error);
        res.status(500).render("user/error",{ message: "please login or signup",logIn});
    }
    
}

let verifyPayment = (req, res)=>{
    userHelpers.verifyPayment(req.body).then((response)=>{
        userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
            res.json({status:true})
        })
    }).catch((err)=>{
        res.json({status:'Payment failed'})
    })
}
/* ---------------------------------------End Checkout page------------------------------------------------*/

/* ---------------------------------------Otp Login--------------------------------------------------------*/

let otpLogin = async (req, res)=>{
    let banner = await adminHelpers.getAllBanner()
    res.render('user/otpLogin', { banner })
}
let otpSignData
let otpLoginPost = async (req, res)=>{
    await userHelpers.otpLogin(req.body).then((response)=>{
        if(response.status){
            otpSignData = response.user
                res.redirect('/otpconfirm')
           }else{
            res.redirect('/otplogin')
           }
    })
   
}

let otpConfirm = async (req, res)=>{
    let banner = await adminHelpers.getAllBanner()
    res.render('user/otpLoginConfirm', { banner })
}

let otpConfirmPost = (req, res) => {
    userHelpers.otpConfirm(req.body, otpSignData).then((response) => {
        console.log(otpSignData,'nnnnnnnnnbbbbbbbbbb');
        if (response.status) {
            req.session.loggedIn = true;
            req.session.user = otpSignData
            res.redirect('/')
        } else {
            res.redirect('/otpconfirm')
        }
    })
}
/* ---------------------------------------End Otp Login----------------------------------------------------*/

/* ---------------------------------------User Profile-----------------------------------------------------*/
let UserProfile = async (req, res) => {
    try{
        let logIn = req.session.user
        let address = await userHelpers.getAllAddress(req.session.user._id)
        let banner = await adminHelpers.getAllBanner()
        res.render('user/userProfile', { banner, logIn, address })
    }catch(error){
         console.log("Error: ", error);
        res.status(500).render("user/error",{ message: "please login or signup"});
    }
   
}
/* ---------------------------------------End User Profile-------------------------------------------------*/

let addAddress = async (req, res)=>{
    let logIn = req.session.user
    console.log(logIn,'ggggggggggggggggg');
    let banner = await adminHelpers.getAllBanner()
    res.render('user/addAddress', { banner,logIn })
}

let addAddressPost = (req, res)=>{
    userHelpers.addAddress(req.body).then((response)=>{
        res.redirect('/userprofile')
    })
}

/* ---------------------------------------Order Mnangement-------------------------------------------------*/
let cancelOrder = async(req, res)=>{
 let proId = req.query.id
 await userHelpers.cancelOrder(proId)
    res.redirect('/myorder')

}

let shippedOrderCancel = (req, res)=>{
    let proId = req.query.id
     userHelpers.shippedOrderCancel(proId).then((response)=>{
        res.redirect('/myorder')

    })

}

let returnOrder = (req, res)=>{
    let productId = req.query.id
    userHelpers.returnOrder(productId)
    res.redirect('/myorder')
}
/* ---------------------------------------End Order Management---------------------------------------------*/

/* ---------------------------------------Coupon-----------------------------------------------------------*/
let applyCouponPost = async (req, res)=>{
    let user = req.session.user._id
    let logIn = req.session.user
    const date = new Date()
    let total =  await userHelpers.getTotalAmount(req.session.user._id)
   
        let couponResponse = await couponHelpers.applyCoupon(req.body,user,date,total,logIn)
        if(couponResponse.couponData){
            let discountAmount = (total * parseInt(couponResponse.couponData.couponPercentage))/100
            let couponApplyAmount =total - discountAmount
            couponResponse.discountAmount = Math.round(discountAmount)
            couponResponse.couponApplyAmount = Math.round(couponApplyAmount)
            req.session.couponApplyAmount = Math.round(couponApplyAmount)
            res.json(couponResponse)
        }else{
            res.json({error:true})
        } 
    
}
/* ---------------------------------------End Coupon-------------------------------------------------------*/

/* ---------------------------------------Forgot Password--------------------------------------------------*/
let forgotPassword = async(req, res)=>{
    let banner = await adminHelpers.getAllBanner()
    res.render('user/forgotpassword', { banner })
 }

let forgotPasswordConfirm = async(req,res)=>{
    userNumber = req.session.userNumber
    let banner = await adminHelpers.getAllBanner()
    res.render('user/forgotPasswordConfirm',{banner, userNumber})
}

let forgotPasswordPost = async (req, res)=>{
    req.session.userNumber = req.body
    userNumber = req.session.userNumber
    await userHelpers.forgotPassword(req.body).then((response)=>{
        if(response.status){
            res.redirect('/forgotPasswordConfirm')
       }else{
        res.redirect('/forgotpassword')
       }
    })
         
}

let forgotPasswordConfirmPost = (req, res)=>{
    userNumber = req.body.userId
    userHelpers.forgotPasswordConfirmPost(userNumber,req.body).then((response)=>{
        res.redirect('/userlogin')
    })
}
/* ---------------------------------------End Forgot Password----------------------------------------------*/

/* ---------------------------------------Shop Product-----------------------------------------------------*/
let shopProduct = async (req, res) => {
    logIn = req.session.user
    let cartCount = null
    if (req.session.user) {
        cartCount = await userHelpers.getCartCount(req.session.user._id)
    }
    let products = await productHelpers.getAllProducts()
    let count = 0
    products.forEach(products => {
        count++
    });
    let pageCount = await userHelpers.paginatorCount(count)
    products = await userHelpers.getTenProducts(req.query.id)

    if (req.query.minimum) {
        let minimum = req.query.minimum.slice(1)
        let maximum = req.query.maximum.slice(1)
        let arr = []
        products = await productHelpers.getAllProducts()

        products.forEach(product => {
            if (products.price >= minimum && products.price <= maximum) {
                arr.push(products)
            }
        });
        products = arr;
    }
    res.render('user/shopProduct', { logIn, products, cartCount, pageCount, count })
}
/* ---------------------------------------End Shop Product-----------------------------------------------------*/

/* ---------------------------------------WishList-------------------------------------------------------------*/
let wishList = async(req,res)=>{
    logIn = req.session.user
    let userId = req.session.user._id
    let wishCount = null
    if (req.session.user) {
        wishCount = await userHelpers.getWishCount(req.session.user._id)
    }
let wishProduct = await userHelpers.getAllWishlistProduct(userId)
res.render('user/wishList',{logIn, wishProduct, user:req.session.user._id})
}

let addTowishList = (req, res)=>{
    logIn = req.session.user
    userId = req.session.user._id
    productId = req.params.id
    userHelpers.addToWishlist(userId,productId)
    res.json({status:true})
}

let deleteWishProduct = (req, res)=>{
    userHelpers.deleteWishProduct(req.body)
    res.json({status:true})

}
/* ---------------------------------------End WishList---------------------------------------------------------*/


module.exports = {
    userHome,
    userLogin,
    userSignup,
    userSignupPost,
    userLoginPost,
    userLogout,
    singleProduct,
    cartView,
    addToCart,
    changeProductQuantity,
    placeCheckout,
    placeCheckoutPost,
    orderSucess,
    myOrder,
    deleteCartProduct,
    verifyPayment,
    otpLogin,
    otpLoginPost,
    otpConfirm,
    otpConfirmPost,
    UserProfile,
    addAddress,
    addAddressPost,
    cancelOrder,
    shippedOrderCancel,
    applyCouponPost,
    forgotPassword,
    forgotPasswordPost,
    forgotPasswordConfirm,
    forgotPasswordConfirmPost,
    returnOrder,
    shopProduct,
    wishList,
    addTowishList,
    deleteWishProduct,
}