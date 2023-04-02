

function addToCart(productId){
    $.ajax({
        url:'/addtocart/'+productId,
        method:'get',
        success:(response)=>{
            
            if(response.status){
                
                let count = $('#cartCount').html()
                count = parseInt(count)+1
                $('#cartCount').html(count)
            }
            swal("Product Added!", "!", "success");
        }
    })
}

function changeQuantity(cartId,proId,userId,count){
    let quantity = parseInt(document.getElementById(proId).innerHTML)
    count = parseInt(count)
    
    $.ajax({
        url:'/changeproductquantity',
        data:{
            user:userId,
            cart:cartId,    
            product:proId,
            count:count,
            quantity:quantity
        },
        method:'post',
        success:(response)=>{            
            if(response.removeProduct){
                alert('Product Removed from cart')
                location.reload()
            }else{
               document.getElementById(proId).innerHTML =quantity+count
               document.getElementById('total').innerHTML =response.total
                
            }
            
        }
    })
}

$('#checkoutForm').submit((e)=>{
    console.log('checkedddddddddddddddd',e);
    e.preventDefault()
    e.stopImmediatePropagation()
    $.ajax({
        url:'/checkout',
        method:'post',
        data:$('#checkoutForm').serialize(),
        success:(response)=>{
            if(response.codSuccess){
                swal("Order Placed!", "Successfully!", "success");
                location.href="/success"
            }else if(response.online){
                razorpayPayment(response)
            }
        }
    })
    
function razorpayPayment(order){
    var options = {
        "key": "rzp_test_gFSzKrbiJVMqDa", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Vishnu Dhrona",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
        "handler": function (response) {

           verifyPayment(response,order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}
})

function verifyPayment(payment, order){
    $.ajax({
        url:'/verifypayment',
        data:{
            payment,
            order
        },
        method:'post',
        success:(response)=>{
            if(response.status){
                location.href = "/success"
            }else{
                alert('payment failed')
            }
        }
    })
}

function deleteCartProduct(cartId,productId){
    $.ajax({
        url:'/deletecartproduct/',
        data: {
            cart: cartId,
            product: productId
        },
        method:'post',
        success:(response)=>{
            alert("Product Removed ")

            location.reload()
            
        }
    })
}

function addToWishlist(productId){
    $.ajax({
        url:'/addTowishlist/'+productId,
        method:'get',
        success:(response)=>{
            
            if(response.status){
                
                let count = $('#wishcount').html()
                count = parseInt(count)+1
                $('#wishcount').html(count)
            }
            swal("Product Added!", "!", "success");
        }
    })
}

