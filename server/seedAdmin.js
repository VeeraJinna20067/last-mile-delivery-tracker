import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = "admin@delivery.com";
        const password = "Admin@123";

        let admin = await User.findOne({ email });

        if (admin) {
            // Set the plain password.
            // User.pre("save") will hash it exactly once.
            admin.password = password;
            admin.role = "admin";
            admin.isActive = true;

            await admin.save();

            console.log("✅ Existing admin password reset successfully");
        } else {
            admin = await User.create({
                name: "Delivery Admin",
                email,
                phone: "9999999999",
                password,
                role: "admin"
            });

            console.log("✅ Admin created successfully");
        }

        console.log("Email:", admin.email);
        console.log("Role:", admin.role);
        console.log("Active:", admin.isActive);

        const passwordMatches = await admin.comparePassword(password);

        console.log("Password matches:", passwordMatches);

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

createAdmin();