const router = require("express").Router();
const User = require("../models/userModel");
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const { deleteOne } = require("../models/userModel");
const xlsxtojson = require("xlsx-to-json");
const multer = require("multer");
const upload = multer();
const fs = require("fs");
const { promisify } = require("util");
const { join } = require("path");
const pipeline = promisify(require("stream").pipeline);

router.post("/adminqns", async (req, res) => {
  try{
      let {  questions, coding_questions, category } = req.body;
      const newUser = await Admin.findOne({name: "Ashwath"});
      if(category.localeCompare("Aptitude")===0)
      {
        for(var i=0; i<questions.length; i++)
        { newUser.apti_questions.push(questions[i]); } 
      } 
      else if(category.localeCompare("Coding M.C.Qs")===0)
      {
        for(var i=0; i<questions.length; i++)
        { newUser.coding_mcq.push(questions[i]); } 
      }
      for(var i=0; i<coding_questions.length; i++)
      {
        newUser.coding_questions.push(coding_questions[i]);
      } 
      await newUser.save();
      res.json(newUser);
  }       
  catch (err) {
          res.status(500).json({ error: err.message });
        }
  
  });

  router.post("/adminQnList", async (req, res) => {
    try{
      let { category } = req.body;
      const AdminQnList = await Admin.findOne({name: "Ashwath"});

      if(category.localeCompare("Aptitude")===0)
      {res.json(AdminQnList.apti_questions);} 
      else if(category.localeCompare("Coding M.C.Qs")===0)
      {res.json(AdminQnList.coding_mcq);}
      else
      {res.json(AdminQnList.coding_questions);}
    }
    catch{
      res.status(500).json({ error: err.message });
    }
  })



router.post("/register", async (req, res) => {
try{
        let { college_name, address, city, state, country, pincode, first_name, last_name, email, phone_number, password, passwordCheck } = req.body;
  
    // validate
    if (!email || !password || !passwordCheck || !college_name || !address || !city || !state || !country || !pincode || !first_name || !last_name || !phone_number)
        return res.status(400).json({ msg: "Not all fields have been entered." });
    if (email.includes("@gmail")||email.includes("@yahoo")||email.includes("@outlook")||email.includes("@hotmail"))
        return res
          .status(400)
          .json({ msg: "Please enter your college id" });   
    if (password.length < 5)
        return res
          .status(400)
          .json({ msg: "The password needs to be at least 5 characters long." });
    if (password !== passwordCheck)
          return res
            .status(400)
            .json({ msg: "Enter the same password twice for verification." });

    const existingUser = await User.findOne({ 'auth_person.email': email });
    if (existingUser)
        return res
        .status(400)
        .json({ msg: "An account with this email already exists." });

    const existingUser1 = await User.findOne({ 'auth_person.phone_number':phone_number });
    if (existingUser1)
        return res
        .status(400)
        .json({ msg: "An account with this phone number already exists." });    

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // const lastUser = await User.findOne();
    // const newId = lastUser._id + 10 ;
    
    const newUser = new User({
      college_id: 0,
      college_name,
      address,
      city,
      state,
      country,
      pincode,
      auth_person : 
      {
        first_name,
        last_name,
        email,
        phone_number,
        password: passwordHash
      }
      });
    const savedUser = await newUser.save();
    const filter = { 'auth_person.email': email };
    const currUser = await User.findOne({ 'auth_person.email': email });
    var x = currUser._id;
    var y;
    if(x.toString().length === 1)
    { y = 'SNCG000'; }
    else if(x.toString().length === 2)
    { y = 'SNCG00'; }
    else if(x.toString().length === 3)
    { y = 'SNCG0' ; }
    else { y = 'SNCG'; }
    const update = {  college_id: y + x };
    let doc = await User.findOneAndUpdate(filter, update, {
      new: true
    });
    res.json(doc);
}       
catch (err) {
        res.status(500).json({ error: err.message });
      }

});
router.post("/staffpass", async (req, res) => {
  try{
      const { college_id, email, password ,passwordCheck} = req.body;



      // validate
      if (!email || !password || !passwordCheck || !college_id)
          return res.status(400).json({ msg: "Not all fields have been entered." });  
      if (password.length < 5)
          return res
            .status(400)
            .json({ msg: "The password needs to be at least 5 characters long." });
      if (password !== passwordCheck)
            return res
              .status(400)
              .json({ msg: "Enter the same password twice for verification." });
      const existingUser = await User.findOne({ college_id: college_id });
      if (!existingUser)
        return res
        .status(400)
        .json({ msg: "No such college with this ID exists." });
      // var stafs=existingUser.staff.find(v => v.email === email)
      const currUser = await User.findOne({ 'staff.email': email, college_id: college_id });
      if (!(currUser))
          return res
          .status(400)
          .json({ msg: "No Staff with thisexists" });
      const curr1User = await User.findOne({ 'staff.email': email, college_id: college_id });
      var check=curr1User.staff.find(v => v.email === email)
      if (check.password)
          return res
          .status(400)
          .json({ msg: "Password for this email already exists." }); 
           


      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);
      const user_clg1 = await User.findOne({ 'college_id': college_id, 'staff.email': email });
      const i = user_clg1.staff.map(function(e) { return e.email; }).indexOf(email);
      var filter=user_clg1.staff.find(v => v.email === email)
      user_clg1.staff.set(i,{staff_id: filter.staff_id, name: filter.name, email: filter.email, phone_number: filter.phone_number,password:passwordHash});
      user_clg1.save();
      res.json(user_clg1.staff.find(v => v.email === email).name);
  }    
  catch (err) {
          res.status(500).json({ error: err.message });
        }
  
  });


