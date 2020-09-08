const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema({
  apti_questions: [{
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
  coding_mcq: [{
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
}, { _id: false });

module.exports = Admin = mongoose.model("admin", adminSchema);
