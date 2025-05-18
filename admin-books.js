// Enhanced Admin Books Management Script
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Supabase client
  const supabaseUrl = 'https://xvxzvzzrgbsfdialxntu.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2eHp2enpyZ2JzZmRpYWx4bnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MDQ4ODEsImV4cCI6MjA2MjE4MDg4MX0.s_07EucARbv2GJKMo3HKatiodaqo9WNJO-k1vLkog5E';
  
  // Fix: Use supabaseClient from global scope instead of window.supabase
  const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

  // Check if this is the admin page
  const booksRequestedLink = document.getElementById('booksRequestedLink');
  if (!booksRequestedLink) {
    // Not admin page, exit
    console.log('Not on admin page, exiting admin-books.js');
    return;
  }

  console.log('Admin books management script initialized');

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

  // Function to update currently borrowed books table
  async function updateCurrentlyBorrowedTable() {
    try {
      const borrowedTableBody = document.getElementById('currentlyBorrowedTableBody');
      if (!borrowedTableBody) {
        console.error('Currently borrowed table body not found');
        return;
      }

      // Show loading state
      borrowedTableBody.innerHTML = '<tr><td colspan="6">Loading currently borrowed books...</td></tr>';
      
      // Fetch borrowed books that haven't been returned
      const { data: borrowedBooks, error } = await supabase
        .from('book_borrowings')
        .select('*')
        .eq('status', 'borrowed')
        .order('checkout_date', { ascending: false });
        
      if (error) {
        console.error('Error loading borrowed books:', error);
        borrowedTableBody.innerHTML = '<tr><td colspan="6">Error loading data: ' + error.message + '</td></tr>';
        return;
      }
      
      // Clear the table
      borrowedTableBody.innerHTML = '';
      
      // Check if we have any borrowed books
      if (!borrowedBooks || borrowedBooks.length === 0) {
        borrowedTableBody.innerHTML = '<tr><td colspan="6">No books currently borrowed</td></tr>';
        return;
      }
      
      // Filter out overdue books (those will be shown in the overdue section)
      const today = new Date();
      const currentlyBorrowed = borrowedBooks.filter(book => {
        if (!book.due_date) return true; // If no due date, keep in this list
        return new Date(book.due_date) >= today;
      });
      
      if (currentlyBorrowed.length === 0) {
        borrowedTableBody.innerHTML = '<tr><td colspan="6">No books currently borrowed (on time)</td></tr>';
        return;
      }
      
      // Populate the table
      currentlyBorrowed.forEach(book => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${book.book_code || 'N/A'}</td>
          <td>${book.book_name || 'N/A'}</td>
          <td>${book.username || 'N/A'}</td>
          <td>${book.full_name || 'N/A'}</td>
          <td>${formatDate(book.checkout_date)}</td>
          <td>${book.department || 'N/A'}</td>
        `;
        
        borrowedTableBody.appendChild(row);
      });
      
    } catch (err) {
      console.error('Unexpected error loading borrowed books:', err);
      const borrowedTableBody = document.getElementById('currentlyBorrowedTableBody');
      if (borrowedTableBody) {
        borrowedTableBody.innerHTML = '<tr><td colspan="6">An unexpected error occurred: ' + err.message + '</td></tr>';
      }
    }
  }

  // Function to update overdue books table
  async function updateOverdueTable() {
    try {
      const overdueTableBody = document.getElementById('overdueTableBody');
      if (!overdueTableBody) {
        console.error('Overdue table body not found');
        return;
      }

      // Show loading state
      overdueTableBody.innerHTML = '<tr><td colspan="8">Loading overdue books...</td></tr>';
      
      // Fetch borrowed books that haven't been returned
      const { data: borrowedBooks, error } = await supabase
        .from('book_borrowings')
        .select('*')
        .eq('status', 'borrowed')
        .order('due_date', { ascending: true }); // Order by due date to show oldest overdue first
        
      if (error) {
        console.error('Error loading borrowed books for overdue check:', error);
        overdueTableBody.innerHTML = '<tr><td colspan="8">Error loading data: ' + error.message + '</td></tr>';
        return;
      }
      
      // Clear the table
      overdueTableBody.innerHTML = '';
      
      // Check if we have any borrowed books
      if (!borrowedBooks || borrowedBooks.length === 0) {
        overdueTableBody.innerHTML = '<tr><td colspan="8">No borrowed books to check for overdue</td></tr>';
        return;
      }
      
      // Filter to only show overdue books
      const today = new Date();
      const overdueBooks = borrowedBooks.filter(book => {
        if (!book.due_date) return false; // Skip if no due date
        return new Date(book.due_date) < today;
      });
      
      if (overdueBooks.length === 0) {
        overdueTableBody.innerHTML = '<tr><td colspan="8">No overdue books</td></tr>';
        return;
      }
      
      // Populate the table
      overdueBooks.forEach(book => {
        const row = document.createElement('tr');
        
        // Calculate days overdue
        const dueDate = new Date(book.due_date);
        const daysOverdue = daysBetween(today, dueDate);
        
        row.innerHTML = `
          <td>${book.book_code || 'N/A'}</td>
          <td>${book.book_name || 'N/A'}</td>
          <td>${book.username || 'N/A'}</td>
          <td>${book.full_name || 'N/A'}</td>
          <td>${formatDate(book.checkout_date)}</td>
          <td>${formatDate(book.due_date)}</td>
          <td><span class="days-overdue">${daysOverdue}</span></td>
          <td>${book.department || 'N/A'}</td>
        `;
        
        overdueTableBody.appendChild(row);
      });
      
      // Update the stats for overdue books
      const overdueCountElement = document.querySelector('.overdue-count');
      if (overdueCountElement) {
        overdueCountElement.textContent = overdueBooks.length;
      }
      
    } catch (err) {
      console.error('Unexpected error loading overdue books:', err);
      const overdueTableBody = document.getElementById('overdueTableBody');
      if (overdueTableBody) {
        overdueTableBody.innerHTML = '<tr><td colspan="8">An unexpected error occurred: ' + err.message + '</td></tr>';
      }
    }
  }

  // Function to update books returned table
  async function updateBooksReturnedTable() {
    try {
      const returnedTableBody = document.getElementById('returnedTableBody');
      if (!returnedTableBody) {
        console.error('Returned books table body not found');
        return;
      }

      // Show loading state
      returnedTableBody.innerHTML = '<tr><td colspan="6">Loading returned books...</td></tr>';
      
      // Fetch returned books
      const { data: returnedBooks, error } = await supabase
        .from('book_borrowings')
        .select('*')
        .eq('status', 'returned')
        .order('return_date', { ascending: false });
        
      if (error) {
        console.error('Error loading returned books:', error);
        returnedTableBody.innerHTML = '<tr><td colspan="6">Error loading data: ' + error.message + '</td></tr>';
        return;
      }
      
      // Clear the table
      returnedTableBody.innerHTML = '';
      
      // Check if we have any returned books
      if (!returnedBooks || returnedBooks.length === 0) {
        returnedTableBody.innerHTML = '<tr><td colspan="6">No books have been returned yet</td></tr>';
        return;
      }
      
      // Populate the table
      returnedBooks.forEach(book => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${book.book_code || 'N/A'}</td>
          <td>${book.book_name || 'N/A'}</td>
          <td>${book.username || 'N/A'}</td>
          <td>${book.full_name || 'N/A'}</td>
          <td>${formatDate(book.return_date)}</td>
          <td>${book.department || 'N/A'}</td>
        `;
        
        returnedTableBody.appendChild(row);
      });
      
    } catch (err) {
      console.error('Unexpected error loading returned books:', err);
      const returnedTableBody = document.getElementById('returnedTableBody');
      if (returnedTableBody) {
        returnedTableBody.innerHTML = '<tr><td colspan="6">An unexpected error occurred: ' + err.message + '</td></tr>';
      }
    }
  }

  // Function to update all books stats
  async function updateBooksStats() {
    try {
      // Get total count of all books (both borrowed and returned)
      const { count: totalBooks, error: totalError } = await supabase
        .from('book_borrowings')
        .select('*', { count: 'exact', head: true });
        
      if (totalError === null) {
        // Update books count in dashboard
        const booksCountElement = document.querySelectorAll('.stat-value')[1];
        if (booksCountElement) {
          booksCountElement.textContent = totalBooks || 0;
        }
      } else {
        console.error('Error fetching total books count:', totalError);
      }
      
      // Get count of currently borrowed books
      const { count: borrowedCount, error: borrowedError } = await supabase
        .from('book_borrowings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'borrowed');
        
      if (borrowedError === null) {
        // Update requested books count
        const requestedBooksCountElement = document.querySelectorAll('.stat-value')[2];
        if (requestedBooksCountElement) {
          requestedBooksCountElement.textContent = borrowedCount || 0;
        }
      } else {
        console.error('Error fetching borrowed books count:', borrowedError);
      }
      
      // Get count of overdue books
      const { data: borrowedBooks, error: overdueFetchError } = await supabase
        .from('book_borrowings')
        .select('*')
        .eq('status', 'borrowed');
        
      if (overdueFetchError === null && borrowedBooks) {
        const today = new Date();
        const overdueBooks = borrowedBooks.filter(book => {
          if (!book.due_date) return false;
          return new Date(book.due_date) < today;
        });
        
        // If we have a stats element for overdue, update it
        const overdueStatsElement = document.querySelector('.overdue-count');
        if (overdueStatsElement) {
          overdueStatsElement.textContent = overdueBooks.length;
        }
      } else {
        console.error('Error fetching overdue books count:', overdueFetchError);
      }
    } catch (err) {
      console.error('Error updating books stats:', err);
    }
  }

  // Function to check if we're on the books requested page
  function isOnBooksRequestedPage() {
    const booksRequestedPage = document.getElementById('booksRequestedPage');
    return booksRequestedPage && booksRequestedPage.style.display === 'block';
  }

  // Add event listener to the books requested link
  booksRequestedLink.addEventListener('click', function() {
    console.log('Books Requested link clicked, updating tables');
    // Update all tables when the page is clicked
    updateCurrentlyBorrowedTable();
    updateOverdueTable();
    updateBooksReturnedTable();
    updateBooksStats();
  });

  // Also update when the dashboard is loaded
  const dashboardLink = document.getElementById('dashboardLink');
  if (dashboardLink) {
    dashboardLink.addEventListener('click', function() {
      console.log('Dashboard link clicked, updating stats');
      updateBooksStats();
    });
  }

  // Set up real-time subscription for all book borrowing activities
  const setupRealtimeSubscriptions = async () => {
    try {
      // Subscribe to book returns (updates where status changes to 'returned')
      const returnSubscription = supabase
        .channel('book_returns')
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'book_borrowings',
            filter: 'status=eq.returned' 
          }, 
          (payload) => {
            console.log('Book return detected:', payload);
            
            // Only update if we're on the books requested page to avoid unnecessary updates
            if (isOnBooksRequestedPage()) {
              // Update all tables
              updateCurrentlyBorrowedTable();
              updateOverdueTable();
              updateBooksReturnedTable();
            }
            
            // Always update stats on the dashboard
            updateBooksStats();
          }
        )
        .subscribe();
      
      console.log('Realtime subscription set up for book returns');
      
      // Subscribe to new book checkouts (new insertions)
      const checkoutSubscription = supabase
        .channel('book_checkouts')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'book_borrowings' 
          }, 
          (payload) => {
            console.log('New book checkout detected:', payload);
            
            // Only update if we're on the books requested page
            if (isOnBooksRequestedPage()) {
              updateCurrentlyBorrowedTable();
              updateOverdueTable();
            }
            
            // Always update stats on the dashboard
            updateBooksStats();
          }
        )
        .subscribe();
      
      console.log('Realtime subscription set up for new book checkouts');
      
      // Subscribe to due date updates
      const dueDateSubscription = supabase
        .channel('due_date_updates')
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'book_borrowings'
          }, 
          (payload) => {
            console.log('Book record updated:', payload);
            
            // Only update if we're on the books requested page
            if (isOnBooksRequestedPage()) {
              updateCurrentlyBorrowedTable();
              updateOverdueTable();
            }
            
            // Always update stats on the dashboard
            updateBooksStats();
          }
        )
        .subscribe();
      
      console.log('Realtime subscription set up for due date updates');
      
    } catch (err) {
      console.error('Error setting up realtime subscriptions:', err);
    }
  };

  // Set up polling as a fallback in case realtime doesn't work
  const setupPolling = () => {
    // Poll every 30 seconds to check for updates
    setInterval(() => {
      console.log('Polling for updates');
      
      // Only update tables if we're on the books requested page
      if (isOnBooksRequestedPage()) {
        updateCurrentlyBorrowedTable();
        updateOverdueTable();
        updateBooksReturnedTable();
      }
      
      // Always update stats
      updateBooksStats();
    }, 30000); // 30 seconds
    
    console.log('Polling mechanism set up as fallback');
  };

  // Initialize everything when the page loads
  const initializePage = () => {
    // Set up realtime subscriptions
    setupRealtimeSubscriptions();
    
    // Set up polling as a fallback
    setupPolling();
    
    // If we're already on the books requested page, load initial data
    if (isOnBooksRequestedPage()) {
      updateCurrentlyBorrowedTable();
      updateOverdueTable();
      updateBooksReturnedTable();
    }
    
    // Always update stats
    updateBooksStats();
  };

  // Run initialization with a slight delay to ensure DOM is fully loaded
  setTimeout(initializePage, 300);
});