router.post("/staffList", async (req, res) => {
  try{
    let { college_id } = req.body;
    const userStaffList = await User.findOne({ 'college_id': college_id });
    res.json(userStaffList.staff);
  }
  catch{
    res.status(500).json({ error: err.message });
  }
})

router.post("/studentList", async (req, res) => {
  try{
    let { college_id } = req.body;
    const userStudentList = await User.findOne({ 'college_id': college_id });
    res.json(userStudentList.students);
  }
  catch{
    res.status(500).json({ error: err.message });
  }
})


router.post("/registerStaff", async (req, res) => {
  try{
       let { college_id, name, email, staff_id, phone_number } = req.body;
    
      // validate
      if (!email || !name || !staff_id || !phone_number)
          return res.status(400).json({ msg: "Not all fields have been entered." });
      
      const newUser = await User.findOne({ 'college_id': college_id });

      const existingUser2 = await User.findOne({ 'college_id': college_id, 'staff.email': email });
      if (existingUser2)
      return res
        .status(400)
        .json({ msg: "Staff already exists with such email id" }); 

      const existingUser3 = await User.findOne({ 'college_id': college_id, 'staff.staff_id': staff_id });
      if (existingUser3)
      return res
        .status(400)
        .json({ msg: "Staff already exists with such id" }); 
      
      const existingUser4 = await User.findOne({ 'college_id': college_id, 'staff.phone_number': phone_number });
      if (existingUser4)
      return res
        .status(400)
        .json({ msg: "Staff already exists with such phone number" }); 
      newUser.staff.push({ staff_id: staff_id, name: name, email: email, phone_number: phone_number });
      await newUser.save();
      res.json(newUser);
  }       
  catch (err) {
          res.status(500).json({ error: err.message });
        }
  });

router.post('/xlstojsonStaff', upload.single("file"), async (req, res, next) =>  {
try
  {
    const {
    file,
    body: { name }
  } = req;

  if (file.detectedFileExtension != ".xlsx") next(new Error("Invalid file type"));

  const fileName = name + "-staff" + file.detectedFileExtension;
  await pipeline(
    file.stream,
    fs.createWriteStream(`${__dirname}/../${fileName}`)
  );
var y=1;
  const newUser1 = await User.findOne({ 'college_id': name });
	xlsxtojson({
	  	input: `${fileName}`,  // input xls 
	    output: "output2.json", // output json 
	    lowerCaseHeaders:true
	}, async function(err, result) {
	    if(err) {
	      res.json(err);
	    } else {
        for(var i=0; i<result.length; i++)
        {
          if(!result[i].staff_id || !result[i].name || !result[i].email || !result[i].phone_number)
          { y=0;}
         await newUser1.staff.push(result[i]);
        }
        if(y===0)
        {throw "invalid"}
        newUser1.save();
        res.json(newUser1);
	    }
  });
}

  catch(err) {
    res.status(500).json({ error: err.message });
  }
  
});



