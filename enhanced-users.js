// Enhanced Users Section with Borrowing History
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Supabase client
  const supabaseUrl = 'https://xvxzvzzrgbsfdialxntu.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2eHp2enpyZ2JzZmRpYWx4bnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MDQ4ODEsImV4cCI6MjA2MjE4MDg4MX0.s_07EucARbv2GJKMo3HKatiodaqo9WNJO-k1vLkog5E';
  
  // Check if supabaseClient exists before creating the client
  if (typeof supabaseClient !== 'undefined') {
    // Create the client correctly - using the global scope supabaseClient
    const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);
    initializeUserDetails(supabase);
  } else {
    console.error('supabaseClient is not defined. Make sure Supabase JS is loaded correctly.');
  }
  
  function initializeUserDetails(supabase) {
    // Check if this is the users page
    const usersLink = document.getElementById('usersLink');
    if (!usersLink) {
      // Not users page, exit
      console.log('Not on users page, exiting enhanced-users.js');
      return;
    }

    console.log('Enhanced users script initialized');

    // Create user details modal HTML and append to body if it doesn't exist already
    if (!document.getElementById('userDetailsModal')) {
      createUserDetailsModal();
    }

    // Function to create and append the modal to the body
    function createUserDetailsModal() {
      // Create the modal container
      const modalContainer = document.createElement('div');
      modalContainer.id = 'userDetailsModal';
      modalContainer.className = 'user-details-modal';
      
      // Create the modal content
      modalContainer.innerHTML = `
        <div class="user-details-content">
          <div class="modal-header">
            <h2 class="modal-title">User Details</h2>
            <button class="close-modal-btn" id="closeUserModal">&times;</button>
          </div>
          
          <div class="user-profile">
            <div class="user-avatar">
              <img src="/api/placeholder/80/80" alt="User Avatar">
            </div>
            <div class="user-info">
              <h3 id="modalUserName">Loading...</h3>
              <p id="modalUserEmail">Loading...</p>
              <p id="modalUserRole">Loading...</p>
              <div id="modalUserStatus" class="status">Loading...</div>
            </div>
          </div>
          
          <div class="tabs">
            <button class="tab-btn active" id="currentlyBorrowedTab">Currently Borrowed</button>
            <button class="tab-btn" id="borrowingHistoryTab">Borrowing History</button>
          </div>
          
          <div class="tab-content" id="currentlyBorrowedContent">
            <div class="books-table-container">
              <table class="books-table">
                <thead>
                  <tr>
                    <th>Book Code</th>
                    <th>Book Name</th>
                    <th>Checkout Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="userCurrentBorrowedTableBody">
                  <tr>
                    <td colspan="5">Loading books...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="tab-content" id="borrowingHistoryContent" style="display: none;">
            <div class="books-table-container">
              <table class="books-table">
                <thead>
                  <tr>
                    <th>Book Code</th>
                    <th>Book Name</th>
                    <th>Checkout Date</th>
                    <th>Return Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="userHistoryTableBody">
                  <tr>
                    <td colspan="5">Loading history...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
      
      // Add the modal to the body
      document.body.appendChild(modalContainer);
      
      // Add the necessary styles
      addModalStyles();
      
      // Add event listeners
      setupModalEventListeners();
    }

    // Add styles for the modal
    function addModalStyles() {
      // Check if the styles already exist
      if (document.getElementById('userModalStyles')) {
        return;
      }
      
      const style = document.createElement('style');
      style.id = 'userModalStyles';
      style.textContent = `
        #userTableBody tr {
          cursor: pointer;
          transition: background-color 0.2s;
        }
        #userTableBody tr:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        /* Modal Styles */
        .user-details-modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          justify-content: center;
          align-items: center;
        }
        
        .user-details-content {
          background-color: white;
          border-radius: 8px;
          width: 80%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }
        
        .close-modal-btn {
          font-size: 24px;
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
        }
        
        .user-profile {
          display: flex;
          padding: 20px;
          background-color: #f9f9f9;
          border-bottom: 1px solid #eee;
        }
        
        .user-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 20px;
        }
        
        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .user-info h3 {
          margin-top: 0;
          margin-bottom: 5px;
          color: #333;
        }
        
        .user-info p {
          margin: 5px 0;
          color: #555;
        }
        
        .tabs {
          display: flex;
          padding: 0 20px;
          border-bottom: 1px solid #eee;
        }
        
        .tab-btn {
          padding: 15px 20px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-weight: 500;
          color: #555;
          transition: all 0.3s;
        }
        
        .tab-btn.active {
          color: #8B0000;
          border-bottom-color: #8B0000;
        }
        
        .tab-content {
          padding: 20px;
        }
        
        /* Status badges */
        .status {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .status.active {
          background-color: #e8f5e9;
          color: #388e3c;
        }
        
        .status.inactive {
          background-color: #ffebee;
          color: #d32f2f;
        }
        
        /* Days overdue styling */
        .days-overdue {
          color: #d32f2f;
          font-weight: bold;
        }
        
        /* Book status badges */
        .book-status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .book-status.overdue {
          background-color: #ffebee;
          color: #d32f2f;
        }
        
        .book-status.on-time {
          background-color: #e8f5e9;
          color: #388e3c;
        }
        
        .book-status.returned {
          background-color: #e3f2fd;
          color: #1976d2;
        }
      `;
      document.head.appendChild(style);
    }

    // Setup event listeners for the modal
    function setupModalEventListeners() {
      // Add event listener to close button
      document.getElementById('closeUserModal').addEventListener('click', function() {
        closeUserModal();
      });
      
      // Add event listeners to tab buttons
      document.getElementById('currentlyBorrowedTab').addEventListener('click', function() {
        switchTab('currentlyBorrowed');
      });
      
      document.getElementById('borrowingHistoryTab').addEventListener('click', function() {
        switchTab('borrowingHistory');
      });
      
      // Close if clicking outside the modal content
      document.getElementById('userDetailsModal').addEventListener('click', function(e) {
        if (e.target === this) {
          closeUserModal();
        }
      });
    }

    // Function to make users table rows clickable
    function makeUsersTableRowsClickable() {
      const userTableBody = document.getElementById('userTableBody');
      if (!userTableBody) {
        console.log('User table body not found');
        return;
      }
      
      // Remove existing event listeners (to avoid duplicates)
      const clonedTableBody = userTableBody.cloneNode(true);
      userTableBody.parentNode.replaceChild(clonedTableBody, userTableBody);
      
      // Add click event to each row
      clonedTableBody.addEventListener('click', function(e) {
        // Find the closest tr element
        const row = e.target.closest('tr');
        if (!row) return;
        
        // Get the username from the row (2nd cell contains username)
        const cells = row.cells;
        if (!cells || cells.length < 2) return;
        
        const userId = cells[0].textContent;
        const username = cells[1].textContent;
        
        if (username && username !== 'N/A') {
          // Show modal with user details
          showUserDetailsModal(username);
        }
      });
    }

    // Function to show the user details modal
    function showUserDetailsModal(username) {
      console.log('Opening modal for user:', username);
      // Set the modal username
      document.getElementById('modalUserName').textContent = 'Loading...';
      document.getElementById('modalUserEmail').textContent = 'Loading...';
      document.getElementById('modalUserRole').textContent = 'Loading...';
      document.getElementById('modalUserStatus').textContent = 'Loading...';
      document.getElementById('modalUserStatus').className = 'status';
      
      // Reset tabs to default
      switchTab('currentlyBorrowed');
      
      // Show the modal
      const modal = document.getElementById('userDetailsModal');
      modal.style.display = 'flex';
      
      // Load user details
      loadUserDetails(username);
      
      // Load user's currently borrowed books
      loadUserCurrentlyBorrowedBooks(username);
      
      // Load user's borrowing history (pre-load for tab switch)
      loadUserBorrowingHistory(username);
    }

    // Function to close the user details modal
    function closeUserModal() {
      const modal = document.getElementById('userDetailsModal');
      modal.style.display = 'none';
    }

    // Function to switch tabs
    function switchTab(tabName) {
      // Update tab buttons
      document.getElementById('currentlyBorrowedTab').classList.remove('active');
      document.getElementById('borrowingHistoryTab').classList.remove('active');
      
      // Update tab content visibility
      document.getElementById('currentlyBorrowedContent').style.display = 'none';
      document.getElementById('borrowingHistoryContent').style.display = 'none';
      
      if (tabName === 'currentlyBorrowed') {
        document.getElementById('currentlyBorrowedTab').classList.add('active');
        document.getElementById('currentlyBorrowedContent').style.display = 'block';
      } else {
        document.getElementById('borrowingHistoryTab').classList.add('active');
        document.getElementById('borrowingHistoryContent').style.display = 'block';
      }
    }

    // Function to load user details
    async function loadUserDetails(username) {
      try {
        console.log('Loading details for user:', username);
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .limit(1);
          
        if (error) {
          console.error('Error fetching user details:', error);
          document.getElementById('modalUserName').textContent = 'Error loading user';
          return;
        }
        
        if (users && users.length > 0) {
          const user = users[0];
          
          // Create full name by combining first and last name
          const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || username;
          
          // Update user information in the modal
          document.getElementById('modalUserName').textContent = fullName;
          document.getElementById('modalUserEmail').textContent = user.email || 'No email provided';
          
          // Set role
          const role = user.is_admin ? 'Admin' : 'User';
          document.getElementById('modalUserRole').textContent = role;
          
          // Set status
          const isActive = user.is_active !== false;
          const statusElement = document.getElementById('modalUserStatus');
          statusElement.textContent = isActive ? 'Active' : 'Inactive';
          statusElement.className = `status ${isActive ? 'active' : 'inactive'}`;
        } else {
          document.getElementById('modalUserName').textContent = username;
          document.getElementById('modalUserEmail').textContent = 'User not found';
        }
      } catch (err) {
        console.error('Unexpected error loading user details:', err);
        document.getElementById('modalUserName').textContent = 'Error loading user';
      }
    }

    // Function to format date nicely
    function formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return as-is if invalid
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    }

    // Function to calculate days between two dates
    function daysBetween(date1, date2) {
      const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
      const firstDate = new Date(date1);
      const secondDate = new Date(date2);
      
      // Calculate the difference in days
      return Math.round(Math.abs((firstDate - secondDate) / oneDay));
    }

    // Function to load user's currently borrowed books
    async function loadUserCurrentlyBorrowedBooks(username) {
      try {
        const tableBody = document.getElementById('userCurrentBorrowedTableBody');
        tableBody.innerHTML = '<tr><td colspan="5">Loading books...</td></tr>';
        
        // For demonstration, show sample data if the books table doesn't exist yet
        const { data: borrowedBooks, error } = await supabase
          .from('book_borrowings')
          .select('*')
          .eq('username', username)
          .eq('status', 'borrowed')
          .order('checkout_date', { ascending: false });
          
        if (error) {
          // If table doesn't exist yet, show demo data
          if (error.code === '42P01') { // relation does not exist
            showDemoData(tableBody, 'borrowed');
            return;
          }
          
          console.error('Error loading user borrowed books:', error);
          tableBody.innerHTML = '<tr><td colspan="5">Error loading books: ' + error.message + '</td></tr>';
          return;
        }
        
        if (!borrowedBooks || borrowedBooks.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="5">No books currently borrowed</td></tr>';
          return;
        }
        
        // Clear the table
        tableBody.innerHTML = '';
        
        // Get current date for overdue calculation
        const today = new Date();
        
        // Populate the table
        borrowedBooks.forEach(book => {
          const row = document.createElement('tr');
          
          // Check if book is overdue
          let isOverdue = false;
          let status = 'on-time';
          let statusText = 'On Time';
          
          if (book.due_date) {
            const dueDate = new Date(book.due_date);
            isOverdue = dueDate < today;
            
            if (isOverdue) {
              status = 'overdue';
              const daysOverdue = daysBetween(today, dueDate);
              statusText = `Overdue (${daysOverdue} days)`;
            }
          }
          
          row.innerHTML = `
            <td>${book.book_code || 'N/A'}</td>
            <td>${book.book_name || 'N/A'}</td>
            <td>${formatDate(book.checkout_date)}</td>
            <td>${formatDate(book.due_date)}</td>
            <td><span class="book-status ${status}">${statusText}</span></td>
          `;
          
          tableBody.appendChild(row);
        });
      } catch (err) {
        console.error('Unexpected error loading borrowed books:', err);
        const tableBody = document.getElementById('userCurrentBorrowedTableBody');
        tableBody.innerHTML = '<tr><td colspan="5">An unexpected error occurred: ' + err.message + '</td></tr>';
      }
    }

    // Function to load user's borrowing history
    async function loadUserBorrowingHistory(username) {
      try {
        const tableBody = document.getElementById('userHistoryTableBody');
        tableBody.innerHTML = '<tr><td colspan="5">Loading history...</td></tr>';
        
        // Get all book borrowings for this user (both returned and currently borrowed)
        const { data: borrowingHistory, error } = await supabase
          .from('book_borrowings')
          .select('*')
          .eq('username', username)
          .order('checkout_date', { ascending: false });
          
        if (error) {
          // If table doesn't exist yet, show demo data
          if (error.code === '42P01') { // relation does not exist
            showDemoData(tableBody, 'history');
            return;
          }
          
          console.error('Error loading borrowing history:', error);
          tableBody.innerHTML = '<tr><td colspan="5">Error loading history: ' + error.message + '</td></tr>';
          return;
        }
        
        if (!borrowingHistory || borrowingHistory.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="5">No borrowing history found</td></tr>';
          return;
        }
        
        // Clear the table
        tableBody.innerHTML = '';
        
        // Get current date for status calculation
        const today = new Date();
        
        // Populate the table
        borrowingHistory.forEach(book => {
          const row = document.createElement('tr');
          
          // Determine status class and text
          let status = '';
          let statusText = '';
          
          if (book.status === 'returned') {
            status = 'returned';
            statusText = 'Returned';
          } else {
            // Check if overdue
            if (book.due_date) {
              const dueDate = new Date(book.due_date);
              const isOverdue = dueDate < today;
              
              if (isOverdue) {
                status = 'overdue';
                const daysOverdue = daysBetween(today, dueDate);
                statusText = `Overdue (${daysOverdue} days)`;
              } else {
                status = 'on-time';
                statusText = 'Borrowed';
              }
            } else {
              status = 'on-time';
              statusText = 'Borrowed';
            }
          }
          
          row.innerHTML = `
            <td>${book.book_code || 'N/A'}</td>
            <td>${book.book_name || 'N/A'}</td>
            <td>${formatDate(book.checkout_date)}</td>
            <td>${formatDate(book.return_date) || 'Not returned'}</td>
            <td><span class="book-status ${status}">${statusText}</span></td>
          `;
          
          tableBody.appendChild(row);
        });
      } catch (err) {
        console.error('Unexpected error loading borrowing history:', err);
        const tableBody = document.getElementById('userHistoryTableBody');
        tableBody.innerHTML = '<tr><td colspan="5">An unexpected error occurred: ' + err.message + '</td></tr>';
      }
    }

    // Function to show demo data if the database table doesn't exist yet
    function showDemoData(tableBody, type) {
      if (type === 'borrowed') {
        tableBody.innerHTML = `
          <tr>
            <td>BOOK123</td>
            <td>Programming in JavaScript</td>
            <td>${formatDate(new Date(new Date().setDate(new Date().getDate() - 10)))}</td>
            <td>${formatDate(new Date(new Date().setDate(new Date().getDate() + 10)))}</td>
            <td><span class="book-status on-time">On Time</span></td>
          </tr>
          <tr>
            <td>BOOK456</td>
            <td>Database Systems</td>
            <td>${formatDate(new Date(new Date().setDate(new Date().getDate() - 30)))}</td>
            <td>${formatDate(new Date(new Date().setDate(new Date().getDate() - 5)))}</td>
            <td><span class="book-status overdue">Overdue (5 days)</span></td>
          </tr>
        `;
      } else if (type === 'history') {
        tableBody.innerHTML = `
          <tr>
            <td>BOOK789</td>
            <td>Introduction to Web Design</td>
            <td>${formatDate(new Date(new Date().setDate(new Date().getDate() - 60)))}</td>
            <td>${formatDate(new Date(new Date().setDate(new Date().getDate() - 45)))}</td>
            <td><span class="book-status returned">Returned</span></td>
          </tr>
          <tr>
            <td>BOOK101</td>
            <td>Python for Beginners</td>
            <td>${formatDate(new Date(new Date().setDate(new Date().getDate() - 90)))}</td>
            <td>${formatDate(new Date(new Date().setDate(new Date().getDate() - 75)))}</td>
            <td><span class="book-status returned">Returned</span></td>
          </tr>
          <tr>
            <td>BOOK123</td>
            <td>Programming in JavaScript</td>
            <td>${formatDate(new Date(new Date().setDate(new Date().getDate() - 10)))}</td>
            <td>Not returned</td>
            <td><span class="book-status on-time">Borrowed</span></td>
          </tr>
        `;
      }
    }

    // Modify the original loadUsers function to make rows clickable
    const originalLoadUsers = window.loadUsers;
    
    // Only override if the original function exists
    if (typeof originalLoadUsers === 'function') {
      window.loadUsers = function(supabase) {
        // Call the original function
        originalLoadUsers(supabase);
        
        // Make rows clickable after a short delay to ensure table is populated
        setTimeout(() => {
          makeUsersTableRowsClickable();
        }, 500);
      };
    } else {
      // If the original function doesn't exist, set up our own
      window.loadUsers = async function(supabase) {
        try {
          // Show loading state
          const userTableBody = document.getElementById('userTableBody');
          if (!userTableBody) return;
          
          userTableBody.innerHTML = '<tr><td colspan="6">Loading users...</td></tr>';
          
          // Fetch users from Supabase
          const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .order('id', { ascending: true });
            
          if (error) {
            console.error('Error fetching users:', error);
            userTableBody.innerHTML = '<tr><td colspan="6">Error loading users: ' + error.message + '</td></tr>';
            return;
          }
          
          // Clear the table body
          userTableBody.innerHTML = '';
          
          // Check if we have users
          if (!users || users.length === 0) {
            userTableBody.innerHTML = '<tr><td colspan="6">No users found.</td></tr>';
            return;
          }
          
          // Populate the table with user data
          users.forEach(user => {
            const row = document.createElement('tr');
            
            // Create full name by combining first and last name
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A';
            
            // Determine if user is active
            const isActive = user.is_active !== false; // Default to active if not specified
            
            // Format role
            const role = user.is_admin ? 'Admin' : 'User';
            
            row.innerHTML = `
              <td>${user.id || 'N/A'}</td>
              <td>${user.username || 'N/A'}</td>
              <td>${fullName}</td>
              <td>${user.email || 'N/A'}</td>
              <td>${role}</td>
              <td><span class="status ${isActive ? 'active' : 'inactive'}">${isActive ? 'Active' : 'Inactive'}</span></td>
            `;
            
            userTableBody.appendChild(row);
          });
          
          // Make rows clickable
          makeUsersTableRowsClickable();
          
        } catch (err) {
          console.error('Unexpected error loading users:', err);
          const userTableBody = document.getElementById('userTableBody');
          if (userTableBody) {
            userTableBody.innerHTML = 
              '<tr><td colspan="6">An unexpected error occurred: ' + err.message + '</td></tr>';
          }
        }
      };
    }

    // Initialize the users page if we're already on it
    const usersPage = document.getElementById('usersPage');
    if (usersPage && window.getComputedStyle(usersPage).display !== 'none') {
      // We're on the users page, load users
      window.loadUsers(supabase);
    }

    // Add event listener for the users link to ensure our enhancement runs
    usersLink.addEventListener('click', function() {
      // Wait a bit for the original handler to run
      setTimeout(() => {
        makeUsersTableRowsClickable();
      }, 500);
    });
  }
});