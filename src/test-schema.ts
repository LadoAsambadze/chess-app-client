import {
  signupSchema,
  type SignupFormData,
} from './schemas/auth/signup.schema';

// Test the schema with valid data
const validData: SignupFormData = {
  firstname: 'John',
  lastname: 'Doe',
  email: 'john.doe@example.com',
  password: 'Password123!',
  phone: '+1234567890',
};

const result = signupSchema.safeParse(validData);
if (result.success) {
  console.log('✅ Valid data passed validation:', result.data);
} else {
  console.log('❌ Validation failed:', result.error.issues);
}

// Test with invalid data
const invalidData = {
  firstname: '',
  lastname: 'D',
  email: 'invalid-email',
  password: 'weak',
  phone: 'invalid-phone',
};

const invalidResult = signupSchema.safeParse(invalidData);
if (invalidResult.success) {
  console.log('✅ Data passed validation');
} else {
  console.log(
    '❌ Expected validation errors:',
    invalidResult.error.issues.map((err: any) => ({
      path: err.path,
      message: err.message,
    }))
  );
}
