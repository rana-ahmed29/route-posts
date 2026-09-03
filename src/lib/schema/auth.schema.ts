import * as z from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .nonempty("Name is Required")
      .min(3, "name must atleast 3 words")
      .max(12, "mustname atmost 10words"),
    username: z
      .string()
      .nonempty("Username is required")
      .regex(
        /^[a-z0-9_]{3,30}$/,
        "Username must be lowercase letters, numbers, or underscores only (3-30 characters)",
      ),
    email: z.email("must be valid").nonempty("email is required"),
    dateOfBirth: z
      .string()
      .nonempty("Date of Birth is Required")
      .refine(
        (data) => {
          const currentYear = new Date().getFullYear();
          const dateOfBirth = new Date(data).getFullYear();
          const age = currentYear - dateOfBirth;
          return age >= 18;
        },
        { error: "age must be above 18 year" },
      ),
    gender: z.string().nonempty("gender is required"),
    password: z
      .string()
      .nonempty("password is required")
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character (#?!@$%^&*-)",
      ),
    rePassword: z.string().nonempty("password is required"),
  })
  .refine((data) => data.password === data.rePassword, {
    path: ["rePassword"],
    error: "Repassword must match with Password",
  });

export type RegisterSchemaType = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().nonempty("Email or username is required"),
  password: z.string().nonempty("Password is required"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;