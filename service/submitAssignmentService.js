import db  from '../config/dbconnection.js';
import { sendGradeUpdateEmail} from './sendmailService.js';
class Submission {
    static submitAssignment = async (req, res) => {
        const { assignment_id, student_id, submitted_content } = req.body;
      
        if (!student_id || !assignment_id || !submitted_content) {
          res.status(400).json({ status: 'failed', message: 'Student ID, Assignment ID, and Submitted Content are required' });
          return;
        }
      
        try {
          // Check if the student_id exists in the users table and has the 'student' role
          const [studentResults] = await db.query('SELECT * FROM users WHERE user_id = ? AND role = "student"', [student_id]);
      
          if (studentResults.length === 0) {
            res.status(404).json({ status: 'failed', message: 'Student ID not found or is not a student' });
            return;
          }
      
          const currentDate = new Date().toISOString().slice(0, 10); // Get current date in 'YYYY-MM-DD' format
      
          const [insertResult] = await db.query('INSERT INTO submission (assignment_id, student_id, submission_date, submitted_content) VALUES (?, ?, ?, ?)', [assignment_id, student_id, currentDate, submitted_content]);
      
          res.status(201).json({
            status: 'success',
            message: 'Assignment submitted successfully',
          });
        } catch (error) {
          console.error('Error:', error);
          res.status(500).json({ status: 'failed', message: 'Internal server error' });
        }
      };
      
      static withdrawAssignment = async (req, res) => {
        const { assignment_id, student_id } = req.body;
    
        if (!assignment_id || !student_id) {
            res.status(400).json({ status: 'failed', message: 'Assignment ID and Student ID are required' });
            return;
        }
    
        try {
            // Check if the student ID exists and is a student
            const [userResult] = await db.query('SELECT * FROM users WHERE user_id = ? AND role = "student"', [student_id]);
            if (userResult.length === 0) {
                res.status(404).json({ status: 'failed', message: 'Student ID does not exist or is not a student' });
                return;
            }
    
            // Check if the assignment ID exists
            const [assignResult] = await db.query('SELECT * FROM assignments WHERE assignment_id = ?', [assignment_id]);
            if (assignResult.length === 0) {
                res.status(404).json({ status: 'failed', message: 'Assignment ID does not exist' });
                return;
            }
    
            // Check if there is submitted content for the assignment
            const [checkResult] = await db.query('SELECT submitted_content FROM submission WHERE assignment_id = ? AND student_id = ?', [assignment_id, student_id]);
    
            if (checkResult.length === 0 || !checkResult[0].submitted_content) {
                res.status(400).json({ status: 'failed', message: 'Cannot withdraw. No content was submitted.' });
                return;
            }
    
            // Perform deletion of the submission
            const [deleteResult] = await db.query('DELETE FROM submission WHERE assignment_id = ? AND student_id = ?', [assignment_id, student_id]);
            if (!deleteResult.affectedRows) {
                res.status(500).json({ status: 'failed', message: 'Unable to withdraw the assignment' });
                return;
            }
    
            res.status(200).json({
                status: 'success',
                message: 'Assignment withdrawn successfully',
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ status: 'failed', message: 'Internal server error' });
        }
    };
    
    

    
    static filter = async (req, res) => {
        const { teacher_id, assignment_id, student_id } = req.params;
    
        if (!teacher_id) {
            res.status(400).json({ status: 'failed', message: 'Teacher ID is required' });
            return;
        }
    
        try {
            let query = 'SELECT * FROM submission WHERE assignment_id IN (SELECT assignment_id FROM assignments WHERE teacher_id = ?)';
            const queryArgs = [teacher_id];
    
            if (assignment_id && student_id) {
                query += ' AND assignment_id = ? AND student_id = ?';
                queryArgs.push(assignment_id, student_id);
            } else if (assignment_id) {
                query += ' AND assignment_id = ?';
                queryArgs.push(assignment_id);
            }
    
            const [result] = await db.query(query, queryArgs);
    
            if (result.length === 0) {
                res.status(404).json({ status: 'failed', message: 'No assignment records found for the given criteria' });
                return;
            }
    
            res.status(200).json({
                status: 'success',
                message: 'Assignment records fetched successfully',
                data: result,
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ status: 'failed', message: 'Internal server error' });
        }
    };
    

    static updateMarks = async (req, res) => {
        const { teacher_id, assignment_id, student_id, marks } = req.body;
      
        if (!teacher_id || !assignment_id || !student_id || !marks) {
          res.status(400).json({ status: 'failed', message: 'Teacher ID, Assignment ID, Student ID, and Marks are required' });
          return;
        }
      
        try {
          // Check submission details
          const [checkResult] = await db.query('SELECT * FROM submission WHERE assignment_id = ? AND student_id = ?', [assignment_id, student_id]);
          if (checkResult.length === 0) {
            res.status(404).json({ status: 'failed', message: 'Submission details not found for provided Assignment ID and Student ID' });
            return;
          }
      
          // Check ownership
          const [ownershipResult] = await db.query('SELECT * FROM assignments WHERE assignment_id = ? AND teacher_id = ?', [assignment_id, teacher_id]);
          if (ownershipResult.length === 0) {
            res.status(403).json({ status: 'failed', message: 'Unauthorized. You are not the owner of this assignment.' });
            return;
          }
      
          // Update marks
          const [updateResult] = await db.query('UPDATE submission SET marks = ? WHERE assignment_id = ? AND student_id = ?', [marks, assignment_id, student_id]);
      
          // Fetch assignment details
          const [assignmentResult] = await db.query('SELECT assignment_name FROM assignments WHERE assignment_id = ?', [assignment_id]);
          if (assignmentResult.length === 0) {
            res.status(500).json({ status: 'failed', message: 'Failed to retrieve assignment details' });
            return;
          }
      
          const { assignment_name } = assignmentResult[0];
      
          // Fetch student email
          const [emailResult] = await db.query('SELECT email FROM users WHERE user_id = ?', [student_id]);
          if (emailResult.length === 0) {
            res.status(500).json({ status: 'failed', message: 'Failed to retrieve student email' });
            return;
          }
      
          const studentEmail = emailResult[0].email;
      
          // Send grade update email
          await sendGradeUpdateEmail(studentEmail, assignment_name, marks, teacher_id);
          
          res.status(200).json({
            status: 'success',
            message: 'Marks updated successfully. Grade update email sent.',
          });
      
        } catch (error) {
          console.error('Error:', error);
          res.status(500).json({ status: 'failed', message: 'Internal server error' });
        }
      };
      

}

export default Submission;
