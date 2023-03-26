const nodemailer=require('nodemailer')


let sentOtp=(email,otp)=>{
    return new Promise((resolve,reject)=>{
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", // SMTP server address (usually mail.your-domain.com)
        port: 465, // Port for SMTP (usually 465)
        secure: true,
        tls: { 
          rejectUnauthorized: false
        }, // Usually true if connecting to port 465
        auth: {
          user: "fabnasiyasck@gmail.com", // Your email address
          pass: "mgnhuboxtimleqib", // Password (for gmail, your app password)
        },
      });
  
           var mailOptions={
            from: "faafabin@gmail.com",
            to: email,
            subject: "SiGag's Email verification",
            html: `
            <h1>Verify Your Email For SiGag</h1>
              <h3>use this code to verify your email</h3>
              <h2>${otp}</h2>
            `,
          }
    
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log("email sent error ", error)
              reject(error)
            } else {
              console.log("email sent successfull")
              resolve(otp)
            }
          });
    
    })
}
module.exports=sentOtp;