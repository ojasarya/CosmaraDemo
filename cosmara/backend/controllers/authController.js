const User = require("../models/User");
const bcrypt = require("bcryptjs");
const signup = async (req, res) => {
    const login = async (req, res) => {
    }
    try {
        const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please fill all the required fields."
        });
    }

    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
    

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "User already exists."
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
   const user = await User.create({
        name,
        email,
        password: hashedPassword
    });



    res.status(201).json({
        success: true,
        message: "Data Registered Successfully",
        user,
    });
};

module.exports = { 
    signup,
    login
};