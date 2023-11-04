import db from '../config/dbconnection.js';
import { sendAssignmentDueEmail } from '../service/sendmailService.js';

const checkAssignmentsDueToday = async () => {
 const today = new Date().toISOString().split('T')[0];
  
  
    try {
      const [assignmentResults] = await db.query('SELECT * FROM assignments WHERE due_date = ?', [today]);
      for (const assignment of assignmentResults) {
        // console.log(assignment);
        const { assignment_id, assignment_name, assignment_description } = assignment;
  
        const [submissions] = await db.query('SELECT  student_id FROM submission WHERE assignment_id = ?', [assignment_id]);
  
        const [studentsWithoutSubmission] = await db.query(`
          SELECT u.email 
          FROM users u
          WHERE u.role = 'student' 
          AND NOT EXISTS (
            SELECT * FROM submission s 
            WHERE s.assignment_id = ? AND s.student_id = u.user_id
          )
        `, [assignment_id]);
  
        const studentsEmails = studentsWithoutSubmission.map(({ email }) => email);
  
        for (const email of studentsEmails) {
          try {
            await sendAssignmentDueEmail(email, assignment_name, assignment_description);
          } catch (error) {
            console.error('Failed to send assignment due email:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  export default checkAssignmentsDueToday;