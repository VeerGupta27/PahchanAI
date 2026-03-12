import emailjs from "@emailjs/browser";

export const sendAlertEmail = (data) => {

  emailjs.send(
    "service_mwi1bfj",
    "template_xxxxx",
    {
      name: data.name,
      location: data.location,
      confidence: data.confidence,
      email: data.email
    },
    "public_key_xxxxx"
  )
  .then(() => {
    console.log("Email sent");
  })
  .catch((err) => {
    console.log("Email failed", err);
  });

};