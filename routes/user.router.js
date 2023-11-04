import UserController from "../service/userService.js";
import express from 'express';
import teacherAuth from '../middlewares/teacherAuth.js'
import Assignment from "../service/assignmatesService.js";
import Submission from "../service/submitAssignmentService.js";
import SearchId from "../utils/SearchId.js";
import schedule from 'node-schedule'
import checkAssignmentsDueToday from "../utils/DueDateAlert.js";
const router = express.Router();



router.use('/assign_assignment',teacherAuth);

//public
router.get('/home', (req, res) => {
    res.send('hiii');
});

//User registration route
router.post('/register', UserController.userRegistration);
router.post('/login',UserController.UserLogin);

//Assignment 
router.post('/submitAssignment',Submission.submitAssignment);
router.post('/withdrawAssignment',Submission.withdrawAssignment);
router.post('/updateMarks',Submission.updateMarks);
router.post('/updateAssignmentDetails',Assignment.updateAssignment);
router.post('/FindId',SearchId);

//Filter Route
router.get('/getFilteredSubmissions/:teacher_id/:assignment_id?/:student_id?',Submission.filter);
router.get('/getFilteredAssignment/:teacher_id/:assignment_id?',Assignment.filterAssignment);



//protected Assignement Route 
router.post('/assign_assignment',teacherAuth,Assignment.addAssignment);
router.post('/delete_assignment',teacherAuth,Assignment.deleteAssignment);


//send automatic email who not submitted yet assigment which due data is today
schedule.scheduleJob('0 0 */1 * *', () => {
    checkAssignmentsDueToday();
});

export default router;
