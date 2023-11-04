
import transporter from "../config/transportmail.js";


export async function sendWelcomeEmail(email) {
console.log(email);
  try {
    let info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to:email,
      subject: "Welcome to the Play Power classroom",
    });
    // console.log("email sent successfully");
    return info;
  } catch (error) {
    // console.error("Error sending welcome email:", error);
    throw error;
  }
}

export async function AssignmentAdd(email, assignmentName, assignmentDescription, assignedDate, dueDate) {
    try {
      let info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "New Assignment Added",
        html: `<p>New assignment details:</p>
               <p>Assignment Name: ${assignmentName}</p>
               <p>Assignment Description: ${assignmentDescription}</p>
               <p>Assigned Date: ${assignedDate}</p>
               <p>Due Date: ${dueDate}</p>`
      });
      // console.log("Assignment added email sent successfully");
      return info;
    } catch (error) {
      // console.error("Error sending assignment email:", error);
      throw error;
    }
  }
  


  export async function sendGradeUpdateEmail(email, assignmentName, marks, teacherId) {
    try {
      let info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Assignment Grade Updated",
        html: `<p>Assignment details:</p>
               <p>Assignment Name: ${assignmentName}</p>
               <p>Your marks have been updated to: ${marks}</p>
               <p>teacher ID: ${teacherId}</p>`
      });
      // console.log("Grade update email sent successfully");
      return info;
    } catch (error) {
      // console.error("Error sending grade update email:", error);
      throw error;
    }
  }
  
  

export async function sendAssignmentDueEmail(email, assignmentName, assignmentDescription) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Assignment Due Today',
      html: `
        <p>Hello,</p>
        <p>This is a reminder that your assignment "${assignmentName}" is due today.</p>
        <p>Assignment Description: ${assignmentDescription}</p>
        <p>Thank you.</p>
      `,
    });

    // console.log('Assignment due email sent successfully:', info);
    return info;
  } catch (error) {
    console.error('Error sending assignment due email:', error);
    throw error;
  }
}