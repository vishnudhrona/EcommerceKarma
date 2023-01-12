var express = require('express');
var router = new express.Router();
var productHelpers = require('../Helpers/productHelpers')
var categoryHelpers = require('../Helpers/categoryHelpers')
var userHelpers = require('../Helpers/userHelpers')
var adminHelpers = require('../Helpers/adminHelpers')

const credential = {
    email : 'vishnuvaliyaveetil92@gmail.com',
    password : '1234'
}

let errMessage

/* ---------------------------------------Admin Login page--------------------------------------------------*/
let adminLogin = (req,res)=>{
    if(req.session.adminLoggedIn){
        res.redirect('/admin/adminhome')
    }else{
        res.render('admin/adminLogin',{layout:null,errMessage})
        errMessage = ""
    }
    
}
/* ------------------Admin Login post page---------------------------*/
let adminLoginPost = (req, res) => {
    let userId = req.body.email
    if (req.body.email == credential.email && req.body.password == credential.password) {
        req.session.adminLoggedIn = true
        res.redirect('/admin/adminhome')
    }else{
        errMessage = "Invalid email or password"
        res.redirect('/admin')
    }

}
/* ------------------End Admin Login post page-----------------------*/
let adminLogout = (req, res)=>{
    req.session.destroy()
    res.redirect('/admin')
}
/* ---------------------------------------End Admin Login page--------------------------------------------------*/

/* ---------------------------------------Admin Home page--------------------------------------------------*/
let adminHome = async(req, res)=>{
    let daily=await adminHelpers.getDailySalesGraph();
    let monthly=await adminHelpers.getMonthlySalesGraph();
    let yearly=await adminHelpers.getYearlySalesGraph();
    res.render('admin/adminHome',{layout:'adminLayout', daily,monthly,yearly})
}
/* ---------------------------------------End Admin Home page--------------------------------------------------*/

/* ---------------------------------------Admin Productmanagement----------------------------------------------*/
let productManagement = (req, res) => {
    productHelpers.getAllProducts().then(async(products)=>{
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

        products.forEach(products => {
            
                arr.push(products)
            
        });
        products = arr;
    }
        res.render('admin/productManagement',{layout:'adminLayout',products, pageCount, count})
    })
    
}

let addProduct = (req, res)=>{
    categoryHelpers.getAllCategory().then((category)=>{
        res.render('admin/addProduct',{layout:'adminLayout',category})

    })

    
}

let addProductPost = async(req, res)=>{
    req.body.price = parseInt(req.body.price)
    req.body.offerprice = parseInt(req.body.offerprice)
    req.body.stock = parseInt(req.body.stock)
    req.body.image1 = req.files.image1[0].filename
      req.body.image2 = req.files.image2[0].filename
      req.body.image3 = req.files.image3[0].filename
      req.body.image4 = req.files.image4[0].filename
await productHelpers.addProduct(req.body).then((id)=>{
            res.redirect('/admin/productmanagement')
    
})

}

let deleteProduct = (req, res)=>{
    let productId = req.params.id
    productHelpers.deleteProduct(productId).then((response)=>{})
    res.redirect('/admin/productmanagement')
}

let editProduct =async (req, res)=>{
     let  productId = req.query.id
     let products=await productHelpers.getProductDeatails(productId)
     let category=await categoryHelpers.getAllCategory()
     
        res.render('admin/editProduct',{layout:'adminLayout',products,category})
     
    
}

