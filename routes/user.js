var env = require('dotenv').config();
var express = require('express');
var router = express.Router();
var userControllers = require('../Controllers/userController')


/* ---------------------------------------GET home page. --------------------------------------------------*/
router.get('/', userControllers.userHome);
/* ---------------------------------------End home page. --------------------------------------------------*/

/* ---------------------------------------  User Signup  --------------------------------------------------*/
router.get('/usersignup',userControllers.userSignup)
/* ---------------------------------------post method User Signup------------------------------------------*/
router.post('/usersignup',userControllers.userSignupPost)
/* ---------------------------------------End User Signup--------------------------------------------------*/

/* ---------------------------------------User Login-------------------------------------------------------*/
router.get('/userlogin',userControllers.userLogin)

router.post('/userlogin',userControllers.userLoginPost)

router.get('/userlogout',userControllers.userLogout)
/* ---------------------------------------End User Login---------------------------------------------------*/

/* ---------------------------------------Single Product View Page-----------------------------------------*/
router.get('/singleproduct', userControllers.singleProduct)
/* ---------------------------------------End Single Product View Page-------------------------------------*/


/* ---------------------------------------Cart management--------------------------------------------------*/
router.get('/cart', userControllers.cartView)

router.get('/addtocart/:id', userControllers.addToCart)

router.post('/changeproductquantity',userControllers.changeProductQuantity)

router.post('/deletecartproduct',userControllers.deleteCartProduct)
/* ---------------------------------------End Cart management----------------------------------------------*/

/* ---------------------------------------Checkout Page----------------------------------------------*/
router.get('/success', userControllers.orderSucess)

router.get('/checkout',userControllers.placeCheckout)

router.post('/checkout',userControllers.placeCheckoutPost)

router.post('/verifypayment',userControllers.verifyPayment)
/* ---------------------------------------End Checkout Page------------------------------------------*/

/* ---------------------------------------Otp Login--------------------------------------------------*/
router.get('/otplogin',userControllers.otpLogin)

router.post('/otplogin',userControllers.otpLoginPost)

router.get('/otpconfirm',userControllers.otpConfirm)

router.post('/otpconfirm',userControllers.otpConfirmPost)
/* ---------------------------------------End Otp Login----------------------------------------------*/

/* ---------------------------------------User Profile----------------------------------------------*/
router.get('/userprofile',userControllers.UserProfile)
/* ---------------------------------------End user Profile------------------------------------------*/

/* ---------------------------------------Add Address----------------------------------------------*/
router.get('/addaddress',userControllers.addAddress)

router.post('/addaddress',userControllers.addAddressPost)
/* ---------------------------------------End Add Address------------------------------------------*/

/* ---------------------------------------My orders management------------------------------------------*/
router.get('/myorder',userControllers.myOrder)

router.get('/cancelorder',userControllers.cancelOrder)

router.get('/shippedordercancel',userControllers.shippedOrderCancel)

router.get('/returnorder',userControllers.returnOrder)
/* ---------------------------------------End My orders management--------------------------------------*/

/* ---------------------------------------Coupon--------------------------------------------------------*/
router.post('/applycoupon',userControllers.applyCouponPost)
/* ---------------------------------------End Coupon----------------------------------------------------*/

/* ---------------------------------------Forgot Password----------------------------------------------------*/
router.get('/forgotpassword',userControllers.forgotPassword)

router.post('/forgotpassword',userControllers.forgotPasswordPost)

router.get('/forgotpasswordconfirm',userControllers.forgotPasswordConfirm)

router.post('/forgotpasswordconfirm',userControllers.forgotPasswordConfirmPost)
/* ---------------------------------------End Forgot Password------------------------------------------------*/

/* ---------------------------------------Shopping Page------------------------------------------------------*/
router.get('/shopproduct',userControllers.shopProduct)
/* ---------------------------------------End Shopping Page--------------------------------------------------*/

/* ---------------------------------------WishList-----------------------------------------------------------*/
router.get('/wishlist',userControllers.wishList)

router.get('/addTowishlist/:id',userControllers.addTowishList)

router.post('/deletewishproduct',userControllers.deleteWishProduct)

router.get('/addToCartwishlist/:id', userControllers.addToCartWish)
/* ---------------------------------------End WishList-------------------------------------------------------*/








module.exports = router;
