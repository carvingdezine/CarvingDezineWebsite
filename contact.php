<?php
// get posted data into local variables
$EmailFrom = "$name";
$EmailTo = "carvingdezine@gmail.com";
$Subject = "Website Enquiry";


//Customer Information
$name = Trim(stripslashes($_POST['name'])); 
$email = Trim(stripslashes($_POST['email'])); 
$phone = Trim(stripslashes($_POST['phone']));
$message = Trim(stripslashes($_POST['message'])); 

// prepare email body text
$Body = "Website Enquiry<br>";
$Body .= "Name: ";
$Body .= $name;
$Body .= "<br><br>";
$Body .= "Email: ";
$Body .= $email;
$Body .= "<br><br>";
$Body .= "Phone: ";
$Body .= $phone;
$Body .= "<br><br>";
$Body .= "Message: ";
$Body .= $message;


$header = "From: $name" . "\r\n";



// send email 
$success = mail ($EmailTo,$Subject,$Body,$header);

// redirect to success page 
if ($success){
  print "<meta http-equiv=\"refresh\" content=\"0;URL=work.html\">";
}
else{
  print "<meta http-equiv=\"refresh\" content=\"0;URL=error.html\">";
}
?>