let editProductPost = async(req, res)=>{
    req.body.price = parseInt(req.body.price)
    let proId = req.query.id 
    console.log(proId,'kkkkkkkkooooo');
    let proBody = req.body
    if (req.files.image1 == null) {
        Image1 = await productHelpers.fetchImage1(proId)
    } else {
        Image1 = req.files.image1[0].filename
    }
    if (req.files.image2 == null) {
        Image2 = await productHelpers.fetchImage2(proId)
    } else {
        Image2 = req.files.image2[0].filename
    }
    if (req.files.image3 == null) {
        Image3 = await productHelpers.fetchImage3(proId)
    } else {
        Image3 = req.files.image3[0].filename
    }
    if (req.files.image4 == null) {
        Image4 = await productHelpers.fetchImage4(proId)
    } else {
        Image4 = req.files.image4[0].filename
    }
    req.body.image1 = Image1
    req.body.image2 = Image2
    req.body.image3 = Image3
    req.body.image4 = Image4
    productHelpers.updateProduct(proId,proBody).then((response)=>{
            res.redirect('/admin/productmanagement')
    })
}
/* ---------------------------------------End Admin Productmanagement----------------------------------------------*/

/* ---------------------------------------Admin Categorymanagement-------------------------------------------------*/
let categoryManagement = (req, res)=>{
    categoryHelpers.getAllCategory().then((products)=>{
        res.render('admin/categoryManagement',{layout:'adminLayout',products})
    })
    
}

let addCategory = (req, res)=>{
res.render('admin/addCategory',{layout:'adminLayout'})
}

let addCategoryPost = async(req, res)=>{
    req.body.categoryname = req.body.categoryname.toUpperCase()
    let category = await categoryHelpers.getACategory(req.body.categoryname)
    if(category){
        res.redirect('/admin/addcategory')
    }else{
        let categoryBody = req.body
        categoryHelpers.addCategory(categoryBody).then(()=>{
            res.redirect('/admin/categorymanagement')
        })
    }
    
}

let deleteCategory = (req, res)=>{
    let catId = req.query.id
    categoryHelpers.deleteCategory(catId).then(()=>{
        res.redirect('/admin/categorymanagement')
    })
}

let editCategory = (req, res)=>{
    let catId = req.query.id
    categoryHelpers.getCategory(catId).then((response)=>{
        res.render('admin/editCategory',{layout:'adminLayout',response})
    })
}

let editCategorytPost = (req,res)=>{
    let catId = req.query.id
    let catBody = req.body
    categoryHelpers.updateCategory(catId,catBody).then((response)=>{
        res.redirect('/admin/categorymanagement')
    })
}

/* ---------------------------------------End Admin Categorymanagement----------------------------------------------*/

/* ---------------------------------------Admin Usermanagement------------------------------------------------------*/
let userManagement = (req, res)=>{
    userHelpers.getAllUsers().then(async(user)=>{
        let count = 0
        user.forEach(user => {
        count++
    });
    let pageCount = await adminHelpers.paginatorCount(count)
    user = await adminHelpers.getTenUsers(req.query.id)

    if (req.query.minimum) {
        let minimum = req.query.minimum.slice(1)
        let maximum = req.query.maximum.slice(1)
        let arr = []
        user = await userHelpers.getAllUsers()

        user.forEach(user => {
            
                arr.push(user)
            
        });
        user = arr;
    }
        res.render('admin/userManagement',{layout:'adminLayout',user, pageCount, count})
    })
    

}

let blockUser = (req, res)=>{
    let Id=req.query.id
    userHelpers.blockUser(Id).then(()=>{
        res.redirect('/admin/usermanagement')
    })

}

let unblockUser = (req, res) => {
    userId = req.query.id
    userHelpers.unblockUser(userId).then(() => {
        res.redirect('/admin/usermanagement')
    })
}
/* ---------------------------------------End Admin Usermanagement------------------------------------------------------*/

/* ---------------------------------------Banner management--------------------------------------------------*/
let bannerManagement = async (req, res)=>{
    let banner = await adminHelpers.getAllBanner()
res.render('admin/bannerManagement', { layout: 'adminLayout',banner })
}
let addBanner = (req, res) => {
        res.render('admin/addBanner', { layout: 'adminLayout' })
}

