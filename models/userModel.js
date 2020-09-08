const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
mongoose.set('useFindAndModify', false);

const userSchema = new mongoose.Schema({
  _id: Number,
  college_id: {type: String, required: true},
  college_name: {type: String, required: true},
  address: {type: String, required: true},
  city: {type: String, required: true},
  state: {type: String, required: true},
  country: {type: String, required: true},
  pincode: {type: Number, required: true},
  auth_person : 
  {
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    email: { type: String, required: true, unique: true },
    phone_number: {type: Number, required: true, unique: true},
    password: { type: String, required: true, minlength: 5 }
  },
  staff: [{ _id: Number, staff_id: {type: String}, name: String, email: {type: String, unique: true}, phone_number: {type: Number, unique: true} , password: { type: String, minlength: 5 }}],
  students: [{ _id: Number, reg_no: {type: String}, name: String, email: {type: String, unique: true}, year: Number, phone_number: {type: Number, unique: true} }],
  assessments: [
    {
      _id: Number,
      exam_info:
      {
          exam_title: {type: String, required: true},
          category: {type: String, required: true},
          description: {type: String, required: true},
          instructions: {type: String, required: true},
          proctored: {type: Boolean, required: true},
          job: {type: String, required: true},
          exam_duration: {type: String, required: true},
          total_marks: {type: String, required: true},
          negative_marks: {type: Boolean, required: true}
      },
      candidate_info:
      {
        name: {type: String, required: true},
        email: {type: String, required: true},
        phone_number: {type: Number, required: true},
        comp_name: {type: String, required: true},
        location: {type: String, required: true}
      },
      questions: [{
        _id: Number,
        question: {type: String, required: true},
        option1: {type: String, required: true},
        option2: {type: String, required: true},
        option3: {type: String, required: true},
        option4: {type: String, required: true},
        hint: {type: String, required: true},
        mark: {type: Number, required: true},
        solution: {type: String, required: true}
      }],
      coding_questions: [{
        _id: Number,
        question: {type: String, required: true},
        question_description: {type: String, required: true},
        testcase1Inp: {type: String, required: true},
        testcase1Op: {type: String, required: true},
        testcase2Inp: {type: String, required: true},
        testcase2Op: {type: String, required: true},
        testcase3Inp: {type: String, required: true},
        testcase3Op: {type: String, required: true},
        testcase4Inp:{type: String, required: true},
        testcase4Op: {type: String, required: true},
        hint: {type: String, required: true},
        mark: {type: Number, required: true},
        solution: {type: String, required: true}
      }]
    }
  ]
}, { _id: false });
userSchema.plugin(AutoIncrement);

module.exports = User = mongoose.model("user", userSchema);
