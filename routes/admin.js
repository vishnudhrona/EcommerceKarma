var env = require('dotenv').config();
var express = require('express');
const app = require('../app');
var router = express.Router();
var adminController = require('../Controllers/adminController')
var productHelpers = require('../Helpers/productHelpers')
var adminHelpers = require('../Helpers/adminHelpers')
var multer = require('multer');
const saveImage = require('../middleware/multer');

const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/productImage");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
    }
  })
  const uploadMultiple = multer({ storage: multerStorage }).fields([{ name: 'image1', maxCount: 1 },
   { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }])

  //uploads banner img
  const multerStorageBanner = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/banner-images");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
    }
  })
  // const uploadBanner = multer({ storage: multerStorageBanner });

  const uploadSingleFile = multer({ storage: multerStorageBanner })


/* ---------------------------------------Admin Login page--------------------------------------------------*/
router.get('/',adminController.adminLogin)
/* ----------------------Admin Login Post page----------------------*/
router.post('/adminlogin',adminController.adminLoginPost)
/* ------------------End Admin Login page---------------------------*/

/* ---------------------------------------Admin home page-----------------------------------------------------*/
router.get('/adminhome', adminController.adminHome)

router.get('/adminlogout',adminController.adminLogout)
/* ---------------------------------------End Admin Home page--------------------------------------------------*/

/* ---------------------------------------Admin Productmanagement----------------------------------------------*/
router.get('/productmanagement',adminController.productManagement)

router.get('/addproduct',adminController.addProduct)

router.post('/addproduct',uploadMultiple,adminController.addProductPost)

router.get('/deleteproduct',adminController.deleteProduct)

router.get('/editproduct',adminController.editProduct)

router.post('/editproduct',uploadMultiple,adminController.editProductPost)
/* ---------------------------------------End Admin Productmanagement------------------------------------------*/

/* ---------------------------------------End Admin Categorymanagement-r-----------------------------------------*/
router.get('/categorymanagement',adminController.categoryManagement)

router.get('/addcategory',adminController.addCategory)

router.post('/addcategory',adminController.addCategoryPost)

router.get('/deletecategory',adminController.deleteCategory)

router.get('/editcategory',adminController.editCategory)

router.post('/editcategory',adminController.editCategorytPost)
/* ---------------------------------------End Admin Categorymanagement------------------------------------------*/


/* ---------------------------------------Admin Usermanagement--------------------------------------------------*/
router.get('/usermanagement',adminController.userManagement)

router.get('/block',adminController.blockUser)

router.get('/unblock',adminController.unblockUser)
/* ---------------------------------------Admin Usermanagement--------------------------------------------------*/

/* ---------------------------------------Banner management--------------------------------------------------*/
router.get('/bannermanagement',adminController.bannerManagement)

router.get('/addbanner', adminController.addBanner)

router.post('/addbanner',saveImage,adminController.addBannerPost)

router.get('/blockbanner',adminController.blockBanner)

router.get('/unblockbanner',adminController.unblockBanner)

/* ---------------------------------------End Banner management----------------------------------------------*/

/* ---------------------------------------Order management---------------------------------------------------*/
router.get('/ordermanagement',adminController.orderManagement)

router.get('/viewproduct',adminController.viewProduct)

router.get('/productshipped',adminController.productShipped)

router.get('/productdelivered',adminController.productDelivered)

router.get('/productcancel',adminController.productCancel)
/* ---------------------------------------End Order management-----------------------------------------------*/

/* ---------------------------------------Coupon Management-----------------------------------------------*/
router.get('/couponmanagement',adminController.couponManagement)

router.post('/addcoupon',adminController.addCoupon)

router.get('/deleteCoupon', adminController.deleteCoupon)

router.get('/editCoupon', adminController.editCouponGet)

router.post('/editCoupon', adminController.editCouponPost)
/* ---------------------------------------End Coupon Management-------------------------------------------*/





module.exports = router;