router.post("/registerStudent", async (req, res) => {
  try{
          let { college_id, name, email, reg_no, year, phone_number } = req.body;
    
      // validate
      if (!email || !name || !reg_no || !year || !phone_number)
          return res.status(400).json({ msg: "Not all fields have been entered." });
      
      const newUser = await User.findOne({ 'college_id': college_id });

      const existingUser2 = await User.findOne({ 'college_id': college_id, 'students.email': email });
      if (existingUser2)
      return res
        .status(400)
        .json({ msg: "Student already exists with such email id" }); 

      const existingUser3 = await User.findOne({ 'college_id': college_id, 'students.reg_no': reg_no });
      if (existingUser3)
      return res
        .status(400)
        .json({ msg: "Student already exists with such register number" }); 
      
      const existingUser4 = await User.findOne({ 'college_id': college_id, 'students.phone_number': phone_number });
      if (existingUser4)
      return res
        .status(400)
        .json({ msg: "Student already exists with such phone number" }); 

      newUser.students.push({ reg_no: reg_no, name: name, email: email, year: year, phone_number: phone_number });
      await newUser.save();
      res.json(newUser);
  }       
  catch (err) {
          res.status(500).json({ error: err.message });
        }
  
  });


router.post('/xlstojson', upload.single("file"), async (req, res, next) =>  {
try
  {
    const {
    file,
    body: { name }
  } = req;

  if (file.detectedFileExtension != ".xlsx") next(new Error("Invalid file type"));

  const fileName = name + file.detectedFileExtension;
  await pipeline(
    file.stream,
    fs.createWriteStream(`${__dirname}/../${fileName}`)
  );
var y=1;
  const newUser1 = await User.findOne({ 'college_id': name });
	xlsxtojson({
	  	input: `${fileName}`,  // input xls 
	    output: "output.json", // output json 
	    lowerCaseHeaders:true
	}, async function(err, result) {
	    if(err) {
	      res.json(err);
	    } else {
        for(var i=0; i<result.length; i++)
        {
          if(!result[i].reg_no || !result[i].name ||!result[i].email ||!result[i].phone_number ||!result[i].year )
          { y=0;}
         await newUser1.students.push(result[i]);
        }
        if(y===0)
        {throw "invalid"}
        newUser1.save();
        res.json(newUser1);
	    }
  });
}

  catch(err) {
    res.status(500).json({ error: err.message });
  }
  
});

