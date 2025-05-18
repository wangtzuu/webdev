// Integrated Library Management System with Confirmation Dialogs
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing integrated library system');
  
  // SUPABASE SETUP
  const supabaseUrl = 'https://xvxzvzzrgbsfdialxntu.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2eHp2enpyZ2JzZmRpYWx4bnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MDQ4ODEsImV4cCI6MjA2MjE4MDg4MX0.s_07EucARbv2GJKMo3HKatiodaqo9WNJO-k1vLkog5E';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  
  // BOOK DATABASE
  const bookDatabase = {
    'MATH001': 'DIGITAL ARTS-3D MODELING',
    'SCI002': 'SCIENCE LINKS (CHEMISTRY)',
    'ENG003': 'ESSENTIAL ENGLISH',
    'FIL004': 'BASIC PROGRAMMING',
    'SOC005': 'CONNECTING DEVICES/NETWORKING',
    'COMP006': 'UNIVERSITY PHYSICS vol 1',
    'COMP007': 'ALGEBRA (BEGINNING AND INTERMEDIATE)',
    'COMP008': 'GENERAL PHYSICS',
    'COMP009': 'DATABASE MANAGEMENT',
    'COMP010': 'LANGUAGE IN LITERATURE',
    'COMP011': 'NEXT CENTURY MATHEMATICS',
    'COMP012': 'NOLI ME TANGERE'
  };
  
  // DOM ELEMENTS
  const bookCovers = document.querySelectorAll('.book-cover');
  const checkoutBookInput = document.getElementById('bookCodeInput');
  const checkoutBookImage = document.getElementById('checkoutBookImage');
  
  // CHECKOUT SECTION ELEMENTS
  const checkoutForm = document.querySelector('.section-box:nth-child(1) .section-content');
  const checkoutBookTitle = document.createElement('div');
  checkoutBookTitle.className = 'book-title-display';
  checkoutBookTitle.style.fontWeight = 'bold';
  checkoutBookTitle.style.marginBottom = '10px';
  checkoutBookTitle.style.textAlign = 'center';
  
  // Insert book title element after the book code input
  if (checkoutForm) {
    const bookCodeInput = checkoutForm.querySelector('#bookCodeInput');
    if (bookCodeInput) {
      bookCodeInput.parentNode.insertBefore(checkoutBookTitle, bookCodeInput.nextSibling);
    }
  }
  
  // RETURN SECTION ELEMENTS
  const returnForm = document.querySelector('.section-box:nth-child(2) .section-content');
  const returnBookCodeInput = returnForm ? returnForm.querySelector('input[placeholder="Book code"]') : null;
  const returnBookTitleInput = document.createElement('input');
  
  // Configure return book title input
  if (returnForm && returnBookCodeInput) {
    returnBookTitleInput.type = 'text';
    returnBookTitleInput.className = 'input-field';
    returnBookTitleInput.placeholder = 'Book name';
    returnBookTitleInput.readOnly = true;
    returnBookCodeInput.parentNode.insertBefore(returnBookTitleInput, returnBookCodeInput.nextSibling);
  }
  
  // USER MANAGEMENT FUNCTIONS
  function getCurrentUser() {
    // First check for complete user data (from profile script)
    const completeUserDataString = localStorage.getItem('completeUserData');
    if (completeUserDataString) {
      try {
        const userData = JSON.parse(completeUserDataString);
        if (userData && userData.username) {
          return userData;
        }
      } catch (error) {
        console.error('Error parsing complete user data:', error);
      }
    }
    
    // Fallback to currentUser from login script
    const currentUserString = localStorage.getItem('currentUser');
    if (currentUserString) {
      try {
        const userData = JSON.parse(currentUserString);
        if (userData && userData.username) {
          return userData;
        }
      } catch (error) {
        console.error('Error parsing current user data:', error);
      }
    }
    
    console.warn('No user data found in localStorage');
    return null;
  }
  
  async function authenticateWithSupabase() {
    try {
      // First check if there's already an active session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData && sessionData.session) {
        console.log('Active Supabase session found');
        return { success: true, user: sessionData.session.user };
      }
      
      const currentUser = getCurrentUser();
      if (!currentUser) {
        console.warn('No user data available');
        return { success: false, error: 'User not logged in' };
      }
      
      // Generate a mock user object with their ID for RLS purposes
      const mockAuthUser = {
        id: currentUser.id,
        username: currentUser.username
      };
      
      console.log('Using direct database access with user ID');
      return { success: true, user: mockAuthUser };
    } catch (err) {
      console.error('Authentication error:', err);
      return { success: false, error: err };
    }
  }
  
  function isUserLoggedIn() {
    const currentUser = getCurrentUser();
    return !!currentUser;
  }
  
  // BOOK SELECTION FUNCTIONS
  bookCovers.forEach(bookCover => {
    bookCover.addEventListener('click', function() {
      const bookCode = this.getAttribute('data-book-code');
      const bookImgSrc = this.querySelector('img').getAttribute('data-book-src');
      const bookName = bookDatabase[bookCode];
      
      // Display book in checkout section
      if (checkoutBookInput) {
        checkoutBookInput.value = bookCode;
      }
      
      if (checkoutBookImage) {
        checkoutBookImage.src = bookImgSrc;
      }
      
      if (checkoutBookTitle) {
        checkoutBookTitle.textContent = bookName;
      }
      
      // Show borrowing page and scroll to it
      const borrowingPage = document.getElementById('borrowingPage');
      const borrowingLink = document.getElementById('borrowingLink');
      
      if (borrowingPage && borrowingLink) {
        // Hide dashboard and show borrowing page
        document.getElementById('dashboard').style.display = 'none';
        borrowingPage.style.display = 'block';
        
        // Update active nav link
        document.querySelectorAll('.nav-item').forEach(item => {
          item.classList.remove('active');
        });
        borrowingLink.classList.add('active');
        
        // Scroll to the top of borrowing page
        window.scrollTo(0, 0);
        
        // Populate username in borrowing form
        const currentUser = getCurrentUser();
        if (currentUser) {
          const usernameInputs = document.querySelectorAll('.borrowing-page .input-field[placeholder="Student Username"]');
          usernameInputs.forEach(input => {
            input.value = currentUser.username || '';
          });
        }
      }
    });
  });
  
  // RETURN BOOK CODE VALIDATION
  if (returnBookCodeInput) {
    returnBookCodeInput.addEventListener('input', function() {
      const bookCode = this.value.trim().toUpperCase();
      const bookName = bookDatabase[bookCode];
      
      if (bookName) {
        returnBookTitleInput.value = bookName;
        returnBookCodeInput.setCustomValidity('');
      } else {
        returnBookTitleInput.value = '';
        returnBookCodeInput.setCustomValidity('Invalid book code');
      }
    });
  }
  
  // ADD GLOBAL STYLES FOR CONFIRMATION MODALS
  const modalStyle = document.createElement('style');
  modalStyle.textContent = `
    .confirmation-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .confirmation-content {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 90%;
    }
    
    .confirmation-title {
      color: #901C1C;
      margin-top: 0;
      font-size: 1.5rem;
    }
    
    .confirmation-message {
      margin-bottom: 10px;
    }
    
    .book-details {
      font-weight: bold;
      margin-bottom: 20px;
      padding: 10px;
      background-color: #f9f9f9;
      border-left: 3px solid #901C1C;
    }
    
    .confirmation-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    
    .cancel-btn {
      background-color: #ddd;
      color: #333;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .confirm-btn {
      background-color: #901C1C;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .cancel-btn:hover {
      background-color: #ccc;
    }
    
    .confirm-btn:hover {
      background-color: #7a1717;
    }
  `;
  document.head.appendChild(modalStyle);
  
  // CHECKOUT BOOK FUNCTIONALITY WITH CONFIRMATION
  const checkoutButton = checkoutForm ? checkoutForm.querySelector('.action-btn') : null;
  if (checkoutButton) {
    checkoutButton.addEventListener('click', function(e) {
      e.preventDefault();
      
      // First check if user is logged in
      if (!isUserLoggedIn()) {
        alert('You need to be logged in to borrow books. Please log in again.');
        window.location.href = 'index.html';
        return;
      }
      
      const bookCode = checkoutBookInput.value.trim();
      const bookName = checkoutBookTitle.textContent.trim();
      const checkoutDate = checkoutForm.querySelector('#checkoutTime').value;
      const currentUser = getCurrentUser();
      
      // Validate inputs before showing confirmation
      if (!bookCode || !bookName) {
        alert('Please select a valid book');
        return;
      }
      
      if (!checkoutDate) {
        alert('Please select a checkout date');
        return;
      }
      
      if (!currentUser) {
        alert('User information not available. Please log in again.');
        return;
      }
      
      // Create and show the confirmation modal
      const confirmationModal = document.createElement('div');
      confirmationModal.className = 'confirmation-modal';
      confirmationModal.innerHTML = `
        <div class="confirmation-content">
          <h2 class="confirmation-title">Confirm Borrowing</h2>
          <p class="confirmation-message">Are you sure you want to borrow this book?</p>
          <p class="book-details">${bookName || 'Selected book'} (${bookCode || ''})</p>
          <div class="confirmation-buttons">
            <button class="cancel-btn">Cancel</button>
            <button class="confirm-btn">Continue</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(confirmationModal);
      
      // Handle cancel button click
      const cancelBtn = confirmationModal.querySelector('.cancel-btn');
      cancelBtn.addEventListener('click', function() {
        confirmationModal.remove();
      });
      
      // Handle confirm button click - THIS IS WHERE WE CONNECT TO DATABASE
      const confirmBtn = confirmationModal.querySelector('.confirm-btn');
      confirmBtn.addEventListener('click', async function() {
        confirmationModal.remove();
        
        // Continue with the database operation
        await processBorrowBook(bookCode, bookName, checkoutDate, currentUser, checkoutButton);
      });
      
      // Close modal if clicked outside content
      confirmationModal.addEventListener('click', function(e) {
        if (e.target === confirmationModal) {
          confirmationModal.remove();
        }
      });
    });
  }
  
  // Function to handle the database operation for borrowing
  async function processBorrowBook(bookCode, bookName, checkoutDate, currentUser, checkoutButton) {
    try {
      // Show loading indicator or disable button
      checkoutButton.disabled = true;
      checkoutButton.textContent = 'Processing...';
      
      // First authenticate with Supabase
      const authResult = await authenticateWithSupabase();
      
      if (!authResult.success) {
        alert('Authentication failed. Please log in again.');
        checkoutButton.disabled = false;
        checkoutButton.textContent = 'Borrow';
        return;
      }
      
      // FIX: Proper handling of user_id value
      let userId = null;
      
      // If the user has a properly formatted UUID, use it
      if (currentUser.id && typeof currentUser.id === 'string' && 
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id)) {
        userId = currentUser.id;
      }
      
      // Calculate due date (7 days from checkout date)
      const dueDate = new Date(checkoutDate);
      dueDate.setDate(dueDate.getDate() + 7);
      const dueDateString = dueDate.toISOString().split('T')[0];
      
      // Prepare data for insertion
      const borrowingData = {
        book_code: bookCode,
        book_name: bookName,
        username: currentUser.username,
        full_name: `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim(),
        checkout_date: checkoutDate,
        due_date: dueDateString,
        department: currentUser.department || 'N/A',
        status: 'borrowed'
      };
      
      // Only add user_id if it's a valid UUID
      if (userId) {
        borrowingData.user_id = userId;
      }
      
      console.log('Inserting borrowing record:', borrowingData);
      
      // Insert borrowing record
      const { data, error } = await supabase
        .from('book_borrowings')
        .insert([borrowingData])
        .select();
        
      // Re-enable the button
      checkoutButton.disabled = false;
      checkoutButton.textContent = 'Borrow';
      
      if (error) {
        console.error('Error inserting borrowing record:', error);
        
        // Handle specific error types
        if (error.code === '42501') {
          alert('You do not have permission to borrow books.');
        } else if (error.code === '22P02') {
          alert('Error: Invalid UUID format. Please contact the system administrator.');
        } else {
          alert(`Error: ${error.message}`);
        }
        return;
      }
      
      // Success
      alert(`Successfully borrowed: ${bookName}\nDue date: ${dueDateString}`);
      
      // Reset the form
      checkoutBookInput.value = '';
      checkoutBookTitle.textContent = '';
      checkoutBookImage.src = '';
      checkoutForm.querySelector('#checkoutTime').value = '';
      
    } catch (err) {
      // Re-enable the button
      checkoutButton.disabled = false;
      checkoutButton.textContent = 'Borrow';
      
      console.error('Unexpected error during checkout:', err);
      alert('An unexpected error occurred. Please try again.');
    }
  }
  
  // RETURN BOOK FUNCTIONALITY WITH CONFIRMATION
  const returnButton = returnForm ? returnForm.querySelector('.action-btn') : null;
  if (returnButton) {
    returnButton.addEventListener('click', function(e) {
      e.preventDefault();
      
      // First check if user is logged in
      if (!isUserLoggedIn()) {
        alert('You need to be logged in to return books. Please log in again.');
        window.location.href = 'index.html';
        return;
      }
      
      const bookCode = returnBookCodeInput.value.trim();
      const bookName = returnBookTitleInput.value.trim();
      const returnDate = returnForm.querySelector('.time-input').value;
      const currentUser = getCurrentUser();
      
      // Validate inputs before showing confirmation
      if (!bookCode || !bookName) {
        alert('Please enter a valid book code');
        return;
      }
      
      if (!returnDate) {
        alert('Please select a return date');
        return;
      }
      
      if (!currentUser) {
        alert('User information not available. Please log in again.');
        return;
      }
      
      // Create and show the confirmation modal
      const confirmationModal = document.createElement('div');
      confirmationModal.className = 'confirmation-modal';
      confirmationModal.innerHTML = `
        <div class="confirmation-content">
          <h2 class="confirmation-title">Confirm Return</h2>
          <p class="confirmation-message">Are you sure you want to return this book?</p>
          <p class="book-details">${bookName || 'Selected book'} (${bookCode || ''})</p>
          <div class="confirmation-buttons">
            <button class="cancel-btn">Cancel</button>
            <button class="confirm-btn">Continue</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(confirmationModal);
      
      // Handle cancel button click
      const cancelBtn = confirmationModal.querySelector('.cancel-btn');
      cancelBtn.addEventListener('click', function() {
        confirmationModal.remove();
      });
      
      // Handle confirm button click - THIS IS WHERE WE CONNECT TO DATABASE
      const confirmBtn = confirmationModal.querySelector('.confirm-btn');
      confirmBtn.addEventListener('click', async function() {
        confirmationModal.remove();
        
        // Continue with the database operation
        await processReturnBook(bookCode, bookName, returnDate, currentUser, returnButton);
      });
      
      // Close modal if clicked outside content
      confirmationModal.addEventListener('click', function(e) {
        if (e.target === confirmationModal) {
          confirmationModal.remove();
        }
      });
    });
  }
  
  // Function to handle the database operation for returning
  async function processReturnBook(bookCode, bookName, returnDate, currentUser, returnButton) {
    try {
      // Show loading indicator or disable button
      returnButton.disabled = true;
      returnButton.textContent = 'Processing...';
      
      // First authenticate with Supabase
      const authResult = await authenticateWithSupabase();
      
      if (!authResult.success) {
        alert('Authentication failed. Please log in again.');
        returnButton.disabled = false;
        returnButton.textContent = 'Return';
        return;
      }
      
      // Check if this book is actually borrowed by this user
      const { data, error } = await supabase
        .from('book_borrowings')
        .select('*')
        .eq('book_code', bookCode)
        .eq('username', currentUser.username)
        .eq('status', 'borrowed');
        
      if (error) {
        console.error('Error checking borrowed status:', error);
        
        // Re-enable the button
        returnButton.disabled = false;
        returnButton.textContent = 'Return';
        
        // Handle specific error types
        if (error.code === '42501') {
          alert('You do not have permission to check borrowed books. Please contact the library administrator.');
        } else {
          alert(`Error: ${error.message}`);
        }
        return;
      }
      
      if (!data || data.length === 0) {
        alert('You have not borrowed this book or it has already been returned.');
        returnButton.disabled = false;
        returnButton.textContent = 'Return';
        return;
      }
      
      // Book is borrowed, update its status
      const borrowId = data[0].id;
      
      const { data: updateData, error: updateError } = await supabase
        .from('book_borrowings')
        .update({
          status: 'returned',
          return_date: returnDate
        })
        .eq('id', borrowId)
        .select();
        
      // Re-enable the button
      returnButton.disabled = false;
      returnButton.textContent = 'Return';
      
      if (updateError) {
        console.error('Error during return:', updateError);
        
        // Handle specific error types
        if (updateError.code === '42501') {
          alert('You do not have permission to return this book. Please contact the library administrator.');
        } else {
          alert(`Error: ${updateError.message}`);
        }
        return;
      }
      
      // Success
      alert(`Successfully returned: ${bookName}`);
      
      // Reset the form
      returnBookCodeInput.value = '';
      returnBookTitleInput.value = '';
      returnForm.querySelector('.time-input').value = '';
      
    } catch (err) {
      // Re-enable the button
      returnButton.disabled = false;
      returnButton.textContent = 'Return';
      
      console.error('Unexpected error during return:', err);
      alert('An unexpected error occurred. Please try again.');
    }
  }
  
  // Initialize date inputs with today's date
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const today = new Date().toISOString().split('T')[0];
  dateInputs.forEach(input => {
    input.value = today;
    input.min = today; // Prevent selecting past dates
  });
  
  // Initialize profile data on page load
  (async function() {
    try {
      // Check if user data exists
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        console.warn('No user data found in storage');
        // Redirect to login page
        window.location.href = 'index.html';
        return;
      }
      
      console.log('User data found, ready for browsing');
      
      // Populate username in borrowing section if visible
      const usernameInputs = document.querySelectorAll('.borrowing-page .input-field[placeholder="Student Username"]');
      usernameInputs.forEach(input => {
        input.value = currentUser.username || '';
      });
      
    } catch (err) {
      console.error('Error during initialization:', err);
    }
  })();
  
  console.log('Integrated library system initialized with confirmation dialogs');
});