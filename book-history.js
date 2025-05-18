// Book History Management Functions
document.addEventListener('DOMContentLoaded', function() {
  // Add additional styles for the book history section
  const historyStyle = document.createElement('style');
  historyStyle.textContent = `
    .book-history-section {
      margin: 20px 0;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .history-tabs {
      display: flex;
      border-bottom: 1px solid #ddd;
      margin-bottom: 15px;
    }
    
    .tab-btn {
      padding: 10px 20px;
      border: none;
      background: none;
      border-bottom: 3px solid transparent;
      font-weight: bold;
      color: #666;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .tab-btn.active {
      border-bottom: 3px solid #901C1C;
      color: #901C1C;
    }
    
    .tab-btn:hover:not(.active) {
      background: #f5f5f5;
      color: #333;
    }
    
    .history-tab-content {
      display: none;
    }
    
    .history-tab-content.active {
      display: block;
    }
    
    .books-table-container {
      overflow-x: auto;
    }
    
    .books-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 600px;
    }
    
    .books-table th {
      background-color: #f2f2f2;
      padding: 12px 15px;
      text-align: left;
      font-weight: bold;
      color: #333;
      border-bottom: 2px solid #ddd;
    }
    
    .books-table td {
      padding: 10px 15px;
      border-bottom: 1px solid #ddd;
    }
    
    .books-table tr:hover {
      background-color: #f9f9f9;
    }
    
    .no-records {
      text-align: center;
      color: #666;
      font-style: italic;
    }
    
    .book-status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.85em;
      font-weight: bold;
    }
    
    .status-borrowed {
      background-color: #e3f2fd;
      color: #0d47a1;
    }
    
    .status-returned {
      background-color: #e8f5e9;
      color: #1b5e20;
    }
    
    .status-overdue {
      background-color: #ffebee;
      color: #b71c1c;
    }
  `;
  document.head.appendChild(historyStyle);
  
  // Reference to SUPABASE from the main script
  const supabaseUrl = 'https://xvxzvzzrgbsfdialxntu.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2eHp2enpyZ2JzZmRpYWx4bnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MDQ4ODEsImV4cCI6MjA2MjE4MDg4MX0.s_07EucARbv2GJKMo3HKatiodaqo9WNJO-k1vLkog5E';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  
  // Tab switching functionality
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.history-tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      this.classList.add('active');
      const tabId = this.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
      
      // Load data for the selected tab if needed
      loadBooksData(tabId);
    });
  });
  
  // Get current user function - reused from main script
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
  
  // Authenticate with Supabase - reused from main script
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
  
  // Format date for display
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  // Calculate days overdue
  function calculateDaysOverdue(dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }
  
  // Calculate estimated fine (assuming $0.50 per day)
  function calculateFine(daysOverdue) {
    const ratePerDay = 0.50; // $0.50 per day
    return (daysOverdue * ratePerDay).toFixed(2);
  }
  
  // Fetch and display book data based on tab
  async function loadBooksData(tabId) {
    console.log(`Loading data for tab: ${tabId}`);
    
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.error('No user found, cannot load books');
      return;
    }
    
    // Authenticate with Supabase
    const authResult = await authenticateWithSupabase();
    if (!authResult.success) {
      console.error('Authentication failed, cannot load books');
      return;
    }
    
    try {
      const username = currentUser.username;
      
      switch(tabId) {
        case 'currently-borrowed':
          await loadBorrowedBooks(username);
          break;
        case 'returned':
          await loadReturnedBooks(username);
          break;
        case 'overdue':
          await loadOverdueBooks(username);
          break;
      }
    } catch (error) {
      console.error(`Error loading ${tabId} data:`, error);
      
      // Update the relevant table with error message
      const tableId = `${tabId.replace('currently-', '')}-books-list`;
      const tableBody = document.getElementById(tableId);
      if (tableBody) {
        const colSpan = tabId === 'overdue' ? 6 : 5;
        tableBody.innerHTML = `
          <tr class="no-records">
            <td colspan="${colSpan}">Error loading data. Please try again later.</td>
          </tr>
        `;
      }
    }
  }
  
  // Load currently borrowed books
  async function loadBorrowedBooks(username) {
    const tableBody = document.getElementById('borrowed-books-list');
    tableBody.innerHTML = `
      <tr class="no-records">
        <td colspan="5">Loading borrowed books...</td>
      </tr>
    `;
    
    const { data, error } = await supabase
      .from('book_borrowings')
      .select('*')
      .eq('username', username)
      .eq('status', 'borrowed')
      .order('checkout_date', { ascending: false });
      
    if (error) {
      console.error('Error fetching borrowed books:', error);
      tableBody.innerHTML = `
        <tr class="no-records">
          <td colspan="5">Error loading your borrowed books.</td>
        </tr>
      `;
      return;
    }
    
    if (!data || data.length === 0) {
      tableBody.innerHTML = `
        <tr class="no-records">
          <td colspan="5">You don't have any books currently borrowed.</td>
        </tr>
      `;
      return;
    }
    
    // Generate table rows for each borrowed book
    let tableRows = '';
    data.forEach(book => {
      tableRows += `
        <tr>
          <td>${book.book_code}</td>
          <td>${book.book_name}</td>
          <td>${formatDate(book.checkout_date)}</td>
          <td>${formatDate(book.due_date)}</td>
          <td><span class="book-status status-borrowed">Borrowed</span></td>
        </tr>
      `;
    });
    
    tableBody.innerHTML = tableRows;
  }
  
  // Load returned books
  async function loadReturnedBooks(username) {
    const tableBody = document.getElementById('returned-books-list');
    tableBody.innerHTML = `
      <tr class="no-records">
        <td colspan="5">Loading returned books...</td>
      </tr>
    `;
    
    const { data, error } = await supabase
      .from('book_borrowings')
      .select('*')
      .eq('username', username)
      .eq('status', 'returned')
      .order('return_date', { ascending: false });
      
    if (error) {
      console.error('Error fetching returned books:', error);
      tableBody.innerHTML = `
        <tr class="no-records">
          <td colspan="5">Error loading your returned books.</td>
        </tr>
      `;
      return;
    }
    
    if (!data || data.length === 0) {
      tableBody.innerHTML = `
        <tr class="no-records">
          <td colspan="5">You don't have any books previously returned.</td>
        </tr>
      `;
      return;
    }
    
    // Generate table rows for each returned book
    let tableRows = '';
    data.forEach(book => {
      tableRows += `
        <tr>
          <td>${book.book_code}</td>
          <td>${book.book_name}</td>
          <td>${formatDate(book.checkout_date)}</td>
          <td>${formatDate(book.return_date)}</td>
          <td><span class="book-status status-returned">Returned</span></td>
        </tr>
      `;
    });
    
    tableBody.innerHTML = tableRows;
  }
  
  // Load overdue books
  async function loadOverdueBooks(username) {
    const tableBody = document.getElementById('overdue-books-list');
    tableBody.innerHTML = `
      <tr class="no-records">
        <td colspan="6">Loading overdue books...</td>
      </tr>
    `;
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const { data, error } = await supabase
      .from('book_borrowings')
      .select('*')
      .eq('username', username)
      .eq('status', 'borrowed')
      .lt('due_date', today) // Only books where due_date is less than today
      .order('due_date', { ascending: true });
      
    if (error) {
      console.error('Error fetching overdue books:', error);
      tableBody.innerHTML = `
        <tr class="no-records">
          <td colspan="6">Error loading your overdue books.</td>
        </tr>
      `;
      return;
    }
    
    if (!data || data.length === 0) {
      tableBody.innerHTML = `
        <tr class="no-records">
          <td colspan="6">You don't have any overdue books.</td>
        </tr>
      `;
      return;
    }
    
    // Generate table rows for each overdue book
    let tableRows = '';
    data.forEach(book => {
      const daysOverdue = calculateDaysOverdue(book.due_date);
      const estimatedFine = calculateFine(daysOverdue);
      
      tableRows += `
        <tr>
          <td>${book.book_code}</td>
          <td>${book.book_name}</td>
          <td>${formatDate(book.checkout_date)}</td>
          <td>${formatDate(book.due_date)}</td>
          <td>${daysOverdue} days</td>
          <td>$${estimatedFine}</td>
        </tr>
      `;
    });
    
    tableBody.innerHTML = tableRows;
  }
  
  // Initialize book history section when borrowing page is shown
  function initBookHistory() {
    // Check if user is on borrowing page
    const borrowingPage = document.getElementById('borrowingPage');
    const borrowingLink = document.getElementById('borrowingLink');
    
    // If borrowing page is shown, load the initial data
    if (borrowingPage && window.getComputedStyle(borrowingPage).display !== 'none') {
      loadBooksData('currently-borrowed'); // Default to borrowed books tab
    }
    
    // Set up event handler for when user clicks borrowing link
    if (borrowingLink) {
      borrowingLink.addEventListener('click', function() {
        // Small delay to ensure the page is rendered
        setTimeout(() => {
          loadBooksData('currently-borrowed');
        }, 100);
      });
    }
  }
  
  // Call once to initialize book history
  initBookHistory();
  
  // Re-initialize when a book is borrowed or returned
  const actionButtons = document.querySelectorAll('.action-btn');
  actionButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Wait for the operation to complete
      setTimeout(() => {
        // Refresh the active tab data
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
          const tabId = activeTab.getAttribute('data-tab');
          loadBooksData(tabId);
        }
      }, 2000); // Allow time for the database operation to complete
    });
  });
});