let addBannerPost = (req, res) => {
    adminHelpers.addBanner(req.body).then((proId) => {
        let image = req.files.image
        image.mv('./public/bannerImage/'+proId+'.png',(err,done)=>{
            if(!err){
                res.redirect('/admin/addbanner')
            }else{
                console.log(err);
            }
    
        })
    })
}

let blockBanner = (req, res)=>{
    let bannerId = req.query.id
    adminHelpers.blockBanner(bannerId).then(()=>{
        res.redirect('/admin/bannermanagement')

    })
}

let unblockBanner = (req, res)=>{
    let banId = req.query.id
    adminHelpers.ublockBanner(banId).then(()=>{
        res.redirect('/admin/bannermanagement')

    })

}
/* ---------------------------------------End Banner management-----------------------------------------------*/

/* ---------------------------------------Order management----------------------------------------------------*/
let orderManagement = async(req, res) => {
    let allOrder = await adminHelpers.getAllorderDetails()
    let count = 0
    allOrder.forEach(allOrder => {
        count++
    });
    let pageCount = await adminHelpers.paginatorCount(count)
    allOrder = await adminHelpers.getTenOrders(req.query.id)

    if (req.query.minimum) {
        let minimum = req.query.minimum.slice(1)
        let maximum = req.query.maximum.slice(1)
        let arr = []
        allOrder = await adminHelpers.getAllorderDetails()

        allOrder.forEach(allOrder => {
            
                arr.push(allOrder)
            
        });
        allOrder = arr;
    }
    res.render('admin/orderManagement', { layout: 'adminLayout',allOrder, pageCount, count })
}

let viewProduct = async (req, res)=>{
    ordId = req.query.id
    let oneProduct = await adminHelpers.getOneProduct(ordId)
    res.render('admin/productView',{ layout: 'adminLayout', oneProduct })
}

let productShipped = (req, res)=>{
    let proId = req.query.id
    adminHelpers.productShipped(proId)
    res.redirect('/admin/ordermanagement')
}

let productDelivered = (req, res)=>{
    adminHelpers.productDelivered(req.query.id)
    res.redirect('/admin/ordermanagement')
}

let productCancel = (req, res)=>{
adminHelpers.productCancel(req.query.id)
res.redirect('/admin/ordermanagement')
}
/* ---------------------------------------End order management------------------------------------------------*/

/* ---------------------------------------Coupon management------------------------------------------------*/
let couponManagement = async (req, res)=>{
    let logIn = req.session.user
    let coupon = await adminHelpers.getAllCoupon()
    let count = 0
    coupon.forEach(coupon => {
        count++
    });
    let pageCount = await adminHelpers.paginatorCount(count)
    coupon = await adminHelpers.getTenProducts(req.query.id)

    if (req.query.minimum) {
        let minimum = req.query.minimum.slice(1)
        let maximum = req.query.maximum.slice(1)
        let arr = []
        coupon = await adminHelpers.getAllCoupon()

        coupon.forEach(coupon => {
            
                arr.push(coupon)
            
        });
        coupon = arr;
    }
    res.render('admin/couponManagement',{ layout:'adminLayout', coupon , logIn, pageCount, count })
}

let addCoupon = async(req, res) => {
   let coupon = await adminHelpers.addCoupon(req.body)
        res.redirect('/admin/couponmanagement')

} 
/* ---------------------------------------End Coupon management------------------------------------------------*/

module.exports = {
    adminLogin,
    adminHome,
    adminLoginPost,
    adminLogout,
    productManagement,
    addProduct,
    addProductPost,
    deleteProduct,
    editProduct,
    editProductPost,
    categoryManagement,
    addCategory,
    addCategoryPost,
    deleteCategory,
    editCategory,
    editCategorytPost,
    userManagement,
    blockUser,
    unblockUser,
    bannerManagement,
    addBanner,
    addBannerPost,
    blockBanner,
    unblockBanner,
    orderManagement,
    viewProduct,
    productShipped,
    productDelivered,
    productCancel,
    couponManagement,
    addCoupon,
}