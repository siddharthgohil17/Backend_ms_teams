import db  from '../config/dbconnection.js';
import { AssignmentAdd } from './sendmailService.js';


class Assignment {
    static addAssignment = async (req, res) => {
        const { teacher_id, assignment_name, assignment_description, assigned_date, due_date } = req.body;
      
        if (!teacher_id || !assignment_name) {
          res.status(400).json({ status: 'failed', message: 'Teacher ID and Assignment Name are required' });
          return;
        }
      
        try {
          const [teacherResults] = await db.query('SELECT * FROM users WHERE user_id = ? AND role = "teacher"', [teacher_id]);
      
          if (teacherResults.length === 0) {
            res.status(404).json({ status: 'failed', message: 'Teacher ID does not exist or is not a teacher' });
            return;
          }
      
          const currentDate = new Date(); // Get current date in 'YYYY-MM-DD' format
          const [insertResult] = await db.query('INSERT INTO assignments (teacher_id, assignment_name, assignment_description, assigned_date, due_date) VALUES (?, ?, ?, ?, ?)', [teacher_id, assignment_name, assignment_description, assigned_date, due_date]);
      
          const [students] = await db.query('SELECT * FROM users WHERE role = "student"');
      
          for (const student of students) {
            try {
              AssignmentAdd(student.email, assignment_name, assignment_description, assigned_date, due_date);
            } catch (error) {
              console.error("Failed to send assignment email:", error);
            }
          }
      
          res.status(201).json({
            status: 'success',
            message: 'Assignment added successfully',
          });
        } catch (error) {
          console.error('Error:', error);
          res.status(500).json({ status: 'failed', message: 'Internal server error' });
        }
      };
      
      static deleteAssignment = async (req, res) => {
        const { assignment_id, teacher_id } = req.body;
    
        if (!assignment_id || !teacher_id) {
            res.status(400).json({ status: 'failed', message: 'Assignment ID and Teacher ID are required for deletion' });
            return;
        }
    
        try {
            const verifyOwnershipQuery = 'SELECT * FROM assignments WHERE assignment_id = ?';
            const [verifyResult] = await db.query(verifyOwnershipQuery, [assignment_id]);
    
            if (verifyResult.length === 0) {
                res.status(404).json({ status: 'failed', message: 'Assignment ID not found' });
                return;
            }
    
            if (verifyResult[0].teacher_id !== teacher_id) {
                res.status(403).json({ status: 'failed', message: 'Unauthorized. You are not the owner of this assignment.' });
                return;
            }
    
            const deleteAssignmentQuery = 'DELETE FROM assignments WHERE assignment_id = ?';
            const [result] = await db.query(deleteAssignmentQuery, [assignment_id]);
    
            res.status(200).json({
                status: 'success',
                message: 'Assignment deleted successfully',
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ status: 'failed', message: 'Internal server error' });
        }
    };
    

    static updateAssignment = async (req, res) => {
        const { assignment_id, teacher_id, assignment_name, assignment_description, assigned_date, due_date } = req.body;
    
        if (!assignment_id || !teacher_id) {
            res.status(400).json({ status: 'failed', message: 'Assignment ID and Teacher ID are required' });
            return;
        }
    
        try {
            // Verify ownership of the assignment
            const [verifyResult] = await db.query('SELECT * FROM assignments WHERE assignment_id = ? AND teacher_id = ?', [assignment_id, teacher_id]);
            
            if (verifyResult.length === 0) {
                res.status(403).json({ status: 'failed', message: 'Unauthorized. You are not the owner of this assignment.' });
                return;
            }
    
            const updateFields = [];
            const queryParams = [];
    
            if (assignment_name) {
                updateFields.push('assignment_name = ?');
                queryParams.push(assignment_name);
            }
    
            if (assignment_description) {
                updateFields.push('assignment_description = ?');
                queryParams.push(assignment_description);
            }
    
            if (assigned_date) {
                updateFields.push('assigned_date = ?');
                queryParams.push(assigned_date);
            }
    
            if (due_date) {
                updateFields.push('due_date = ?');
                queryParams.push(due_date);
            }
    
            if (updateFields.length === 0) {
                res.status(400).json({ status: 'failed', message: 'No fields to update were provided' });
                return;
            }
    
            queryParams.push(assignment_id);
            const updateAssignmentQuery = `UPDATE assignments SET ${updateFields.join(', ')} WHERE assignment_id = ?`;
    
            const [updateResult] = await db.query(updateAssignmentQuery, queryParams);
    
            if (updateResult.affectedRows === 0) {
                res.status(500).json({ status: 'failed', message: 'Unable to update the assignment' });
                return;
            }
    
            res.status(200).json({
                status: 'success',
                message: 'Assignment updated successfully',
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ status: 'failed', message: 'Internal server error' });
        }
    };
    
    
    static filterAssignment = async (req, res) => {
        const { teacher_id } = req.params;
        const { assignment_id, due_date } = req.query;
    
        if (!teacher_id) {
            res.status(400).json({ status: 'failed', message: 'Teacher ID is required' });
            return;
        }
    
        try {
            let query = 'SELECT * FROM assignments WHERE teacher_id = ?';
            const queryArgs = [teacher_id];
    
            if (due_date) {
                query += ' AND due_date = ?';
                queryArgs.push(due_date);
            }
    
            if (assignment_id) {
                query += ' AND assignment_id = ?';
                queryArgs.push(assignment_id);
            }
    
            const [result] = await db.query(query, queryArgs);
    
            if (result.length === 0) {
                res.status(404).json({ status: 'failed', message: 'No assignments found for the given criteria' });
                return;
            }
    
            res.status(200).json({
                status: 'success',
                message: 'Filtered assignments fetched successfully',
                data: result,
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ status: 'failed', message: 'Error filtering assignments' });
        }
    };
        
}

export default Assignment;
