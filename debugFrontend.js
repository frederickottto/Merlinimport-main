// Debug script for browser console
// Run this in the browser console on the tender detail page

console.log('=== DEBUGGING TENDER DETAIL VIEW ===');

// Get the tender data from the page
const tenderId = window.location.pathname.split('/').pop();
console.log('Tender ID from URL:', tenderId);

// Check if we can access the tRPC client
if (window.__NEXT_DATA__) {
  console.log('Next.js data available');
}

// Try to find the DetailView component
const detailView = document.querySelector('[data-testid="detail-view"]') || 
                  document.querySelector('.detail-view') ||
                  document.querySelector('[class*="DetailView"]');

console.log('DetailView element found:', !!detailView);

// Look for status field in the DOM
const statusField = document.querySelector('p:contains("Status")') || 
                   Array.from(document.querySelectorAll('p')).find(p => p.textContent.includes('Status'));

console.log('Status field found:', !!statusField);

if (statusField) {
  console.log('Status field text:', statusField.textContent);
  console.log('Status field HTML:', statusField.innerHTML);
  
  // Find the next element (should be the status value)
  const statusValue = statusField.nextElementSibling;
  console.log('Status value element:', statusValue);
  if (statusValue) {
    console.log('Status value text:', statusValue.textContent);
    console.log('Status value HTML:', statusValue.innerHTML);
  }
}

// Look for any elements containing "nicht angeboten"
const nichtAngebotenElements = Array.from(document.querySelectorAll('*')).filter(el => 
  el.textContent && el.textContent.includes('nicht angeboten')
);

console.log('Elements containing "nicht angeboten":', nichtAngebotenElements.length);
nichtAngebotenElements.forEach((el, index) => {
  console.log(`Element ${index}:`, el.textContent.trim());
});

// Check for any React components
const reactRoot = document.querySelector('#__next') || document.querySelector('#root');
console.log('React root found:', !!reactRoot);

// Look for any data attributes that might contain tender data
const dataElements = document.querySelectorAll('[data-*]');
console.log('Elements with data attributes:', dataElements.length);

// Check if there are any console errors
console.log('=== END DEBUG ==='); 