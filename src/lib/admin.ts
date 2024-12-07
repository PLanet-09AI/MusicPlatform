import { createAdminUser } from './auth/service';

const ADMIN_EMAIL = 'admin@musichub.com';
const ADMIN_PASSWORD = 'Admin123!';

export async function initializeAdmin() {
  try {
    await createAdminUser(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('Admin account created successfully:');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin account already exists');
    } else {
      console.error('Error creating admin account:', error);
    }
  }
}