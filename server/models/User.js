import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        role: {
            type: String,
            enum: ["customer", "agent", "admin"],
            default: "customer"
        },

        address: {
            type: String,
            default: ""
        },

        currentLocation: {
            latitude: {
                type: Number,
                default: null
            },

            longitude: {
                type: Number,
                default: null
            }
        },

        isAvailable: {
            type: Boolean,
            default: false
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },

    {
        timestamps: true
    }
);

// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password during login
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;