router.post("/editStaff", async (req, res) => {
  try {
    const { college_id, staff_id, name, email, phone_number } = req.body;

    const user_clg1 = await User.findOne({ 'college_id': college_id, 'staff.staff_id': staff_id });
    const i = user_clg1.staff.map(function(e) { return e.staff_id; }).indexOf(staff_id);
    user_clg1.staff.set(i,{staff_id: staff_id, name: name, email: email, phone_number: phone_number});
    user_clg1.save();
    res.json(user_clg1);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/removeStaff", async (req, res) => {
  try {
    const { college_id, staff_id } = req.body;

    const user_clg1 = await User.findOne({ 'college_id': college_id, 'staff.staff_id': staff_id });
    const i = user_clg1.staff.map(function(e) { return e.staff_id; }).indexOf(staff_id);
    user_clg1.staff.pull({staff_id: staff_id});
    user_clg1.save();
    res.json(user_clg1);
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/loginEmail", async (req, res) => {
    try {
      const { college_id, email, password } = req.body;
  
      // validate
      if (!college_id || !email || !password)
        return res.status(400).json({ msg: "Not all fields have been entered." });

      const user_clg = await User.findOne({ 'college_id': college_id });
      if (!user_clg)
        return res
          .status(400)
          .json({ msg: "No account with this college has been registered." });  
      var n1 = email.localeCompare(user_clg.auth_person.email);

      if(n1==0){
        const isMatch1 = await bcrypt.compare(password, user_clg.auth_person.password);
        if (!isMatch1) return res.status(400).json({ msg: "Invalid credentials." });
        var name = user_clg.auth_person.first_name + ' ' + user_clg.auth_person.last_name;
      const token = jwt.sign({ id: user_clg._id }, process.env.JWT_SECRET);
      res.json({
        token,
        user: {
          id: user_clg.college_id,
          name: name,
          email: user_clg.auth_person.email
        },
      });
      }
      else{
        if(n1!==0 && (user_clg.staff.find(v => v.email === email)==undefined))
        return res
            .status(400)
            .json({ msg: "No account with this email has been registered." });
        

        const isMatch2 = await bcrypt.compare(password, user_clg.staff.find(v => v.email === email).password);
        if (!isMatch2) return res.status(400).json({ msg: "Invalid credentials." });
        var staffd =user_clg.staff.find(v => v.email === email)
        const token = jwt.sign({ id: user_clg._id }, process.env.JWT_SECRET);
        var name=staffd.name
        res.json({
          token,
          user: {
            id: user_clg.college_id,
            name: name,
            email: staffd.email
          },
        });

      }    
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/loginPhn", async (req, res) => {
    try {
      const { college_id, phone_number, password } = req.body;
      
      // validate
      if (!college_id || !phone_number || !password)
        return res.status(400).json({ msg: "Not all fields have been entered." });
      
      const user_clg = await User.findOne({ 'college_id': college_id });
      if (!user_clg)
        return res
          .status(400)
          .json({ msg: "No account with this college has been registered." });
      const n1 = phone_number.localeCompare(user_clg.auth_person.phone_number.toString());
      console.log("hi"+n1)
      if(n1===0){
        const isMatch1 = await bcrypt.compare(password, user_clg.auth_person.password);
        if (!isMatch1) return res.status(400).json({ msg: "Invalid credentials." });
        var name = user_clg.auth_person.first_name + ' ' + user_clg.auth_person.last_name;
      const token = jwt.sign({ id: user_clg._id }, process.env.JWT_SECRET);
      res.json({
        token,
        user: {
          id: user_clg.college_id,
          name: name,
          email: user_clg.auth_person.email
        },
      });
      }
      else{
        if(n1!==0 && (user_clg.staff.find(v => v.phone_number === parseInt(phone_number))==undefined))
        return res
            .status(400)
            .json({ msg: "No account with this phone number has been registered." });
        

        const isMatch2 = await bcrypt.compare(password, user_clg.staff.find(v => v.phone_number === parseInt(phone_number)).password);
        if (!isMatch2) return res.status(400).json({ msg: "Invalid credentials." });
        var staffd =user_clg.staff.find(v => v.phone_number === parseInt(phone_number))
        const token = jwt.sign({ id: user_clg._id }, process.env.JWT_SECRET);
        var name=staffd.name
        res.json({
          token,
          user: {
            id: user_clg.college_id,
            name: name,
            email: staffd.email
          },
        });

      }    
    } catch (err) {
      res.status(500).json({ error: err.message });
    }

  });


  router.post("/assessment", async (req, res) => {
    try {
      const { college_id,exam_title,category,description,instructions,proctored,job,exam_duration,total_marks,negative_marks,name,email,phone_number,comp_name,location,questions,coding_questions } = req.body;
      const newUser = await User.findOne({ 'college_id': college_id });
      newUser.assessments.push({
        exam_info:  {
            exam_title: exam_title,
            category : category,
            description : description,
            instructions : instructions,
            proctored : proctored,
            job : job,
            exam_duration : exam_duration,
            total_marks : total_marks,
            negative_marks : negative_marks,
          },
        candidate_info: {
            name: name,
            email: email,
            phone_number: phone_number,
            comp_name: comp_name,
            location: location
          },
        questions: questions,
        coding_questions: coding_questions
        });
      await newUser.save();
      res.json(newUser);
    }
    catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/xlstojsonAssessment', upload.single("file"), async (req, res, next) =>  {
    try
      {
        const {
        file,
        body: { name }
      } = req;
    
      if (file.detectedFileExtension != ".xlsx") next(new Error("Invalid file type"));
    
      const fileName = name + '- assessment questions' + file.detectedFileExtension;
      await pipeline(
        file.stream,
        fs.createWriteStream(`${__dirname}/../${fileName}`)
      );

      xlsxtojson({
          input: `${fileName}`,  // input xls 
          output: "output.json", // output json 
          lowerCaseHeaders:true
      }, async function(err, result) {
          if(err) {
            res.json(err);
          } else {
            console.log(result);
            res.json(result);
          }
      });
    }
      catch(err) {
        res.status(500).json({ error: err.message });
      }
      
    });

  router.delete("/delete", auth, async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.user);
      res.json(deletedUser);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.post("/tokenIsValid", async (req, res) => {
    try {
      const token = req.header("x-auth-token");
      if (!token) return res.json(false);
  
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      if (!verified) return res.json(false);
  
      const user = await User.findById(verified.id);
      if (!user) return res.json(false);
  
      return res.json(true);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.get("/", auth, async (req, res) => {
    const user = await User.findById(req.user);
    res.json({
      displayName: user.displayName,
      id: user._id,
    });
  });

module.exports = router;