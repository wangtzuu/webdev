// Supabase configuration
const supabaseUrl = 'https://xvxzvzzrgbsfdialxntu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2eHp2enpyZ2JzZmRpYWx4bnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MDQ4ODEsImV4cCI6MjA2MjE4MDg4MX0.s_07EucARbv2GJKMo3HKatiodaqo9WNJO-k1vLkog5E';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Toggle password visibility
function toggleVisibility(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

// Validate that email is using gmail.com domain
function isValidGmailAddress(email) {
  if (!email || email.trim() === '') return false;
  
  // Check basic email format first
  if (!email.includes('@')) return false;
  
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  if (parts[0].length === 0) return false; // No username before @
  
  // Check specifically for gmail.com domain (case insensitive)
  const domain = parts[1].toLowerCase();
  return domain === 'gmail.com';
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
  // Get form element
  const registerForm = document.getElementById("registerForm");
  
  // Exit if form isn't found
  if (!registerForm) {
    console.error("Register form not found!");
    return;
  }
  
  // Add validation to email field on input
  const emailField = document.getElementById("email");
  if (emailField) {
    emailField.addEventListener("input", function() {
      const email = emailField.value.trim();
      
      // Don't show errors while typing unless there's already significant input
      if (email.length < 5) {
        emailField.setCustomValidity("");
        return;
      }
      
      if (!isValidGmailAddress(email)) {
        emailField.setCustomValidity("Please enter a valid Gmail address (example@gmail.com)");
      } else {
        emailField.setCustomValidity("");
      }
    });
    
    // Add placeholder to indicate Gmail requirement
    emailField.placeholder = "example@gmail.com";
  }
  
  registerForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    console.log("Form submission started");

    const fname = document.getElementById("fname").value;
    const lname = document.getElementById("lname").value;
    const uname = document.getElementById("uname").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value.trim();
    const confirm = document.getElementById("confirm").value;

    console.log("Validating form data...");
    
    // Validate all required fields have values
    if (!fname || !lname || !uname || !password || !email || !confirm) {
      alert("All fields are required!");
      return;
    }

    // Validate password matching
    if (password !== confirm) {
      alert("Passwords do not match!");
      return;
    }

    // Validate email is a Gmail address
    console.log("Checking email validity:", email);
    if (!isValidGmailAddress(email)) {
      console.log("Email validation failed - not a Gmail address");
      alert("Please enter a valid Gmail address (example@gmail.com)");
      return;
    }
    
    console.log("Email validation passed");

    try {
      console.log("Checking if username exists...");
      // Check if username already exists
      const { data: existingUserData, error: checkUserError } = await supabase
        .from('users')
        .select('username')
        .eq('username', uname);

      if (checkUserError) {
        console.error('Error checking username:', checkUserError);
        alert("Error checking username availability. Please try again.");
        return;
      }

      if (existingUserData && existingUserData.length > 0) {
        alert("Username already taken. Please choose another one.");
        return;
      }
      
      console.log("Username is available");

      console.log("Checking if email exists...");
      // Check if email already exists
      const { data: existingEmailData, error: checkEmailError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email);

      if (checkEmailError) {
        console.error('Error checking email:', checkEmailError);
        alert("Error checking email availability. Please try again.");
        return;
      }

      if (existingEmailData && existingEmailData.length > 0) {
        alert("An account with this email already exists. Please use a different email address.");
        return;
      }
      
      console.log("Email is available");

      console.log("Registering new user...");
      // Insert user data into users table
      const { data, error } = await supabase
        .from('users')
        .insert([{ 
          first_name: fname, 
          last_name: lname, 
          username: uname, 
          email: email,
          password: password, // Note: In a production app, you should hash passwords
          role: 'user',     // Set default role to 'user'
          is_admin: false   // Set is_admin to false for regular users
        }]);

      if (error) {
        console.error('Error inserting data:', error);
        alert("Error: " + error.message);
      } else {
        console.log("User registered successfully");
        alert("Account created successfully!");
        document.getElementById("registerForm").reset();
        // Redirect to login page
        window.location.href = "index.html";
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert("An unexpected error occurred. Please try again.");
    }
  });
});