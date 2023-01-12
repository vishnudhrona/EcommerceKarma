var firstNameError = document.getElementById("fname-error");
var emailError = document.getElementById("email-error")
var passwordError = document.getElementById("password-error")
var passwordErrors = document.getElementById("passwords-error")
var phoneError = document.getElementById("number-error");
var submitError = document.getElementById("submit-error");
var priceError=document.getElementById("price-error")






function validateName() {
    
    var fname = document.getElementById("contactName").value;

    if (fname.length == 0) {
        firstNameError.innerHTML = 'First Name required';
        
        return false;
        
    }
    if (!fname.match(/(^[a-zA-Z][a-zA-Z\s]{0,20}[a-zA-Z]$)/)) {

        firstNameError.innerHTML = 'Invalid name';
        
        return false;
    }
    else {
        firstNameError.innerHTML = '';
        return true;
    }
   
}


function validateEmail() {
    var email = document.getElementById("contactEmail").value;
    if (email.length == 0) {
        emailError.innerHTML = "Email required";
        
        return false;
    }
    if (!email.match(/^[a-zA-Z0-9.!#$%&’+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)$/)) {

        emailError.innerHTML = 'Email Invalid';
        return false;

    }
    emailError.innerHTML = "";
    return true;
}

function validatePassword() {
    var password = document.getElementById("contactPassword").value;
    if (password.length == 0) {
        passwordError.innerHTML = "Password required";
        return false;
    }
    if (!password.match(/^\d{8}$/)) {

        passwordError.innerHTML = 'Only 8 digits';
        return false;

    }
    passwordError.innerHTML = "";
    return true;
}

function validatePhoneNumber() {
    var PhoneNumber = document.getElementById("contactNumber").value;
    if (PhoneNumber.length == 0) {
        phoneError.innerHTML = "Phone Number Required";
        return false;
    }
    if (!PhoneNumber.match(/^(\+\d{1,3}[- ]?)?\d{10}$/)) {
        phoneError.innerHTML = "Enter a valid Mobile Number";
        return false;
    }
    phoneError.innerHTML = "";
    return true;
}

function validateForm() {
    if (!validateName() || !validateEmail() || !validatePassword() || !validatePhoneNumber()) {

        submitError.innerHTML = 'Please fill the fields to submit';
        setTimeout(function () { submitError.style.display = 'none'; }, 4000)
        return false;
    }

}
function passwordcheck() {
    var pw1 = document.getElementById("contact-password").value;
    var pw2 = document.getElementById("conform-password").value;
    if (pw1 != pw2) {
        passwordErrors.innerHTML = 'Password Missmatching';
        return false;
    }
    if (pw2.length == 0) {
        passwordErrors.innerHTML = "conformation Required";
        return false;
    }
    else
    passwordErrors.innerHTML = "";
        return true;
}
function validateSignup() {
    
    if (!validateName() || !validateEmail() || !validatePassword()) {

        submitError.innerHTML = 'Please fill the fields to submit';
        setTimeout(function () { submitError.style.display = 'none'; }, 4000)
        return false;
    }

}
//new price needs to be less than old price//
function priceCheck(){
    var price1 = document.getElementById("newPrice").value;
    var price2 = document.getElementById("oldPrice").value;
    if (price1 >= price2) {
        priceError.innerHTML = 'old price needs to be greater';
        return false;
    }
    
    else
    priceError.innerHTML=''
        return true;
}